package embeddings

import (
	"bufio"
	"fmt"
	"math"
	"os"
	"strings"
	"sync"
	"unicode"

	ort "github.com/yalue/onnxruntime_go"
)

// Version changes whenever model, tokenizer or pooling changes; old vectors must never be mixed.
const Version = "Xenova/all-MiniLM-L6-v2-quantized-wordpiece-mean-v1"
const maxTokens = 128

type Model struct {
	vocab   map[string]int64
	session *ort.DynamicAdvancedSession
	mu      sync.Mutex
}

func NewModel(modelPath, vocabPath, libPath string) (*Model, error) {
	file, err := os.Open(vocabPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	vocab := map[string]int64{}
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		vocab[scanner.Text()] = int64(len(vocab))
	}
	if err = scanner.Err(); err != nil {
		return nil, err
	}
	for _, token := range []string{"[CLS]", "[SEP]", "[UNK]"} {
		if _, ok := vocab[token]; !ok {
			return nil, fmt.Errorf("missing tokenizer token %s", token)
		}
	}
	ort.SetSharedLibraryPath(libPath)
	if err = ort.InitializeEnvironment(); err != nil {
		return nil, err
	}
	session, err := ort.NewDynamicAdvancedSession(modelPath, []string{"input_ids", "attention_mask", "token_type_ids"}, []string{"last_hidden_state"}, nil)
	if err != nil {
		ort.DestroyEnvironment()
		return nil, err
	}
	return &Model{vocab: vocab, session: session}, nil
}
func (m *Model) Close() { m.session.Destroy(); ort.DestroyEnvironment() }

func (m *Model) tokens(text string) []int64 {
	ids := []int64{m.vocab["[CLS]"]}
	// BERT basic tokenizer: lowercase, split punctuation, and perform greedy WordPiece.
	var word []rune
	flush := func() {
		if len(word) == 0 {
			return
		}
		s := string(word)
		word = nil
		if id, ok := m.vocab[s]; ok {
			ids = append(ids, id)
			return
		}
		runes := []rune(s)
		if len(runes) > 100 {
			ids = append(ids, m.vocab["[UNK]"])
			return
		}
		var pieces []int64
		for start := 0; start < len(runes); {
			found := false
			for end := len(runes); end > start; end-- {
				part := string(runes[start:end])
				if start > 0 {
					part = "##" + part
				}
				if id, ok := m.vocab[part]; ok {
					pieces = append(pieces, id)
					start = end
					found = true
					break
				}
			}
			if !found {
				ids = append(ids, m.vocab["[UNK]"])
				return
			}
		}
		ids = append(ids, pieces...)
	}
	for _, r := range strings.ToLower(text) {
		if unicode.IsSpace(r) {
			flush()
		} else if unicode.IsPunct(r) || unicode.IsSymbol(r) {
			flush()
			word = []rune{r}
			flush()
		} else {
			word = append(word, r)
		}
	}
	flush()
	if len(ids) > maxTokens-1 {
		ids = ids[:maxTokens-1]
	}
	return append(ids, m.vocab["[SEP]"])
}

func (m *Model) Embed(text string) ([]float32, error) {
	m.mu.Lock()
	defer m.mu.Unlock() // session is shared between HTTP requests and indexing
	ids := m.tokens(text)
	length := len(ids)
	mask := make([]int64, length)
	segments := make([]int64, length)
	for i := range mask {
		mask[i] = 1
	}
	shape := ort.NewShape(1, int64(length))
	input, err := ort.NewTensor(shape, ids)
	if err != nil {
		return nil, err
	}
	defer input.Destroy()
	attention, err := ort.NewTensor(shape, mask)
	if err != nil {
		return nil, err
	}
	defer attention.Destroy()
	types, err := ort.NewTensor(shape, segments)
	if err != nil {
		return nil, err
	}
	defer types.Destroy()
	outputs := []ort.Value{nil}
	if err = m.session.Run([]ort.Value{input, attention, types}, outputs); err != nil {
		return nil, err
	}
	defer outputs[0].Destroy()
	hidden, ok := outputs[0].(*ort.Tensor[float32])
	if !ok {
		return nil, fmt.Errorf("unexpected MiniLM output type %T", outputs[0])
	}
	data := hidden.GetData()
	if len(data) != length*384 {
		return nil, fmt.Errorf("unexpected MiniLM output shape: %d", len(data))
	}
	vec := make([]float32, 384)
	for i := 0; i < length; i++ {
		for j := 0; j < 384; j++ {
			vec[j] += data[i*384+j]
		}
	}
	norm := float64(0)
	for j := range vec {
		vec[j] /= float32(length)
		norm += float64(vec[j] * vec[j])
	}
	if norm == 0 {
		return nil, fmt.Errorf("zero vector")
	}
	for j := range vec {
		vec[j] /= float32(math.Sqrt(norm))
	}
	return vec, nil
}

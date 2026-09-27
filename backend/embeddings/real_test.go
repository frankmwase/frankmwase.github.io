package embeddings

import "testing"

func TestWordPieceAndLimits(t *testing.T) {
	m := Model{vocab: map[string]int64{"[CLS]": 101, "[SEP]": 102, "[UNK]": 100, "mobile": 1, "money": 2, "pay": 3, "##ments": 4}}
	got := m.tokens("Mobile payments money")
	want := []int64{101, 1, 3, 4, 2, 102}
	if len(got) != len(want) {
		t.Fatalf("got %v", got)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("got %v, want %v", got, want)
		}
	}
	long := ""
	for i := 0; i < 200; i++ {
		long += "money "
	}
	if len(m.tokens(long)) != maxTokens {
		t.Fatal("token limit not enforced")
	}
}

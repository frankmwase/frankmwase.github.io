FROM golang:1.24-bookworm AS builder
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=1 go build -o portfolio-api .

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/portfolio-api .
COPY backend/onnxruntime-linux-x64-1.17.1/lib/libonnxruntime.so.1.17.1 /usr/lib/libonnxruntime.so.1.17.1
RUN ln -s libonnxruntime.so.1.17.1 /usr/lib/libonnxruntime.so && ldconfig
COPY src/data/knowledge-graph.json /app/knowledge-graph.json
# Checked artifacts from the same MiniLM repository; changing either requires a new embedding version.
RUN mkdir -p /app/models && \
    curl -fLsS --retry 3 -o /app/models/model.onnx https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/onnx/model_quantized.onnx && \
    echo 'afdb6f1a0e45b715d0bb9b11772f032c399babd23bfc31fed1c170afc848bdb1  /app/models/model.onnx' | sha256sum -c - && \
    curl -fLsS --retry 3 -o /app/models/vocab.txt https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/vocab.txt && \
    echo '07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3  /app/models/vocab.txt' | sha256sum -c -
EXPOSE 3001
CMD ["./portfolio-api"]

FROM golang:1.24-bookworm AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y wget gcc g++ make

# Download and install ONNX Runtime C library
ENV ONNX_VERSION=1.17.1
RUN wget -q https://github.com/microsoft/onnxruntime/releases/download/v${ONNX_VERSION}/onnxruntime-linux-x64-${ONNX_VERSION}.tgz && \
    tar -xzf onnxruntime-linux-x64-${ONNX_VERSION}.tgz && \
    cp onnxruntime-linux-x64-${ONNX_VERSION}/lib/libonnxruntime.so* /usr/lib/ && \
    cp -r onnxruntime-linux-x64-${ONNX_VERSION}/include/* /usr/include/ && \
    ldconfig

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
# CGO must be enabled for onnxruntime-go
ENV CGO_ENABLED=1
RUN go build -o portfolio-api .

# Final stage
FROM debian:bookworm-slim

# Install runtime dependencies (ca-certificates for external API calls if any)
RUN apt-get update && apt-get install -y ca-certificates wget && rm -rf /var/lib/apt/lists/*

# Copy ONNX Runtime library from builder
COPY --from=builder /usr/lib/libonnxruntime.so* /usr/lib/
RUN ldconfig

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/portfolio-api .

# Download the model weights (this is a small 22MB model)
RUN mkdir -p /app/models
# For this implementation, we will assume the model is downloaded via a script or copied in.
# To keep the Docker image self-contained, we can download it here or handle it in Go.
# It's better to let Go handle downloading it on startup if missing, or we can wget it.
# We will download it in the Go code or provide it.
# Actually, let's just wget it into the image to speed up startup.
# RUN wget -qO /app/models/all-MiniLM-L6-v2.onnx "https://huggingface.co/bofenghuang/all-MiniLM-L6-v2-onnx/resolve/main/model.onnx?download=true"

EXPOSE 3001

CMD ["./portfolio-api"]

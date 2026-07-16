FROM ghcr.io/ggml-org/llama.cpp:server

USER root

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /models && \
    curl -L -o /models/llama3.2-3b-instruct-q4_K_M.gguf \
    https://huggingface.co

EXPOSE 8080

ENTRYPOINT ["/app/llama-server"]
CMD ["-m", "/models/llama3.2-3b-instruct-q4_K_M.gguf", "--host", "0.0.0.0", "--port", "8080"]

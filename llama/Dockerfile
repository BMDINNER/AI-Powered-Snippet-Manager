FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

RUN wget -O /tmp/llama-server.zip \
    https://github.com/ggerganov/llama.cpp/releases/download/b3792/llama-b3792-bin-ubuntu-x64.zip \
    && unzip /tmp/llama-server.zip -d /usr/local/bin/ \
    && chmod +x /usr/local/bin/llama-server \
    && rm /tmp/llama-server.zip

RUN mkdir -p /models && \
    wget -O /models/llama3.2-3b-instruct-q4_K_M.gguf \
    https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf

EXPOSE 8080

CMD ["llama-server", "-m", "/models/llama3.2-3b-instruct-q4_K_M.gguf", \
    "--host", "0.0.0.0", \
    "--port", "8080"]
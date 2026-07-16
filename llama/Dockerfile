FROM alpine:latest

RUN apk add --no-cache wget git build-base cmake

RUN git clone https://github.com/ggerganov/llama.cpp.git /llama.cpp
WORKDIR /llama.cpp
RUN make

RUN wget -O /models/llama3.2-3b-instruct-q4_K_M.gguf \
    https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf

EXPOSE 8080

CMD ["./llama.cpp/server", "-m", "/models/llama3.2-3b-instruct-q4_K_M.gguf", "--host", "0.0.0.0", "--port", "8080"]
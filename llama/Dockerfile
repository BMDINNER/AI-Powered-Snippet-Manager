FROM ghcr.io/ggerganov/llama.cpp:full

RUN wget -O /models/tinyllama.gguf \
    https://huggingface.co/TheBloke/TinyLlama-1.1B-GGUF/resolve/main/tinyllama-1.1b.Q4_K_M.gguf

CMD ["llama-server", "-m", "/models/tinyllama.gguf", "--host", "0.0.0.0", "--port", "8080"]
FROM ghcr.io/ggerganov/llama.cpp:server

EXPOSE 8080

RUN wget -O /models/llama3.2-3b-instruct-q4_K_M.gguf \
    https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf

CMD ["-m", "/models/llama3.2-3b-instruct-q4_K_M.gguf", \
    "--host", "0.0.0.0", \
    "--port", "8080", \
    "--n-gpu-layers", "-1"]
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    git \
    cmake \
    build-essential \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*


RUN git clone https://github.com/ggerganov/llama.cpp.git /llama.cpp
WORKDIR /llama.cpp
RUN mkdir build && cd build && cmake .. && make -j $(nproc) llama-server


RUN cp /llama.cpp/build/bin/llama-server /usr/local/bin/


RUN wget -O /models/llama3.2-3b-instruct-q4_K_M.gguf \
    https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf

EXPOSE 8080

CMD ["llama-server", "-m", "/models/llama3.2-3b-instruct-q4_K_M.gguf", "--host", "0.0.0.0", "--port", "8080"]
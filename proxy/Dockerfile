FROM nginx:1.25.3

# Cài đặt công cụ để tải module
RUN apt-get update && \
    apt-get install -y wget gnupg2 lsb-release debian-archive-keyring && \
    # Thêm key chính thức của Nginx
    wget -qO - https://nginx.org/keys/nginx_signing.key | gpg --dearmor | tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null && \
    # Thêm repo Nginx vào sources list
    echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/mainline/debian $(lsb_release -cs) nginx" | tee /etc/apt/sources.list.d/nginx.list && \
    apt-get update && \
    # Cài đặt module OpenTelemetry
    apt-get install -y nginx-module-otel

# Xóa config mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Copy file cấu hình của bạn
COPY nginx.conf /etc/nginx/nginx.conf
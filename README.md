# NodeJS Microservices - DevSecOps Pipeline

Dự án này là một hệ thống thương mại điện tử dựa trên kiến trúc microservices sử dụng NodeJS, tích hợp quy trình DevSecOps CI/CD hoàn chỉnh để đảm bảo hiệu suất, bảo mật và khả năng mở rộng.

## 🚀 Kiến Trúc Hệ Thống

Hệ thống bao gồm các dịch vụ chính sau:

- **Customer Service**: Quản lý thông tin người dùng và xác thực.
- **Products Service**: Quản lý danh mục sản phẩm.
- **Shopping Service**: Quản lý giỏ hàng và đơn hàng.
- **Gateway (Nginx Proxy)**: Điểm tiếp nhận yêu cầu duy nhất, định tuyến đến các dịch vụ tương ứng.
- **Message Broker (RabbitMQ)**: Giao tiếp bất đồng bộ giữa các microservices.
- **Database (MongoDB)**: Lưu trữ dữ liệu cho từng dịch vụ.
- **Observability**: Tích hợp Jaeger cho Distributed Tracing và OpenTelemetry.

## 🛡️ DevSecOps CI/CD Pipeline

Dự án tích hợp một pipeline CI/CD mạnh mẽ sử dụng **Jenkins** chạy trên **Kubernetes**, tập trung vào 3 tiêu chí: **Hiệu suất, Bảo mật và Quyền tối thiểu.**

### Các giai đoạn của Pipeline:
1.  **Checkout Code**: Tải mã nguồn từ repository.
2.  **Nodejs Audit & Unit Test**: 
    - Chạy `npm install` và `npm test`.
    - Kiểm tra lỗ hổng thư viện với `npm audit` (mức độ High/Critical).
3.  **Security Scan Source (Trivy)**: Quét mã nguồn và các tệp cấu hình để tìm lỗ hổng bảo mật.
4.  **Build & Push (Kaniko)**: 
    - Xây dựng Docker image trực tiếp trong Kubernetes cluster mà không cần đặc quyền root (Dockerless build).
    - Tự động đẩy Image lên Docker Hub với tag theo số bản build.

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Chạy cục bộ với Docker Compose
```bash
docker-compose up --build
```
Hệ thống sẽ khởi chạy các dịch vụ cùng với MongoDB, RabbitMQ và Jaeger.

### 2. Triển khai trên Kubernetes (Helm)
Dự án cung cấp Helm Chart tại thư mục `nt548-chart`.
```bash
helm install my-release ./nt548-chart
```

## 📈 Load Testing
Dự án sử dụng **k6** để thực hiện load test, giúp đánh giá khả năng chịu tải của hệ thống.
Script load test nằm trong thư mục `load-test/`.
```bash
k6 run load-test/load-test.js
```

## 🎯 Mục Tiêu Đồ Án
- Tối ưu hóa thời gian chạy pipeline và hỗ trợ chạy song song.
- Đảm bảo an toàn cho Server, không lộ thông tin nhạy cảm.
- Áp dụng nguyên tắc quyền tối thiểu cho Jenkins Controller và Worker.
- Triển khai pipeline đa môi trường (Staging, Production).
- Tích hợp Monitoring và Policy quản lý tham số pipeline.

## 📝 Hướng Phát Triển
- Triển khai hoàn toàn trên hạ tầng Cloud (AWS).
- Tự động hóa hạ tầng bằng Infrastructure as Code (Terraform, Ansible).
- Quản lý hạ tầng bằng GitOps.

---
*Dự án được phát triển trong khuôn khổ môn học NT548 - Chuyên đề nâng cao về mạng máy tính.*

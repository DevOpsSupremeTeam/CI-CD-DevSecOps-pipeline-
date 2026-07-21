# NodeJS Microservices - DevSecOps CI/CD Pipeline In Kubernetes

Dự án này là một hệ thống thương mại điện tử dựa trên kiến trúc microservices sử dụng NodeJS, tích hợp quy trình DevSecOps CI/CD hoàn chỉnh trên Kubernetes để đảm bảo hiệu suất, bảo mật và khả năng mở rộng.

## 🚀 Kiến Trúc Hệ Thống

Hệ thống bao gồm các dịch vụ chính sau:

- **Customer Service**: Quản lý thông tin người dùng và xác thực.
- **Products Service**: Quản lý danh mục sản phẩm.
- **Shopping Service**: Quản lý giỏ hàng và đơn hàng.
- **Ingress**: Điểm tiếp nhận yêu cầu duy nhất, định tuyến đến các dịch vụ tương ứng.
- **Message Broker (RabbitMQ)**: Giao tiếp bất đồng bộ giữa các microservices.
- **Database (MongoDB)**: Lưu trữ dữ liệu cho từng dịch vụ.
- **Traces**: Tích hợp Jaeger cho Distributed Tracing và OpenTelemetry.
- **Metrics**: Tích hợp Prometheus lấy dữ liệu metrics từ cluster và Visualize bằng Grafana

## 🛡️ DevSecOps CI/CD Pipeline 

Dự án tích hợp một pipeline CI/CD mạnh mẽ sử dụng **Jenkins** cho CI và **ArgoCD** cho CD chạy trên **Kubernetes**, tập trung vào 3 tiêu chí: **Hiệu suất, Bảo mật và Quyền tối thiểu.**

### Các giai đoạn của CI/CD Pipeline:
Quy trình CI bằng Jenkins:
1.  **Checkout Code**: Tải mã nguồn từ repository.
2.  **Nodejs Audit & Unit Test**: 
    - Chạy `npm install` và `npm test`.
    - Kiểm tra lỗ hổng thư viện với `npm audit` (mức độ High/Critical).
3.  **Security Scan Source (Trivy)**: Quét mã nguồn và các tệp cấu hình để tìm lỗ hổng bảo mật.
4.  **Build & Push (Kaniko)**: 
    - Xây dựng Docker image trực tiếp trong Kubernetes cluster mà không cần đặc quyền root (Dockerless build).
    - Tự động đẩy Image lên Docker Hub với tag theo số bản build.
5.  **Update Manifest**: Cập nhật tag image mới vào file manifest của service trong Helm Chart, sau đó push lại lên Repo
Quy trình CD bằng ArgoCD:
1.  **Detection and Pulling**: 
    - ArgoCD liên tục quan sát sự thay đổi của helm chart mỗi 3 phút
    - Nhận thấy sự khác biệt (OutOfSync) giữa trạng thái trong Git và trạng thái thực tế
2.  **Synchronize**: ArgoCD tự động thực hiện quá trình đồng bộ (Sync). Nó áp dụng các file manifest mới vào Kubernetes.
3.  **Health Check**: 
    - ArgoCD theo dõi quá trình triển khai (Rolling Update).
    - Nếu các Pod mới khởi chạy thành công và pass qua các đợt Health Check, quá trình deploy hoàn tất.


## 🛠️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Cài đặt Helm

Trước tiên, bạn cần cài đặt Helm (Package Manager cho Kubernetes):

**Trên Linux (Ubuntu/Debian):**
```bash
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
sudo apt-get install apt-transport-https --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```

### 2. Cài đặt các công cụ hỗ trợ qua Helm

Dự án sử dụng các công cụ Observability và CD sau:

#### a. Cài đặt Jaeger (Tracing)
Cài đặt Jaeger phiên bản All-in-one, sử dụng bộ nhớ RAM để lưu trữ (in-memory):
```bash
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm repo update
helm install jaeger jaegertracing/jaeger \
  --set allInOne.enabled=true \
  --set storage.type=none \
  --set allInOne.extraArgs."memory\.max-traces"=10000 \
  --set allInOne.resources.limits.memory=1Gi \
  --set allInOne.resources.requests.memory=512Mi
```

> **Ghi chú về tính toán tài nguyên:**
> Với giới hạn **1GB RAM**, Jaeger All-in-one có thể chứa trung bình khoảng **10,000 - 15,000 traces** (tùy thuộc vào số lượng spans mỗi trace). 
> - Trung bình 1 span tiêu tốn khoảng 0.5KB - 1KB. 
> - Nếu 1 trace có 10 spans (~10KB), thì 10,000 traces sẽ chiếm khoảng 100MB - 200MB cho dữ liệu thực tế, phần còn lại dành cho index và overhead của hệ thống. 
> - Do đó, mức **10,000 traces** là ngưỡng an toàn để Jaeger hoạt động ổn định trong giới hạn 1GB RAM mà không bị OOM (Out Of Memory).

#### b. Cài đặt Prometheus Stack (Monitoring)
Bao gồm Prometheus và Grafana để theo dõi hệ thống:
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack
```

#### c. Cài đặt ArgoCD (GitOps CD)
Sử dụng cho quy trình triển khai liên tục theo mô hình GitOps:
```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
helm install argocd argo/argo-cd --namespace argocd --create-namespace
```

#### d. Cài đặt Sealed Secrets (Quản lý Secret)
Dự án dùng [Sealed Secrets](https://github.com/bitnami/sealed-secrets) để mã hoá Secret trước khi commit vào Git, tránh lộ thông tin nhạy cảm dạng base64 như trước đây:
```bash
helm repo add sealed-secrets https://bitnami.github.io/sealed-secrets
helm repo update
helm install sealed-secrets-controller sealed-secrets/sealed-secrets --namespace kube-system
```

Sau khi controller đã chạy, cài `kubeseal` CLI trên máy có quyền truy cập cluster, rồi tạo Secret thật từ 2 file template trong `k8s-yaml/` (`secret.template.yaml`, `secret-general.template.yaml`):
```bash
kubectl create namespace nt548 --dry-run=client -o yaml | kubectl apply -f -

cp k8s-yaml/secret.template.yaml /tmp/secret.yaml
# sửa các giá trị CHANGE_ME_* trong /tmp/secret.yaml thành giá trị thật
kubeseal --format=yaml < /tmp/secret.yaml > k8s-yaml/sealed-secret.yaml
rm /tmp/secret.yaml

cp k8s-yaml/secret-general.template.yaml /tmp/secret-general.yaml
# sửa các giá trị CHANGE_ME_* trong /tmp/secret-general.yaml thành giá trị thật
kubeseal --format=yaml < /tmp/secret-general.yaml > k8s-yaml/sealed-secret-general.yaml
rm /tmp/secret-general.yaml

kubectl apply -f k8s-yaml/sealed-secret.yaml -f k8s-yaml/sealed-secret-general.yaml
```
File `sealed-secret*.yaml` sinh ra ở bước trên an toàn để commit vào Git — chỉ controller trong cluster gốc mới giải mã được. File `secret*.template.yaml` chỉ chứa placeholder nên cũng an toàn để commit.

### 3. Chạy cục bộ với Docker Compose
Mỗi service cần 1 file `.env.dev` chứa giá trị thật (không commit vào Git). Tạo từ file mẫu rồi điền giá trị:
```bash
cp customer/.env.dev.example customer/.env.dev
cp products/.env.dev.example products/.env.dev
cp shopping/.env.dev.example shopping/.env.dev
```
Sau đó chạy:
```bash
docker-compose up --build
```
Hệ thống sẽ khởi chạy các dịch vụ cùng với MongoDB, RabbitMQ và Jaeger.

### 4. Triển khai trên Kubernetes (Helm)
Dự án cung cấp Helm Chart tại thư mục `nt548-chart`. Trước khi cài, đảm bảo đã apply Sealed Secrets ở bước 2.d (namespace `nt548`).
```bash
helm install my-release ./nt548-chart --namespace nt548 --create-namespace
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
- Triển khai pipeline đa môi trường (Development, Staging, Production).
- Tích hợp Monitoring và Policy quản lý tham số pipeline.

## 📝 Hướng Phát Triển
- Triển khai hoàn toàn trên hạ tầng Cloud (AWS).
- Tự động hóa hạ tầng bằng Infrastructure as Code (Terraform, Ansible).


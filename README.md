# DEVSECOPS CI/CD PIPELINE
source code for this pipeline: 
link for kaniko:
https://oneuptime.com/blog/post/2026-02-08-how-to-use-docker-build-and-push-in-kubernetes-cicd/view

mục tiêu sắp tới cho đồ án:
1. tối ưu hóa pipeline trên 3 tiêu chí chính:
 - Hiệu suất cao
 Mục tiêu: pipeline chạy với thời gian ngắn, chạy được nhiều pipeline song song
 - bảo mật cao
 Mục tiêu: đảm bảo server không bị chiếm quyền kiểm soát, đảm bảo pipeline không lộ thông tin cá nhân ra ngoài,
 đảm bảo cấp quyền cho từng team và giới hạn quyền truy cập các pipeline.
 - Quyền tối thiểu
 Mục tiêu: đảm bảo jenkins controller và jenkins worker ở quyền tối thiểu.
2. tìm cách xây dựng 1 pipeline có thể triển khai trên 3 môi trường khác nhau.
3. thêm policy để chung 1 pipeline nhưng user có quyền khác nhau thì không được đổi param lung tung được.
4. triển khai trên cloud 

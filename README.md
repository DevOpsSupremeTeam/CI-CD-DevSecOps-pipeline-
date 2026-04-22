# NodeJS Microservice
NodeJS Microservice Architecture Example with realtime project


## Monolithic version link:

[Grocery Online Shopping App Monolithic](https://github.com/codergogoi/Grocery_Online_Shopping_App)

============================
</br>
What you can learn from this repository?
</br>
https://youtu.be/EXDkgjU8DDU
</br>
</br>
</br>

This is a practical source code of the NodeJS Microservice tutorial serise. Where we have split up a monolithic application into Microservices Architecture. The main goal of this repository is to provide an overview how the microservices architecture is working with nodejs and what is the complexity we need to resolve to achieve the outcome from an Monolithic architecture. 


============================
</br>
This repository is published for educational purpose only. If the concept of the business logic matching with any project belongs to any organization it may be a co-incident. The main purpose of this repository is only to educate people by contributing practical knowledge.
</br>

## Frontend Repository:

https://github.com/codergogoi/microservice-frontend

## POSTMAN Collection
</br>
https://github.com/codergogoi/Grocery_Online_Shopping_App/blob/master/online_shopping_monolithic/Microservices%20Tutorial.postman_collection.json

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

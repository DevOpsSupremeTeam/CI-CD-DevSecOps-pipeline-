folder worker này là cho những thành phần của jenkins
jenkins-rbac.yaml  phân quyền cho jenkins tạo pod trong cluster.
worker.yaml        được jenkinsfile tìm đến để biết pod template của worker và tiến hành tạo pod bên trong cluster
kaniko-secret.yaml giúp kaniko container tự động đăng nhập vào dockerhub
lưu ý: cái secret này nên bằng các nào đó đưa vào chỗ khác để đảm bảo an toàn trước khi merge với main


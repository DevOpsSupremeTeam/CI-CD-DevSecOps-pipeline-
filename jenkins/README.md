folder worker này là cho những thành phần của jenkins
jenkins-rbac.yaml  phân quyền cho jenkins tạo pod trong cluster.
worker.yaml        được jenkinsfile tìm đến để biết pod template của worker và tiến hành tạo pod bên trong cluster
kaniko-secret.yaml giúp kaniko container tự động đăng nhập vào dockerhub
lưu ý: cái secret này nên bằng các nào đó đưa vào chỗ khác để đảm bảo an toàn trước khi merge với main


## backup-jenkins.sh

Backup JENKINS_HOME. Chỉ giữ state thật, bỏ `war/`, `caches/`, `workspace/`,
`updates/`, `logs/` và binary plugin — Jenkins tự sinh lại được.
468MB → ~400KB.

```bash
./backup-jenkins.sh                    # -> ~/backups/jenkins/jenkins-<ts>.tar.gz
./backup-jenkins.sh /mnt/d/backups     # đổi nơi lưu
WITH_PLUGINS=1 ./backup-jenkins.sh     # kèm cả file .jpi (~150MB)
KEEP=10 ./backup-jenkins.sh            # giữ 10 bản thay vì 5 (mặc định)
```

Mỗi lần chạy tạo kèm `plugins-<ts>.txt` (107 plugin + version) để cài lại.

Archive chứa `secrets/` và `credentials.xml` → **không commit vào git**,
không đẩy lên storage công khai. Script đã `chmod 600`.

### Khôi phục

```bash
# 1. Dừng Jenkins trước, nếu không nó ghi đè lại file cũ khi shutdown
docker stop jenkins            # hoặc: sudo systemctl stop jenkins

# 2. Giữ lại bản hiện tại phòng khi restore hỏng
mv ~/jenkins_home ~/jenkins_home.old

# 3. Giải nén
tar -xzf ~/backups/jenkins/jenkins-<ts>.tar.gz -C ~/

# 4. Cài lại plugin theo danh sách
#    Cách nhanh: Manage Jenkins > Plugins > Advanced > paste plugins-<ts>.txt
#    Hoặc dùng CLI:
#      java -jar jenkins-cli.jar -s http://localhost:8080 \
#        install-plugin $(cut -d: -f1 plugins-<ts>.txt | tr '\n' ' ') -restart

# 5. Khởi động lại
docker start jenkins
```

Nếu credentials báo lỗi giải mã sau restore, nghĩa là `secrets/master.key`
hoặc `secrets/hudson.util.Secret` không khớp — phải restore đúng cặp
`secrets/` + `credentials.xml` từ cùng một archive.

### Chạy tự động

```bash
crontab -e
# 2h sáng mỗi ngày
0 2 * * * /home/catarena/CI-CD-DevSecOps-pipeline-/jenkins/backup-jenkins.sh >> /home/catarena/backups/jenkins/backup.log 2>&1
```

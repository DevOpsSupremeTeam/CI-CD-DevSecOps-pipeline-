pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command: ['sleep']
    args: ['9999999']
    volumeMounts:
    - name: kaniko-secret
      mountPath: /kaniko/.docker
  volumes:
  - name: kaniko-secret
    projected:
      sources:
      - secret:
          name:  # Tên Secret chứa DockerHub Auth của bạn
          items:
          - key: .dockerconfigjson
            path: config.json
"""
        }
    }

    parameters {
        choice(name: 'SERVICE_NAME', choices: ['customer', 'shopping', 'products', 'gateway', 'proxy'], description: 'Chọn service cần build')
        string(name: 'DOCKERHUB_REPO', defaultValue: 'catarena', description: 'Tên repository trên DockerHub')
    }

    environment {
        // Với Kaniko, chúng ta không dùng login bằng lệnh sh nữa mà dùng file config mount ở trên
        IMAGE_TAG = "latest"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push with Kaniko') {
            steps {
                container('kaniko') {
                    script {
                        def dockerfilePath = "${params.SERVICE_NAME}/Dockerfile"
                        def fullImageName = "${params.DOCKERHUB_REPO}/${params.SERVICE_NAME}:${IMAGE_TAG}"
                        
                        echo "Kaniko đang build và tự động đẩy image: ${fullImageName}"
                        
                        // Kaniko tự thực hiện cả build và push mà không cần Docker Daemon
                        sh """
                        /kaniko/executor --context `pwd` \
                            --dockerfile ${dockerfilePath} \
                            --destination ${fullImageName}
                        """
                    }
                }
            }
        }
    }
}
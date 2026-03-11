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
    - name: kaniko-secret-volume  # Tên này phải giống ở dưới
      mountPath: /kaniko/.docker
  volumes:
  - name: kaniko-secret-volume    # Tên này phải giống ở trên
    secret:
      secretName: regcred         # Tên Secret bạn đã tạo bằng lệnh kubectl
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
                        def dockerfilePath = "${params.SERVICE_NAME}.Dockerfile"
                        def fullImageName = "${params.DOCKERHUB_REPO}/${params.SERVICE_NAME}:${IMAGE_TAG}"
                        
                        echo "Kaniko đang build: ${fullImageName}"
                        
                        // Sử dụng đường dẫn tương đối . cho context
                        sh """
                        /kaniko/executor --context \$(pwd) \
                            --dockerfile ${dockerfilePath} \
                            --destination ${fullImageName}
                        """
                    }
                }
            }
        }
    }
}
pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: docker-cli
    image: docker:24.0.5-cli
    command: ['cat']
    tty: true
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-sock
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
"""
        }
    }

    parameters {
        choice(name: 'SERVICE_NAME', choices: ['customer', 'shopping', 'products', 'gateway', 'proxy'], description: 'Chọn service cần build')
        string(name: 'DOCKERHUB_REPO', defaultValue: 'catarena', description: 'Tên repository trên DockerHub')
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        IMAGE_TAG = "latest"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                container('docker-cli') {
                    script {
                        def dockerfilePath = "${params.SERVICE_NAME}.Dockerfile"
                        echo "Đang build image cho service: ${params.SERVICE_NAME} bằng file ${dockerfilePath}"
                        sh "docker build -t ${params.DOCKERHUB_REPO}/${params.SERVICE_NAME}:${IMAGE_TAG} -f ${dockerfilePath} ."
                    }
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                container('docker-cli') {
                    script {
                        sh "echo \$DOCKERHUB_CREDENTIALS_PSW | docker login -u \$DOCKERHUB_CREDENTIALS_USR --password-stdin"
                        sh "docker push ${params.DOCKERHUB_REPO}/${params.SERVICE_NAME}:${IMAGE_TAG}"
                        
                        echo "Đã đẩy thành công image ${params.SERVICE_NAME} lên DockerHub"
                    }
                }
            }
        }
    }
}
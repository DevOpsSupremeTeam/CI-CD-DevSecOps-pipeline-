pipeline {
    agent {
        kubernetes {
            yaml readTrusted('jenkins/worker.yaml')
        }
    }

    parameters {
        choice(name: 'SERVICE_NAME', choices: ['customer', 'shopping', 'products', 'gateway', 'proxy'], description: 'Chọn service cần build')
        string(name: 'DOCKERHUB_REPO', defaultValue: 'catarena', description: 'Tên repository trên DockerHub')
    }

    environment {
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Nodejs Audit & Unit Test') {
            steps {
                container('nodejs') {
                    script {
                        dir("${params.SERVICE_NAME}") {
                            echo "--- Đang chạy npm install cho ${params.SERVICE_NAME} ---"
                            sh 'npm install'
                            
                            echo "--- Đang chạy Security Audit ---"
                            sh 'npm audit --audit-level=high || true'
                            
                            echo "--- Đang chạy Unit Test ---"
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('Security Scan Source (Trivy)') {
            steps {
                container('trivy') {
                    echo "--- Quét lỗ hổng hệ thống và thư viện ---"
                    sh "trivy fs --severity HIGH,CRITICAL ${params.SERVICE_NAME}"
                }
            }
        }

        // stage('Scan Source Code (SonarQube)') {
        //     steps {
                
        //     }
        // }

        stage('Build & Push with Kaniko') {
            steps {
                container('kaniko') {
                    script {
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', 
                                                        usernameVariable: 'DOCKER_USER', 
                                                        passwordVariable: 'DOCKER_PASS')]) {
                            
                            def fullImageName = "${params.DOCKERHUB_REPO}/${params.SERVICE_NAME}:${env.IMAGE_TAG}"
                            
                            // 1. Tạo config.json an toàn hơn bằng cách dùng nháy đơn cho sh để tránh cảnh báo bảo mật
                            sh 'echo "{\\"auths\\":{\\"https://index.docker.io/v1/\\":{\\"auth\\":\\"\$(echo -n ${DOCKER_USER}:${DOCKER_PASS} | base64)\\"}}}" > /kaniko/.docker/config.json'

                            echo "--- Kaniko đang build & push: ${fullImageName} ---"

                            // 2. Sử dụng dấu nháy đơn cho toàn bộ block sh và dùng biến môi trường trực tiếp của Shell
                            // Chúng ta bọc các đường dẫn trong nháy kép để xử lý khoảng trắng (nếu có)
                            sh '''
                                /kaniko/executor --context "${WORKSPACE}/${SERVICE_NAME}" \
                                    --dockerfile "${WORKSPACE}/${SERVICE_NAME}/Dockerfile" \
                                    --destination "''' + fullImageName + '''" \
                                    --cache=true \
                                    --cache-repo="''' + params.DOCKERHUB_REPO + '''/kaniko-cache"
                            '''
                        }
                    }
                }
            }
        }
        // stage('Scan Image') {
        //     steps {

        //     }
        // }
    }

    post {
        success {
            echo "Build thành công service: ${params.SERVICE_NAME}"
        }
        failure {
            echo "Build thất bại, kiểm tra lại log của container tương ứng."
        }
    }
}
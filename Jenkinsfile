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
                            sh 'npm audit --audit-level=high'
                            
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

        stage('Build & Push with Kaniko') {
            steps {
                container('kaniko') {
                    script {
                        def fullImageName = "${params.DOCKERHUB_REPO}/${params.SERVICE_NAME}:${IMAGE_TAG}"
                        
                        echo "--- Kaniko đang build & push: ${fullImageName} ---"

                        sh """
                        /kaniko/executor --context ${env.WORKSPACE}/${params.SERVICE_NAME} \
                            --dockerfile ${env.WORKSPACE}/${params.SERVICE_NAME}/Dockerfile \
                            --destination ${fullImageName}
                        """ 
                    }
                }
            }
        }
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
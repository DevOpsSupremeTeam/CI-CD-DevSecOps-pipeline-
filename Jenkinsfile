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

        stage('Secret Scan (Gitleaks)') {
            steps {
                container('gitleaks') {
                    echo "--- Quét secret bị lộ trong source ---"
                    // --no-git: quét cây thư mục hiện tại (không đào lịch sử git)
                    // --redact: KHÔNG in giá trị secret ra log; --exit-code 1: có secret thì fail build
                    sh "gitleaks detect --source . --no-git --redact --exit-code 1 -v"
                }
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
                            sh "npm test -- --coverage --collectCoverageFrom='src/**/*.js'"
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

        stage('Scan Source Code (SonarQube)') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'      // khớp tên ở Manage Jenkins -> Tools
                    withSonarQubeEnv('SonarQube') {            // khớp tên server ở Manage Jenkins -> System -> SonarQube servers
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=DevSecOps -Dsonar.sources=${params.SERVICE_NAME} -Dsonar.javascript.lcov.reportPaths=${params.SERVICE_NAME}/coverage/lcov.info -Dsonar.exclusions=**/coverage/**,**/node_modules/**"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build & Push with Kaniko') {
            steps {
                container('kaniko') {
                    script {
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', 
                                                        usernameVariable: 'DOCKER_USER', 
                                                        passwordVariable: 'DOCKER_PASS')]) {
                            
                            def fullImageName = "${params.DOCKERHUB_REPO}/${params.SERVICE_NAME}:${env.IMAGE_TAG}"
                            
                            sh 'echo "{\\"auths\\":{\\"https://index.docker.io/v1/\\":{\\"auth\\":\\"\$(echo -n ${DOCKER_USER}:${DOCKER_PASS} | base64)\\"}}}" > /kaniko/.docker/config.json'

                            echo "--- Kaniko đang build & push: ${fullImageName} ---"

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
        stage('Scan Image') {
            steps {
                echo "--- Quét lỗ hổng image đã build ---"
                sh "trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 ${params.DOCKERHUB_REPO}/${params.SERVICE_NAME}:${env.IMAGE_TAG}"
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
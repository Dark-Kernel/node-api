pipeline {
    agent any
    stages {
        stage("Code"){
            steps{
                git url: "https://github.com/Dark-Kernel/node-api.git", branch: "master"
            }
        }
        stage("Build & test"){
            steps{
                sh "docker build . -t node-api"
            }
        }
        stage("Push to repo"){
            steps{
                withCredentials([usernamePassword(credentialsId:"dockerhubid", passwordVariable:"dockerhubidPass", usernameVariable:"dockerhubidUser")]){
                    sh "docker login -u ${env.dockerhubidUser} -p ${env.dockerhubidPass}"
                    sh "docker tag node-api ${env.dockerhubidUser}/node-api:latest"
                    sh "docker push ${env.dockerhubidUser}/node-api:latest"
                }
                echo "Pushed to docker hub registry"
                
            }
        }
        stage("Deploy"){
            steps{
                sh "docker-compose down && docker-compose up -d"
                echo "Deployed to ec2"
            }
        }
    }
}

pipeline {
    agent any
    options {
        timeout(time: 10, unit: 'MINUTES') 
    }
    stages {
        stage('Build') {
            steps {
                // Building the docker image
                sh 'docker build -t parkmeter-image .'
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker stop parkmeter-container || true'
                sh 'docker rm parkmeter-container || true'
                sh 'docker run -d -p 80:80 --name parkmeter-container parkmeter-image'
            }
        }
    }
}
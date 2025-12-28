pipeline {
    agent any
    stages {
        stage('Build Image') {
            steps {
                // This command tells Docker to build your project
                sh 'docker build -t parkmeter-image .'
            }
        }
        stage('Run Container') {
            steps {
                // This stops any old version and starts the new one
                sh 'docker stop parkmeter-container || true'
                sh 'docker rm parkmeter-container || true'
                sh 'docker run -d -p 80:80 --name parkmeter-container parkmeter-image'
            }
        }
    }
}
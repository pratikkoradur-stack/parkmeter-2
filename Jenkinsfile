pipeline {
    agent any

    environment {
        APP_NAME = "parkmeter-app"
    }

    stages {
        stage('Install') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying Parkmeter project...'
                // Simple deployment: restart the app using pm2
                sh 'pm2 restart $APP_NAME || pm2 start index.js --name $APP_NAME'
            }
        }
    }
}
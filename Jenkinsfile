pipeline {
    agent any

    tools {
        // Ensure you have "NodeJS" configured in Manage Jenkins > Global Tool Configuration
        // Replace 'Node 18' with whatever name you gave your installation
        nodejs 'Node 18' 
    }

    environment {
        // Define common variables here
        APP_NAME = "parkmeter-app"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                echo 'Installing npm packages...'
                sh 'npm install'
            }
        }

        stage('Lint & Test') {
            steps {
                echo 'Running tests...'
                // This will run whatever script you have in package.json under "test"
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                echo 'Building application (if applicable)...'
                // Useful if you're using TypeScript or a frontend framework
                // sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying Parkmeter project...'
                // OPTION A: Deployment using PM2 (for local/VPS hosting)
                sh 'pm2 restart all || pm2 start server.js --name $APP_NAME'

                // OPTION B: Deployment via Docker (uncomment if using Docker)
                // sh 'docker build -t parkmeter:latest .'
                // sh 'docker stop parkmeter || true && docker rm parkmeter || true'
                // sh 'docker run -d --name parkmeter -p 3000:3000 parkmeter:latest'
            }
        }
    }

    post {
        always {
            // Clean up workspace to save disk space
            cleanWs()
        }
        success {
            echo "Successfully deployed ${env.APP_NAME} build #${env.BUILD_NUMBER}"
        }
        failure {
            echo "Deployment failed! Check the console output."
        }
    }
}
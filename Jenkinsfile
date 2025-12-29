pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                echo 'STEP 1: Checking out code...'
                checkout scm
            }
        }
        
        stage('List Files') {
            steps {
                echo 'STEP 2: Listing project files...'
                sh '''
                    pwd
                    ls -la
                    echo "Frontend files:"
                    ls -la
                    echo "Backend files:"
                    ls -la server/
                '''
            }
        }
        
        stage('Check Versions') {
            steps {
                echo 'STEP 3: Checking tool versions...'
                sh '''
                    node --version || echo "Node not installed"
                    npm --version || echo "NPM not installed"
                    git --version || echo "Git not installed"
                '''
            }
        }
        
        stage('Simple Test') {
            steps {
                echo 'STEP 4: Simple test step...'
                sh 'echo "This is a test" > test.txt'
                sh 'cat test.txt'
            }
        }
    }
    
    post {
        always {
            echo "Pipeline completed with status: ${currentBuild.result}"
        }
    }
}
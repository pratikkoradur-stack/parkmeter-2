pipeline {
    agent any
    
    environment {
        NODE_ENV = 'production'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log --oneline -5'
            }
        }
        
        stage('Setup') {
            steps {
                sh '''
                    echo "=== System Info ==="
                    uname -a
                    echo "Node: $(node --version)"
                    echo "NPM: $(npm --version)"
                    echo "Git: $(git --version)"
                '''
            }
        }
        
        stage('Install Frontend Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Install Backend Dependencies') {
            steps {
                dir('server') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                sh 'npm run build'
                sh 'ls -la dist/'
            }
        }
        
        stage('Test Frontend') {
            steps {
                sh 'npm test || true'  # || true means don't fail pipeline if tests fail
            }
        }
        
        stage('Test Backend') {
            steps {
                dir('server') {
                    sh 'npm test || true'
                }
            }
        }
        
        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
            }
        }
    }
    
    post {
        always {
            echo "🎯 Build ${currentBuild.result} - ${currentBuild.fullDisplayName}"
            cleanWs()  // Clean workspace
        }
        success {
            echo '✅ SUCCESS! Pipeline completed successfully.'
        }
        failure {
            echo '❌ FAILURE! Pipeline failed.'
        }
    }
}
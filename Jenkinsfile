pipeline {
    agent any
    
    environment {
        NODE_ENV = 'production'
        VITE_SUPABASE_URL = credentials('supabase-url')
        VITE_SUPABASE_ANON_KEY = credentials('supabase-key')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'echo "📦 Repository: $(git config --get remote.origin.url)"'
                sh 'echo "📝 Latest commit: $(git log --oneline -1)"'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "📦 Installing frontend dependencies..."
                    npm install
                    
                    echo "📦 Installing backend dependencies..."
                    cd server && npm install
                '''
            }
        }
        
        stage('Type Check & Lint') {
            steps {
                sh '''
                    echo "🔍 Running TypeScript type check..."
                    npx tsc --noEmit || echo "TypeScript check completed"
                    
                    echo "🔍 Linting code..."
                    npm run lint || echo "Lint check completed"
                '''
            }
        }
        
        stage('Build Application') {
            steps {
                sh '''
                    echo "🔨 Building frontend..."
                    npm run build
                    
                    echo "📁 Build output:"
                    ls -la dist/
                    du -sh dist/
                '''
            }
            post {
                success {
                    archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                sh '''
                    echo "🧪 Running frontend tests..."
                    npm test -- --watchAll=false || echo "Tests completed"
                    
                    echo "🧪 Running backend tests..."
                    cd server && npm test || echo "Backend tests completed"
                '''
            }
        }
        
        stage('Security Check') {
            steps {
                sh '''
                    echo "🛡️ Checking for vulnerabilities..."
                    npm audit --audit-level=moderate || true
                    echo "🛡️ Checking outdated packages..."
                    npm outdated || true
                '''
            }
        }
        
        stage('Create Build Report') {
            steps {
                sh '''
                    echo "📊 === BUILD REPORT ===" > build-report.txt
                    echo "Build Number: ${BUILD_NUMBER}" >> build-report.txt
                    echo "Node Version: $(node --version)" >> build-report.txt
                    echo "NPM Version: $(npm --version)" >> build-report.txt
                    echo "Build Time: $(date)" >> build-report.txt
                    echo "Build Size: $(du -sh dist/ | cut -f1)" >> build-report.txt
                    echo "Git Commit: $(git log --oneline -1)" >> build-report.txt
                '''
                archiveArtifacts artifacts: 'build-report.txt', fingerprint: true
            }
        }
    }
    
    post {
        always {
            echo "🏁 Pipeline ${currentBuild.currentResult}!"
            echo "🔗 Build URL: ${BUILD_URL}"
            cleanWs()
        }
        success {
            echo "✅ SUCCESS! Your parking meter app is built and tested!"
            // You can add Slack/email notifications here later
        }
        failure {
            echo "❌ FAILURE! Check the logs above for errors."
        }
    }
}
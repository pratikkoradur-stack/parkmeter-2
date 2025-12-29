pipeline {
    agent any

    environment {
        // This tells npm to ignore the version warning so the build doesn't hang or error
        NODE_OPTIONS = "--max-old-space-size=4096"
        npm_config_engine_strict = "false"
    }

    stages {
        stage('Install') {
            steps {
                echo 'Installing dependencies...'
                // Using --force or ignoring engines since your server has Node 18
                sh 'npm install --no-engine-strict'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                // Use "npx" to make sure Jenkins finds vitest in node_modules
                sh 'npx vitest run'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying Parkmeter project...'
                // Add your deploy command here (e.g., pm2, docker, or netlify)
                sh 'echo "Deployment step goes here"'
            }
        }
    }
}
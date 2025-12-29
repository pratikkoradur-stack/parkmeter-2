pipeline {
    agent any

    stages {
        stage('Install') {
            steps {
                echo 'Installing dependencies...'
                // npm install recreates node_modules based on package.json
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo 'Building Vite project...'
                // This generates the "dist" folder seen in your VS Code
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deployment step...'
                // This is where you would move files to Nginx or start a process
                sh 'echo "Build successful. Ready for hosting."'
            }
        }
    }
}
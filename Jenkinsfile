pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                git 'https://github.com/chiranjit04/tailwind-angular-copy.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Check Output') {
            steps {
                sh 'ls -la'
                sh 'ls -la dist || true'
                sh 'ls -la www || true'
            }
        }
    }
}

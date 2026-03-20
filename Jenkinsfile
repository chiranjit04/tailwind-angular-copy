pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                git 'https://github.com/chiranjit04/tailwind-angular-copy.git'
            }
        }

        stage('Install') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
}

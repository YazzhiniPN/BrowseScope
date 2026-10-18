pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/YazzhiniPN/BrowseScope.git'
            }
        }

        stage('Build Backend (Maven)') {
            steps {
                dir('backend') {
                    bat 'mvn clean package -DskipTests=false'
                }
            }
        }

        stage('Archive Artifact') {
            steps {
                archiveArtifacts artifacts: 'backend/target/browsescope-backend.jar', fingerprint: true
            }
        }

        stage('Deploy via Ansible') {
            steps {
                // Jenkins runs on Windows; Ansible lives in WSL2, so shell out into it.
                bat 'wsl ansible-playbook -i ansible/inventory.ini ansible/deploy.yml'
            }
        }
    }

    post {
        success { echo 'BrowseScope backend built and deployed successfully.' }
        failure { echo 'Pipeline failed - check the stage logs above.' }
    }
}

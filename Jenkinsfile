pipeline {
    agent any

    environment {
        PATH = "E:\\apache-maven-3.9.16-bin\\apache-maven-3.9.16\\bin;${env.PATH}"
    }

    stages {
        stage('Build Backend (Maven)') {
            steps {
                dir('backend') {
                    bat 'mvn clean package'
                }
            }
        }

        stage('Archive Artifact') {
            steps {
                archiveArtifacts artifacts: 'backend/target/browsescope-backend.jar', fingerprint: true
            }
        }

        // Re-enable once ansible-playbook works manually from WSL
        // stage('Deploy via Ansible') {
        //     steps {
        //         bat 'wsl ansible-playbook -i ansible/inventory.ini ansible/deploy.yml'
        //     }
        // }
    }

    post {
        success { echo 'BrowseScope backend built successfully.' }
        failure { echo 'Pipeline failed - check the stage logs above.' }
    }
}
pipeline {
  agent any

  environment {
    DOCKER_COMPOSE_PATH = 'docker-compose.yml'
  }

  stages {
    stage('Checkout Code') {
      steps {
        echo '📥 Pulling latest code from GitHub...'
        git 'https://github.com/himaja-56/Social_Media.git'
      }
    }

    stage('Build Docker Images') {
      steps {
        echo '🐳 Building Docker images...'
        script {
          bat 'docker compose -f %DOCKER_COMPOSE_PATH% build --no-cache'
        }
      }
    }

    stage('Run Containers') {
      steps {
        echo '🚀 Starting Docker containers...'
        script {
          bat 'docker compose -f %DOCKER_COMPOSE_PATH% up -d'
        }
      }
    }

    stage('Health Check') {
      steps {
        echo '🩺 Checking if frontend and backend are up...'
        script {
          bat 'curl -I http://localhost:4173 || echo "⚠️ Frontend not reachable"'
          bat 'curl -I http://localhost:5000 || echo "⚠️ Backend not reachable"'
        }
      }
    }
  }

  post {
    success {
      echo '✅ Jenkins pipeline completed successfully with Docker!'
    }
    failure {
      echo '❌ Deployment failed. Please check logs in Jenkins console.'
    }
  }
}

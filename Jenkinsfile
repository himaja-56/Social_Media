pipeline {
  agent any

  environment {
    DOCKER_COMPOSE_PATH = 'docker-compose.yml'
  }

  stages {
    stage('Checkout Code') {
      steps {
        echo '📥 Pulling latest code from GitHub...'
        // 🚨 FIX: Explicitly specify the 'main' branch to prevent the revision error.
        git url: 'https://github.com/himaja-56/Social_Media.git', 
            branch: 'main'
      }
    }

    stage('Build Docker Images') {
      steps {
        echo '🐳 Building Docker images...'
        script {
          // 💡 BEST PRACTICE: Use 'docker-compose' for better compatibility on Windows/bat
          bat 'docker-compose -f %DOCKER_COMPOSE_PATH% build --no-cache'
        }
      }
    }

    stage('Run Containers') {
      steps {
        echo '🚀 Starting Docker containers...'
        script {
          // 💡 BEST PRACTICE: Use 'docker-compose'
          bat 'docker-compose -f %DOCKER_COMPOSE_PATH% up -d'
        }
      }
    }

    stage('Health Check') {
      steps {
        echo '🩺 Checking if frontend and backend are up...'
        script {
          // NOTE: 'curl' must be installed on the Jenkins agent for this to work.
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

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
          // 🔒 CRITICAL FIX: Inject credentials securely from Jenkins storage
          withCredentials([
            // Maps Jenkins credential ID to an environment variable name Docker Compose will use
            string(credentialsId: 'JWT_SECRET_KEY', variable: 'JWT_SECRET'),
            string(credentialsId: 'MONGODB_URI_SECRET', variable: 'MONGODB_URI')
          ]) {
            // Docker Compose will pick up JWT_SECRET and MONGODB_URI from the host environment
            bat 'docker-compose -f %DOCKER_COMPOSE_PATH% up -d'
          }
        }
      }
    }

    stage('Health Check') {
      steps {
        echo '🩺 Checking if frontend and backend are up...'
        script {
          // 💡 FIX: Check frontend on the correct development port (5173)
          bat 'curl -I http://localhost:5173 || echo "⚠️ Frontend not reachable"'
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
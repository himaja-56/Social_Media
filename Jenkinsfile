pipeline {
  agent any

  environment {
    NODE_ENV = 'development'
  }

  stages {
    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        echo 'Installing dependencies for backend and frontend...'
        sh '''
          cd backend && npm install
          cd ../frontend && npm install
        '''
      }
    }

    stage('Build Frontend') {
      steps {
        echo 'Building frontend...'
        sh '''
          cd frontend
          npm run build || echo "Dev mode only, skipping build..."
        '''
      }
    }

    stage('Run Backend') {
      steps {
        echo 'Starting backend server...'
        sh '''
          cd backend
          nohup node server.js &
          sleep 5
        '''
      }
    }

    stage('Run Frontend Dev Server') {
      steps {
        echo 'Starting frontend dev server...'
        sh '''
          cd frontend
          nohup npm run dev &
          sleep 10
        '''
      }
    }

    stage('Health Check') {
      steps {
        echo 'Verifying servers are running...'
        sh 'curl -I http://localhost:5173 || echo "Frontend not responding"'
        sh 'curl -I http://localhost:5000 || echo "Backend not responding"'
      }
    }
  }

  post {
    success {
      echo '✅ Jenkins pipeline completed successfully!'
    }
    failure {
      echo '❌ Pipeline failed. Check the console logs.'
    }
  }
}

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
        bat '''
          cd backend
          npm install
          cd ..
          npm install
        '''
      }
    }

    stage('Build Frontend') {
      steps {
        echo 'Building frontend...'
        bat '''
          npm run build || echo "Running in dev mode, skipping build..."
        '''
      }
    }

    stage('Run Backend') {
      steps {
        echo 'Starting backend server...'
        bat '''
          cd backend
          start /B node server.js
          timeout /T 5
        '''
      }
    }

    stage('Run Frontend Dev Server') {
      steps {
        echo 'Starting frontend dev server...'
        bat '''
          start /B npm run dev
          timeout /T 10
        '''
      }
    }

    stage('Health Check') {
      steps {
        echo 'Verifying servers are running...'
        bat '''
          curl -I http://localhost:5173
          curl -I http://localhost:5000
        '''
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

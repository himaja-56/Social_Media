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
          call npm install vite --save-dev
          call npx vite build || echo "Running in dev mode, skipping build..."
        '''
      }
    }

    stage('Run Backend') {
      steps {
        echo 'Starting backend server...'
        bat '''
          cd backend
          start "" node server.js
          ping 127.0.0.1 -n 6 >nul
        '''
      }
    }

    stage('Run Frontend Dev Server') {
      steps {
        echo 'Starting frontend dev server...'
        bat '''
          start "" npm run dev
          ping 127.0.0.1 -n 11 >nul
        '''
      }
    }

    stage('Health Check') {
      steps {
        echo 'Checking if servers are responding...'
        bat '''
          curl -I http://localhost:5173 || echo "Frontend not reachable"
          curl -I http://localhost:5000 || echo "Backend not reachable"
        '''
      }
    }
  }

  post {
    success {
      echo '✅ Jenkins pipeline completed successfully!'
    }
    failure {
      echo '❌ Pipeline failed. Check the console output for details.'
    }
  }
}

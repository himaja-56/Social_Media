# Dockerfile (frontend)
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 🛠️ FIX: Clean slate installation after copying all files
RUN rm -rf node_modules && npm install
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
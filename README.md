# cs35L-project

CS35L - Fall 2025 Group Project

Group Members:
Nicholas Jiang
Melis Fidansoy


git clone <repository-adress>

add .env file under the server in the following format:
DB_USER=root
DB_PASSWORD=""
DB_NAME=cs35l_project
JWT_SECRET=your_jwt_secret_key_here_change_in_production

Open 2 different terminals:

Terminal 1: 
cd task-manager
cd server
rm -rf node_modules package-lock.json
npm install

npm start

Terminal 2:
cd task-manager
cd client
rm -rf node_modules package-lock.json
npm install

npm run dev










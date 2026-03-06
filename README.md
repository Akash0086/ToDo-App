Todo Web App
A full-stack Todo application that allows users to manage tasks with authentication, role-based access control, filtering, and pagination.

The project is built with Node.js, TypeScript, MySQL, and a simple frontend (HTML, CSS, JavaScript).

Features

User authentication using JWT
User registration and login
Refresh token mechanism
Role-based authorization (Admin/User)
Create, update, delete tasks
View tasks with filtering and pagination
Centralized error handling
Request validation middleware
Logging support

Tech Stack
Backend
Node.js
TypeScript
Express.js
MySQL
JWT (JSON Web Token)
Custom middleware (validation, authorization, error handling)

Frontend
HTML
CSS
JavaScript

Project Structure
todoWeb
│
├── backend
│   ├── auth
│   ├── db
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── types
│   ├── utils
│   ├── server.ts
│   └── router.ts
│
├── frontend
│   ├── pages
│   ├── scripts
│   ├── style
│   └── images
│
└── logs

Setup Instructions
1.Clone the repository
git clone https://github.com/YOUR_USERNAME/ToDo-App.git
cd ToDo-App

2️.Install backend dependencies
cd backend
npm install

3️.Configure environment variables
Create a .env file inside backend.

Example:
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=todo
JWT_SECRET=your_secret_key

4️.Start the backend server
npx tsx server.ts

Server runs on:
http://localhost:3000

5️.Open the frontend
Navigate to:
frontend/pages/index.html
Open it in your browser.

API Endpoints
Authentication
Method	Endpoint	Description
POST	/register	Register new user
POST	/login	Login user
POST	/refresh	Refresh access token
Tasks
Method	Endpoint	Description
GET	/tasks	Get tasks
POST	/tasks	Create task
PUT	/tasks/:id	Update task
DELETE	/tasks/:id	Delete task

Learning Goals

This project was built to practice:
Building REST APIs
TypeScript with Node.js
Authentication using JWT
Middleware architecture
MySQL database integration
Frontend integration with APIs

Author

Akash
GitHub:
https://github.com/Akash0086

Future Improvements

Add Docker support
Add unit tests
Implement React frontend
Deploy on cloud (AWS / Render / Railway)

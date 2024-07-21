# ecommerce-backend

A backend API service for e-commerce application

# Guide: Instructions for Deploying and Configuring the Node.js Project

## Prerequisites

1. **Node.js**: Ensure you have Node.js installed. You can download it from nodejs.org.
2. **MongoDB Atlas**: Sign up for MongoDB Atlas and create a new cluster. Follow the instructions to get your connection string.

## Step-by-Step Deployment and Configuration

1. **Clone the Repository**

- HTTP

```bash
git clone https://github.com/kushhingol/ecommerce-backend.git
cd ecommerce-backend
```

- SSH

```
git clone git@github.com:kushhingol/ecommerce-backend.git
cd ecommerce-backend
```

2. **Install Dependencies**

```bash
npm install
```

3. **Set Up Environment Variables**

1. Create a .env file in the root directory of the project and add the following variables.
1. Replace <values> with your actual configuration values.

```env
# MongoDB connection string
MONGODB_URI=<your mongo server uri>

# JWT secret key
JWT_SECRET=your_jwt_secret

# Email service credentials (for sending order confirmation/cancellation emails)
EMAIL_SERVICE=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Server port
PORT=3000
```

4. **Configure MongoDB Atlas**

- Sign in to your MongoDB Atlas account.
- Create a new cluster if you haven't already.
- Create a database user and get the connection string.
- Replace the <MONGODB_URI> in your .env file with this connection string.

4. **Start the Server**

This will start the server on the port specified in your .env file (default is 3000).

```BASH
npm run start
```

OR

```BASH
npm run dev
```

5. **Run Unit Tests**

```BASH
npm test
```

6. **Postman collection**

- Import the postman collection `E-commerce APIs.postman_collection.json` in the postman application
- There will be multiple variables present in the collection which can be replaced by the actual data

## Deployment

1. **Heroku Deployment**

- Create an account on Heroku.
- Install the Heroku CLI.
- Run the following commands to deploy:

```BASH
heroku login
heroku create <your-app-name>
git push heroku master
heroku config:set MONGODB_URI=<your-mongodb-atlas-connection-string>
heroku config:set JWT_SECRET=<your-jwt-secret>
heroku config:set EMAIL_SERVICE=<your-email-service>
heroku config:set EMAIL_USER=<your-email-username>
heroku config:set EMAIL_PASS=<your-email-password>
heroku config:set PORT=<your-port>
```

2. **AWS EC2 Deployment**

- Create an EC2 instance.
- SSH into your instance.
- Install Node.js and MongoDB.
- Clone your repository and follow the steps above to install dependencies and start the server.

3. **Docker Deployment**

- Create a Dockerfile in your project root.

```
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

- Build and run the Docker container

```
docker build -t your-app-name .
docker run -p 3000:3000 --env-file .env your-app-name
```

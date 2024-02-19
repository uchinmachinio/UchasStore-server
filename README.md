# MERN E-commerce app backend
This is the backend code of my full-stack MERN E-commerce website.

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [License](#license)

## overview
This is not a production level application, it is my personal project built to show what I have learned and further practice, learn and grow as a developer. for clarity, I have decided to create seperate readmes for client and [server](https://github.com/uchinmachinio/UchasStore-server) repositories.

- **Purpose:**
This component of the project serves as the backend and is responsible for handling various functionalities such as user authentication, database interactions, and managing the core logic of the e-commerce platform.

- **Key Features:**
  - Authentication.
  - Database management.
  - API endpoints.
  - Session management.

- **Technology Stack:**
  1. **Express.js:**
   - A fast, unopinionated, and minimalist web framework for Node.js.
   - [Express.js](https://expressjs.com/)

2. **Mongoose:**
   - A MongoDB object modeling tool designed to work in an asynchronous environment.
   - [Mongoose](https://mongoosejs.com/)

3. **Passport:**
   - An authentication middleware for Node.js.
   - [Passport](http://www.passportjs.org/)

4. **Passport Strategies:**
   - **passport-local:**
     - Passport strategy for authenticating with a local username and password.
   - **passport-google-oauth20:**
     - Passport strategy for authenticating with Google using OAuth 2.0.
   - **passport-local-mongoose:**
     - Mongoose plugin for simplifying username and password authentication with Passport.
   - [Passport Strategies](http://www.passportjs.org/packages/)

5. **Express Session and Connect-Mongo:**
   - **express-session:**
     - Simple session middleware for Express.
     - [Express Session](https://www.npmjs.com/package/express-session)
   - **connect-mongo:**
     - MongoDB session store for Express.
   - [Connect Mongo](https://www.npmjs.com/package/connect-mongo)

6. **Cors:**
   - Middleware for handling Cross-Origin Resource Sharing (CORS) in Express.js.
   - [Cors](https://www.npmjs.com/package/cors)

7. **Dotenv:**
   - Zero-dependency module that loads environment variables from a .env file.
   - [Dotenv](https://www.npmjs.com/package/dotenv)

8. **Body-Parser:**
   - Middleware for parsing incoming request bodies in Express.js.
   - [Body-Parser](https://www.npmjs.com/package/body-parser)

9. **ImageKit:**
   - SDK for integrating ImageKit into Node.js applications.
   - [ImageKit](https://www.npmjs.com/package/imagekit)

10. **Multer:**
    - Middleware for handling `multipart/form-data`, primarily used for file uploads.
    - [Multer](https://www.npmjs.com/package/multer)

11. **Sharp:**
    - High-performance image processing library, I used it to resize and optimize images before sending them to imagekit.
    - [Sharp](https://www.npmjs.com/package/sharp)

12. **Stripe:**
    - Node.js module for interfacing with the Stripe API, for simulating payments.
    - [Stripe](https://www.npmjs.com/package/stripe)

- **Architecture:**
  - I used express-router for modulising and managing the routes.
  - I have also seperated the database models.
      
- **Dependencies:**
  - You can view all of the dependencies in package.json file in the root directory.


  ## Installation
  You do not need to run this project in you local machine to be able to view it, I hosted it on render so you can just visit https://uchas.store/ , however if you do want to install it it will be quite tedious,because you will need to install both client and server repositories, as well as link them to your own third party services I'm using, since im not sharing my personal env variables, here are the steps:
  
  1.**set up client directory:**
   ```bash
   //Create and Navigate to the Client Directory:
   mkdir client
   cd client
  //Clone the client repo:
   git clone https://github.com/uchinmachinio/UchasStore-client
  //Install dependencies
   npm install
  //change the base url variable in api.js to "http://localhost:4000" // or your preffered port
  //start the client
   npm run dev
   ```
  2.**set up server directory:**
    ```bash
    //Create and Navigate to the Server Directory:
    mkdir server
    cd server
   //Clone the server repo:
    git clone https://github.com/uchinmachinio/UchasStore-server
   //Install dependencies
    npm install
   //set up the env with your respective services, heres the template:
    MONGO_URI=your mongo uri
    SESSION_SECRET=any secret string
    GOOGLE_CLIENT_ID=your client id
    GOOGLE_CLIENT_SECRET=your gogle secret
    IMAGEKIT_URL=your imagekit uri
    IMAGEKIT_PUBLIC_KEY=your imagekit public key
    IMAGEKIT_PRIVATE_KEY=your imagekit private key
    CLIENT_URL="http://localhost:5173" //or your preffered port
    SERVER_URL="http://localhost:4000" //or your preffered port
    STRIPE_TEST_SECRET=your stripe webhook signing key
  //run the server
    node index.js
    ```
## Usage
Of course this project is not for the user to interact with, check out the usage guide to see it work by acsessing the frontend here [client](https://github.com/uchinmachinio/UchasStore-client)

## License

This project is for educational and personal use only and does not grant any rights for redistribution, modification, or commercial use.

### How to Contribute

While contributions are appreciated, this project is mainly for personal development and learning purposes. Contributions may be accepted at the discretion of the project owner.

## Acknowledgments

This project may use third-party libraries or resources that have their own licenses. Please refer to the respective license files or documentation of those components for more information.

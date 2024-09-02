# What is this code for?

This is the code for my RESTFUL api written using express.

Authorization is handled via jsonwebtoken.

I have used mongodb for the database.

This api is hosted on heroku at https://ancient-lake-71305-93605de8b47e.herokuapp.com/

To run the api from the terminal use the command:

npm run devstart

# Routes

POST /signup - a route for creating a new user, requires in the payload a username, password, and password confirmation (called confirmPassword). Password and confirmPassword must be the same.

POST /login - logs the user in, requiring a correct username and password combination. Returns in the response a bearer token used subsequently for authorization in the remaining routes.

All subsequent routes require a token in the authorization header.

GET /posts - fetches posts by all users ordered by when they were created. contains a query, 'page', which indicates if the first 10, next 10, etc. posts should be fetched.

POST /posts - creates a new post. payload should contain a title and the main message of the post (called text).

GET /posts/:id - fetches a single post, parametrised by its id in the database.

GET /posts/:id/comments - fetches all comments linked to a single post, parametrised by the post id

POST /posts/:id/comments - creates a new comment under/linked to a single post, parametrised by the post id


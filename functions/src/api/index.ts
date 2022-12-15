import express, {Router} from 'express';
import userRoute from './user';
import experienceRoute from './experience';
import universityRoute from './university';
import validateAuth from './middleware/auth';

import * as functions from 'firebase-functions';

// initialising the express app and route
const app = express();
const apiRoute = Router();

// middleware to log - request url and method
app.use((req, res, next) => {
  console.log(`method: ${req.method}, url: ${req.originalUrl}`);
  return next();
});

// middleware to validate whether request is coming from a trusted source or not.
app.use(validateAuth);

// assigning the route to a specific path
app.use('/api/record', apiRoute);

// assigning subsequence path to the route
apiRoute.use('/university', universityRoute);
apiRoute.use('/experience', experienceRoute);
apiRoute.use('/user', userRoute);

// creating firebase http function with the created express app
export const api = functions.runWith({timeoutSeconds: 500}).https.onRequest(app);

import * as express from 'express';
import {Router} from 'express';
import userRoute from './user';
import experienceRoute from './experience';
import universityRoute from './university';

import validateAuth from './middleware/auth';

import * as functions from 'firebase-functions';

const app = express();
const apiRoute = Router();

app.use((req, res, next) => {
  console.log('url', req.originalUrl);
  console.log('method', req.method);
  next();
});

console.info('here');
app.use(validateAuth);

app.use('/api/record', apiRoute);

apiRoute.use('/university', universityRoute);
apiRoute.use('/experience', experienceRoute);
apiRoute.use('/user', userRoute);

export const api = functions.https.onRequest(app);

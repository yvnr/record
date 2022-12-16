import {Request, Response, NextFunction} from 'express';
import {firestore} from '../../admin';
import {ErrorCode} from '../../errorCodes';

// enum representation for all the http request methods
enum RequestMethods {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'PATCH',
}

enum Endpoints {
  Register= '/register',
  University = '/university'
}

const expemtionEndpoints = [(RequestMethods.GET, Endpoints.Register), (RequestMethods.POST, Endpoints.Register)];

/**
 * Its an express middleware function.
 * Validates the request headers and decides whether request is coming from trusted source or not.
 * All Requests should contain Authorization header in the format {ApiKey} {ApiSecret}
 * Need two more headers x-uid and x-univId for all requests except POST request for register end point and all university related GET endpoints
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @param {NextFunction} next - used to pass the request handleer to next express middleware function
 * @return {Promise<void | Response<200 | Error>>}  returns Response with an error if the request headers are not authorized. Otherwise, it is passed to
 *  next middleware function by calling next()
 */
export default async function(
    req: Request,
    res: Response,
    next: NextFunction
) : Promise<void | Response> {
  console.info('validating the authorization');
  const authorization = req.headers['authorization'];
  const uid = req.headers['x-uid'];
  const univId = req.headers['x-univ-id'];

  // no authorization headers
  if (!authorization) {
    return res.status(401).send({
      code: ErrorCode.Unauthorized,
      message: 'You are not authorized to make this request',
    });
  }

  // get apiSecrets document
  const apiSecretsDoc = await firestore().collection('secrets').doc('apiSecrets').get();
  const secrets = apiSecretsDoc.data() as ApiSecrets;

  // getting the apiKey and api Secret from header and validating it
  const [apiKey, apiSecret] = authorization.split(' ');
  if (!apiKey || !apiSecret || apiSecret != secrets[apiKey]) {
    return res.status(401).send({
      code: ErrorCode.Unauthorized,
      message: 'You are not authorized to make this request',
    });
  }

  const originalUrl = req.originalUrl;

  // no need of headers related to user and university for the expemtionEndpoints
  const isEndpointExpemted = expemtionEndpoints.reduce(((acc: boolean, curr) =>
    acc || (originalUrl.endsWith(curr[1]) && req.method == curr[0])), false);

  if (isEndpointExpemted) {
    return next();
  }

  // check whether univId and uid is present or not
  if (!uid || !univId) {
    return res.status(401).send({
      code: 'unauthorized',
      message: 'Please provide proper headers',
    });
  }

  console.info(`univId: ${univId} and uid: ${uid}`);
  return next();
}

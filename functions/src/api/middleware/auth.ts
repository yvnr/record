import {Request, Response, NextFunction} from 'express';
import secrets from '../../secrets';

enum RequestMethods {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'PATCH',
}

export default async function(
    req: Request,
    res: Response,
    next: NextFunction
) {
  console.info('in the auth check');
  const authorization = req.headers['authorization'];
  const uid = req.headers['x-uid'];
  const univId = req.headers['x-univ-id'];

  if (!authorization) {
    return res.status(401).send({
      code: 'unauthorized',
      message: 'You are not authorized to make this request',
    });
  }

  const [serviceId, secret] = authorization.split(' ');

  if (!serviceId || !secret || secret != secrets['apiSecrets'][serviceId]) {
    return res.status(401).send({
      code: 'unauthorized',
      message: 'You are not authorized to make this request',
    });
  }

  if (req.url.endsWith('register') && req.method == RequestMethods.POST) {
    return next();
  }

  if (req.url.includes('/university')) {
    return next();
  }

  // check whether univId and uid is present or not
  if (!uid || !univId) {
    return res.status(401).send({
      code: 'unauthorized',
      message: 'Please provide proper headers',
    });
  }

  return next();
}

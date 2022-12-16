import {NextFunction} from 'connect';
import {Router, Request, Response} from 'express';
import {auth, firestore} from '../admin';
import {ErrorCode} from '../errorCodes';

const router = Router(); // express router

// router handlers with the request path associated with corresponding request handlers
router.post('/register', validateCreateUserPayload, registerUser);
router.patch('/:id', validateUpdateUserPayload, updateUser);
router.get('/:id', getUserById);

export default router;

/**
 * POST request handler after validating request payload in validateCreateUserPayload request handler.
 * Checks whether email exists or not.
 * If exists, throws an error response
 * Else, create a user in the firebase authentication system(IDP) and user doc in the users collection
 * And create a customToken from the firebase auth system which will be used to login on the client side.
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @return {Promise<Response<{sessionToken: string} | Error>>} - returns error response if email already exists. Otherwise returns sessionToken
 * as json object.
 */
export async function registerUser(req: Request, res: Response) {
  const {email, password, univId, name} = req.body as CreateUserPayload;
  console.info('Registering user to the univId:', univId);
  try {
    // check whether email exists or not

    const userDoc = await firestore().collection('users').where('email', '==', email).get();
    if (!userDoc.empty) {
      return res.status(400).send({
        code: ErrorCode.EmailAlreadyRegistered,
        message: 'Email is already registered',
      });
    }

    // validate university Id exists or not
    const univDoc = await firestore()
        .collection('universities')
        .doc(univId)
        .get();
    if (!univDoc.exists) {
      return res.status(400).send({
        code: ErrorCode.NotFound,
        message: 'Provided university is not registered in our system',
      });
    }

    // validating whether registered email is registered domain with the univ or not
    const {emailDomains} = univDoc.data() as University;
    const isDomainValid = !!emailDomains.find((domain) =>
      email.endsWith(domain)
    );
    if (!isDomainValid) {
      return res.status(400).send({
        code: ErrorCode.InvalidRequest,
        message: 'your entered email domain is not added by the university',
      });
    }

    // creating a user in the firebase auth system
    const userRecord = await auth().createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    console.info('user created with id:', uid);
    // creating firestore doc.. which will be used for updating displayName and other things
    await firestore().collection('users').doc(uid).set({
      name,
      email,
      univId,
    });

    // setting the custom claims with univId
    await auth().setCustomUserClaims(uid, {
      univId,
    });

    // get authToken for the user.. which will be used to login after signing up
    const token = await auth().createCustomToken(uid);

    // send the sessionToken which will be used to login on client side.
    return res.send({
      sessionToken: token,
    });
  } catch (err: any) {
    console.warn('error while creating user registeration');
    return res.status(400).send(err.message);
  }
}

/**
 * PATCH request handler after validating request payload in validateUpdateUserPayload request handler.
 * If the doc does not exist and also if the doc is not created by the requested user returns error response
 * Else, Updates user doc with the data provided in the doc and also name in the user of firebase auth system
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @return {Promise<Response<200 | Error>>} - returns error response if the doc does not exist and also if the doc is not
 * created by the requested user. Otherwise send status 200
 */
export async function updateUser(req: Request, res: Response) {
  const {name} = req.body as CreateUserPayload;
  const uid = req.headers['x-uid'] as string;

  console.info('PATCH: updating user with id:', uid);

  // validating the user requested and user doc update id are same or not
  if (uid != req.params['id']) {
    return res.status(400).send({
      code: ErrorCode.InvalidRequest,
      message: 'No such entry found',
    });
  }
  try {
    // updating authentication user data
    await auth().updateUser(uid, {
      displayName: name,
    });

    // updating user name in the user doc in users collection
    await firestore().collection('users').doc(uid).update({
      name,
    });

    return res.sendStatus(200);
  } catch (err: any) {
    // catching the error. Since while updating the name with the firebase auth. If the name contains
    // invalid characters. It throws an error.
    return res.status(400).send(err.response.data);
  }
}

/**
 * Its an express middleware function.
 * Validates the request payload is in the expected format or not for POST Request
 * If passes, nex
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @param {NextFunction} next - used to pass the request handler to next express middleware function
 * @return {Promise<void | Response<Error>>}  return error response if it is improper. If not, passes to next middleware function
 * to process the request
 */
export async function validateCreateUserPayload(
    req: Request,
    res: Response,
    next: NextFunction
) {
  console.info('validating user payload');

  if (!req.body) { // no paylaod
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please provide data to process',
    });
  }

  const {email, password, univId, name} = req.body;

  if (!email || !email.includes('@')) { // email valifation
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please enter an email',
    });
  }

  if (!password || password.length < 8 || password.length > 50) { // password validation
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please enter password with 8-50 characters',
    });
  }

  if (!univId) { // univId validation
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please provide university Id',
    });
  }

  if (!name || name.length < 4 || name.length > 50) { // name validation
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please enter name with 4-50 characters',
    });
  }
  return next();
}

/**
 * Its an express middleware function.
 * Validates the request payload is in the expected format or not for PUT request
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @param {NextFunction} next - used to pass the request handler to next express middleware function
 * @return {Promise<void | Response<Error>>}  returns error response if it is improper. If not, passes to next middleware function
 * to process the request
 */
export async function validateUpdateUserPayload(
    req: Request,
    res: Response,
    next: NextFunction
) {
  console.info('updating user payload');
  if (!req.body) { // no payload
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please provide data to process',
    });
  }

  const {name} = req.body;

  if (!name || name.length < 4 || name.length > 50) { // name valdiation
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please enter name with atleast 4 characters',
    });
  }
  return next();
}

/**
 * GET request to retrieve user document with docId
 * If docId does not exist, return error response.
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @return {Promise<Response<User | Error>>}  - return error if no docId exist, else send user data
 */
export async function getUserById(req: Request, res: Response) {
  const id = req.params['id'];

  console.info('GET: user for id', id);

  const docSnap = await firestore().collection('users').doc(id).get();
  if (!docSnap.exists) { // no doc
    return res.status(400).send({
      code: ErrorCode.NotFound,
      message: 'No such record found',
    });
  }

  const userData = docSnap.data() as User;
  const respData = Object.assign(
      {},
      {id: docSnap.id},
      {name: userData.name}
  );
  return res.send(respData);
}

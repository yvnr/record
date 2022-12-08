import {NextFunction} from 'connect';
import {Router, Request, Response} from 'express';
import {auth, firestore} from '../admin';

const router = Router();

router.post('/register', validateCreateUserPayload, createUser);
router.patch('/:id', validateUpdateUserPayload, updateUser);
router.get('/:id', getUserById);

export default router;

async function createUser(req: Request, res: Response) {
  const {email, password, univId, name} = req.body as CreateUserPayload;
  try {
    // check whether email exists or not
    const existingUserRecord = await auth()
        .getUserByEmail(email)
        .catch(() => {
          return res.status(400).send({
            code: 'invalid-request',
            message: 'Please enter email in a proper format',
          });
        });

    if (existingUserRecord) {
      return res.status(400).send({
        code: 'invalid-request',
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
        code: 'invalid-request',
        message: 'Provided university is not registered in our system',
      });
    }

    const {emailDomains} = univDoc.data() as University;
    const isDomainValid = !!emailDomains.find((domain) =>
      email.endsWith(domain)
    );
    if (!isDomainValid) {
      return res.status(400).send({
        code: 'invalid-request',
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

    return res.send({
      sessionToken: token,
    });
  } catch (err: any) {
    return res.status(err.response.status).send(err.response.data);
  }
}

async function updateUser(req: Request, res: Response) {
  const {name} = req.body as CreateUserPayload;
  const uid = req.headers['uid'] as string;

  if (uid != req.params['id']) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'You are not authorized',
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
    return res.status(err.response.status).send(err.response.data);
  }
}

async function validateCreateUserPayload(
    req: Request,
    res: Response,
    next: NextFunction
) {
  if (!req.body) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Please provide data to process',
    });
  }

  const {email, password, univId, name} = req.body;

  if (!email) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Please enter an email',
    });
  }

  if (!password || password.length < 8 || password.length > 50) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Please enter password with 8-50 characters',
    });
  }

  if (!univId) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Please provide university Id',
    });
  }

  if (!name || name.length < 4 || name.length > 50) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Please enter name with 4-50 characters',
    });
  }
  return next();
}

async function validateUpdateUserPayload(
    req: Request,
    res: Response,
    next: NextFunction
) {
  if (!req.body) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Please provide data to process',
    });
  }

  const {name} = req.body;

  if (!name || name.length < 4) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Please enter name with atleast 4 characters',
    });
  }
  return next();
}

async function getUserById(req: Request, res: Response) {
  const id = req.params['id'];
  const docSnap = await firestore().collection('users').doc(id).get();
  if (!docSnap.exists) {
    return res.status(400).send({
      code: 'invalid-request',
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

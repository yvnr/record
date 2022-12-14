import {Router, Request, Response, NextFunction} from 'express';
import {firestore} from '../admin';
import moment from 'moment-timezone';
import {ErrorCode} from '../errorCodes';

const router = Router(); // express router

// router handlers with the request path associated with corresponding request handlers
router.post('/', validateExpPayload, createExperience);
router.get('/:id', getExperienceById);
router.get('/', getExperienceList);
router.put('/:id', validateExpPayload, updateExperience);
router.delete('/:id', deleteExperience);

export default router;

/**
 * POST request handler after validating request payload in validateExpPayload request handler.
 * Creates experience doc in the expreiences collection
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @return {Promise<Response<200>>} returns the response with status 200
 */
export async function createExperience(req: Request, res: Response) : Promise<Response> {
  const uid = req.headers['x-uid'];
  const univId = req.headers['x-univ-id'];

  const {summary, role, company, location, status} = req.body as ExperiencePayload;
  const doc = await firestore().collection('experiences').add({
    summary,
    role,
    company,
    location,
    uid,
    status,
    univId,
    createdAt: moment().toDate(),
    updatedAt: moment().toDate(),
  });

  console.info(`POST: experience id - ${doc.id} created`);
  return res.sendStatus(200);
}

/**
 * GET request to retrieve experience document with docId
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @return {Promise<Response<Experience | Error>>}  - If the docId does not exist in the collection, will throw an error
 * else, sends the data
 */
export async function getExperienceById(req: Request, res: Response) {
  const id = req.params['id'];
  console.info(`GET: experience id - ${id}`);
  const docSnap = await firestore().collection('experiences').doc(id).get();
  if (!docSnap.exists) { // no doc
    return res.status(400).send({
      code: ErrorCode.NotFound,
      message: 'No such record found',
    });
  }

  const expData = docSnap.data() as Experience;
  const {createdAt, updatedAt} = expData;
  // date in firestore is saved as timestamp. so converting to date
  const respData = Object.assign({}, {id: docSnap.id}, expData, {createdAt: createdAt.toDate(), updatedAt: updatedAt.toDate()});
  return res.send(respData);
}

/**
 * GET request to retrieves all experience documents based on the req query
 * if query contains company, get experiences doc based on the company and univId, else return all based on the univId
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @return {Promise<Response<Experience[]>>} - returns all the experience docs.
 */
export async function getExperienceList(req: Request, res: Response) {
  const univId = req.headers['x-univ-id'];
  const company = req.query['company'];
  console.info('GET: experiences list');

  // query
  if (company) {
    const docsSnap = await firestore()
        .collection('experiences')
        .where('univId', '==', univId).where('company', '==', company).get();
    // converting timestamp to date
    const respData = docsSnap.docs.map((doc) => {
      const expData = doc.data() as Experience;
      const {createdAt, updatedAt} = expData;
      return Object.assign({}, {id: doc.id}, expData, {createdAt: createdAt.toDate(), updatedAt: updatedAt.toDate()} );
    });
    return res.send(respData);
  }

  const docsSnap = await firestore()
      .collection('experiences')
      .where('univId', '==', univId).get();
  // converting timestamp to date
  const respData = docsSnap.docs.map((doc) => {
    const expData = doc.data() as Experience;
    const {createdAt, updatedAt} = expData;
    return Object.assign({}, {id: doc.id}, expData, {createdAt: createdAt.toDate(), updatedAt: updatedAt.toDate()} );
  });
  return res.send(respData);
}

/**
 * PUT request handler after validating request payload in validateExpPayload request handler.
 * Updates experience doc with the data provided
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @return {Promise<Response<200 | Error>>} - returns error if the doc does not exist and also if the experience is not
 * created by the requested user. Otherwise updates the doc and sends status 200
 */
export async function updateExperience(req: Request, res: Response) {
  const id = req.params['id'];
  const uid = req.headers['x-uid'];

  console.info('PUT: experiences list');

  // checking whether doc exists or not
  const docSnap = await firestore().collection('experiences').doc(id).get();
  if (!docSnap.exists) {
    return res.status(400).send({
      code: ErrorCode.NotFound,
      message: 'No such record found',
    });
  }

  // checking whether user created is same or not with the requested user
  const expData = docSnap.data() as Experience;
  if (expData.uid !== uid) {
    return res.status(400).send({
      code: ErrorCode.Unauthorized,
      message: 'Unauthorixed to perform this request',
    });
  }

  const {summary, role, company, location, status} = req.body as ExperiencePayload;

  // updating the doc
  await docSnap.ref.set(
      {
        summary,
        role,
        company,
        status,
        location,
        updatedAt: moment().toDate(),
      },
      {merge: true}
  );

  return res.sendStatus(200);
}

/**
 * Delete experience doc with the data provided
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @return {Promise<Response<200 | Error>>} - returns error if the doc does not exist and also if the experience is not
 * created by the requested user. Otherwise delete the doc and sends status 200
 */
export async function deleteExperience(req: Request, res: Response) {
  const id = req.params['id'];
  const uid = req.headers['x-uid'];

  console.info('DELETE: experience id:', id);

  const docSnap = await firestore().collection('experiences').doc(id).get();
  if (!docSnap.exists) {
    return res.status(400).send({
      code: ErrorCode.NotFound,
      message: 'No such record found',
    });
  }

  const expData = docSnap.data() as Experience;
  if (expData.uid !== uid) {
    return res.status(400).send({
      code: ErrorCode.Unauthorized,
      message: 'Unauthorixed to perform this request',
    });
  }

  await docSnap.ref.delete();
  return res.sendStatus(200);
}

/**
 * Its an express middleware function.
 * Validates the request payload is in the expected format or not
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @param {NextFunction} next - used to pass the request handler to next express middleware function
 * @return {Promise<void | Response<Error>>}  returns Response with an error if it is improper. If not, passes to next middleware function
 * to process the request
 */
export async function validateExpPayload(
    req: Request,
    res: Response,
    next: NextFunction
) {
  console.info('validating experience request payload');
  // no req body exists
  if (!req.body) {
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please provide data to process',
    });
  }

  const {company, role, summary, location, status} = req.body as ExperiencePayload;

  // check company field in req.body
  if (!company || company.length < 3 || company.length > 50) {
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please provide company with 3-50 characters',
    });
  }

  // check role field
  if (!role || role.length < 3 || role.length > 50) {
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please provide role with 3-50 characters',
    });
  }

  // check summary field
  if (!summary || summary.length > 10000) {
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please enter summary with max of 10000 characters',
    });
  }

  // check location field
  if (!location || location.length < 3 || location.length > 50) {
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please provide location with 3-50 characters',
    });
  }

  // check status field
  if (!status) {
    return res.status(400).send({
      code: ErrorCode.InvalidPayload,
      message: 'Please provide status',
    });
  }

  return next();
}

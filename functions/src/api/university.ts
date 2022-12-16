import {Router, Request, Response} from 'express';
import {firestore} from '../admin';
import {ErrorCode} from '../errorCodes';

const router = Router(); // express router

// router handlers with the request path associated with corresponding request handlers
router.get('/', getUnivList);
router.get('/:id', getUnivById);

export default router;

/**
 * GET request to retrieves all university documents
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @return {Promise<Response<University[]>>} - returns all the unviersity docs.
 */
async function getUnivList(req: Request, res: Response) {
  console.info('GET: universities list');
  const docsSnap = await firestore().collection('universities').get();
  const respData = docsSnap.docs.map((doc) => {
    return Object.assign({}, {id: doc.id}, doc.data());
  });
  return res.send(respData);
}


/**
 * GET request to retrieve university document with docId
 * @param {Request} req - http request recieved
 * @param {Response} res - http response used to send data to client
 * @return {Promise<Response<University | Error>>}  - If the docId does not exist in the collection, will throw an error
 * else, sends the data
 */
async function getUnivById(req: Request, res: Response) {
  const id = req.params['id'];
  console.info(`GET: university id - ${id}`);
  const docSnap = await firestore().collection('experiences').doc(id).get();
  if (!docSnap.exists) {
    return res.status(400).send({
      code: ErrorCode.NotFound,
      message: 'No such record found',
    });
  }

  const univData = docSnap.data() as University;
  const respData = Object.assign({}, {id: docSnap.id}, univData);
  return res.send(respData);
}

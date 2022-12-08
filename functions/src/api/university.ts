import {Router, Request, Response} from 'express';
import {firestore} from '../admin';

const router = Router();

router.get('/', getUnivList);
router.get('/:id', getUnivById);

export default router;

async function getUnivList(req: Request, res: Response) {
  const docsSnap = await firestore().collection('universities').get();
  const respData = docsSnap.docs.map((doc) => {
    return Object.assign({}, {id: doc.id}, doc.data());
  });
  return res.send(respData);
}

async function getUnivById(req: Request, res: Response) {
  const id = req.params['id'];
  const docSnap = await firestore().collection('experiences').doc(id).get();
  if (!docSnap.exists) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'No such record found',
    });
  }

  const univData = docSnap.data() as University;
  const respData = Object.assign({}, {id: docSnap.id}, univData);
  return res.send(respData);
}

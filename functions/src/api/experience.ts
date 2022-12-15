import {Router, Request, Response, NextFunction} from 'express';
import {firestore} from '../admin';
import moment from 'moment-timezone';

const router = Router();

router.post('/', validateExpPayload, createExperience);
router.get('/:id', getExperienceById);
router.get('/', getExperienceList);
router.put('/:id', validateExpPayload, updateExperience);
router.delete('/:id', deleteExperience);

export default router;

async function createExperience(req: Request, res: Response) {
  const uid = req.headers['x-uid'];
  const univId = req.headers['x-univ-id'];

  const {summary, role, company, location} = req.body as ExperiencePayload;
  await firestore().collection('experiences').add({
    summary,
    role,
    company,
    location,
    uid,
    univId,
    createdAt: moment().toDate(),
    updatedAt: moment().toDate(),
  });

  return res.sendStatus(200);
}

async function getExperienceById(req: Request, res: Response) {
  const id = req.params['id'];
  const docSnap = await firestore().collection('experiences').doc(id).get();
  if (!docSnap.exists) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'No such record found',
    });
  }

  const expData = docSnap.data() as Experience;
  const {createdAt, updatedAt} = expData;
  const respData = Object.assign({}, {id: docSnap.id}, expData, {createdAt: createdAt.toDate(), updatedAt: updatedAt.toDate()});
  return res.send(respData);
}

async function getExperienceList(req: Request, res: Response) {
  const univId = req.headers['x-univ-id'];
  const docsSnap = await firestore()
      .collection('experiences')
      .where('univId', '==', univId)
      .get();
  const respData = docsSnap.docs.map((doc) => {
    const expData = doc.data() as Experience;
    const {createdAt, updatedAt} = expData;
    return Object.assign({}, {id: doc.id}, expData, {createdAt: createdAt.toDate(), updatedAt: updatedAt.toDate()} );
  });
  return res.send(respData);
}

async function updateExperience(req: Request, res: Response) {
  const id = req.params['id'];
  const uid = req.headers['x-uid'];

  const docSnap = await firestore().collection('experiences').doc(id).get();
  if (!docSnap.exists) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'No such record found',
    });
  }

  const expData = docSnap.data() as Experience;
  if (expData.uid !== uid) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Invalid permissions',
    });
  }

  const {summary, role, company, location} = req.body as ExperiencePayload;

  await docSnap.ref.set(
      {
        summary,
        role,
        company,
        location,
        updatedAt: moment().toDate(),
      },
      {merge: true}
  );

  return res.sendStatus(200);
}

async function deleteExperience(req: Request, res: Response) {
  const id = req.params['id'];
  const uid = req.headers['x-uid'];

  const docSnap = await firestore().collection('experiences').doc(id).get();
  if (!docSnap.exists) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'No such record found',
    });
  }

  const expData = docSnap.data() as Experience;
  if (expData.uid !== uid) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Invalid permissions',
    });
  }

  await docSnap.ref.delete();
  return res.sendStatus(200);
}

async function validateExpPayload(
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

  const {company, role, summary, location, status} = req.body as ExperiencePayload;

  if (!company || company.length < 3 || company.length > 50) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Please provide company with 3-50 characters',
    });
  }

  if (!role || role.length < 3 || role.length > 50) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Please provide role with 3-50 characters',
    });
  }

  if (!summary || summary.length > 1000) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Please enter summary with max of 1000 characters',
    });
  }

  if (!location || location.length < 3 || location.length > 50) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Please provide location with 3-50 characters',
    });
  }

  if (!status) {
    return res.status(400).send({
      code: 'invalid-request',
      message: 'Please provide status',
    });
  }

  return next();
}

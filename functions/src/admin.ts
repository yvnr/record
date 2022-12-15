import * as fadmin from 'firebase-admin';

export const app = fadmin.initializeApp({
  credential: fadmin.credential.applicationDefault(),
});

export {auth, database, firestore, storage, messaging} from 'firebase-admin';

import {createExperience, deleteExperience, getExperienceById, getExperienceList, updateExperience, validateExpPayload} from '../../src/api/experience'
import {ErrorCode} from '../../src/errorCodes';

const successData = jest.fn(() =>({
  id: 'univId',
  data: jest.fn().mockReturnValue({
    'emailDomains': ['@umass.edu'],
    'name': 'name',
    'uid': 'uid',
    'createdAt': {
      toDate: () => 'date',
    },
    'updatedAt': {
      toDate: () => 'date',
    },
  }),
  ref: {
    set: jest.fn(),
    delete: jest.fn(),
  },
  exists: true,
}));

const failData = jest.fn(()=>({exists: false}));

const docQuery = jest.fn((id:string)=>({
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  get: id == 'univId' ? successData : failData,
}));

const succGroupQuery = jest.fn(() => ({
  docs: [{
    id: 'id1',
    data: jest.fn().mockReturnValue({
      'data': 'data1',
      'createdAt': {
        toDate: () => 'date',
      },
      'updatedAt': {
        toDate: () => 'date',
      },
    }),
    exists: true,
  }],
  empty: false,
}));

const emptyGroupQuery = jest.fn(() => ({
  docs: [],
  empty: true,
}));

jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(),
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        add: jest.fn(() =>({
          id: 'id',
        })),
        doc: docQuery,
        where: jest.fn((prop, cond, val) => ({
          get: val=='univId' ? succGroupQuery : emptyGroupQuery,
          where: jest.fn(()=>({
            get: val=='univId' ? succGroupQuery : emptyGroupQuery,
          }))
        })),
        get: succGroupQuery,
      })),
    })),
    auth: jest.fn(() =>({
      createUser: jest.fn(()=>({uid: 'uid'})),
      updateUser: jest.fn(),
      setCustomUserClaims: jest.fn(),
      createCustomToken: jest.fn(()=>('sessionToken')),
    })),
  };
});

describe('Validate Experience Payload Function Test cases', ()=>{
  it('Empty body', ()=>{
    const req = { };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      }))};
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });

  it('No Company', ()=>{
    const req = {
      body: {
        'company': undefined,
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      })),
    };
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });

  it('Improper company less than 3 characters', ()=>{
    const req = {
      body: {
        'company': 'im',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      })),
    };
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });

  it('Improper company more than 50 characters', ()=>{
    const req = {
      body: {
        'company': 'company company company company company company company company company company',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      })),
    };
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });

  it('No role', ()=>{
    const req = {
      body: {
        'company': 'company',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      })),
    };
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });

  it('Improper role less than 3 characters', ()=>{
    const req = {
      body: {
        'company': 'company',
        'role': 'ro',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      })),
    };
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });

  it('Improper company more than 50 characters', ()=>{
    const req = {
      body: {
        'company': 'company',
        'role': 'role role rolerolerolerolerolerolerolerolerolerolerolerolerolerolerolerolerole',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      })),
    };
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });

  it('No summary', ()=>{
    const req = {
      body: {
        'company': 'companuy',
        'role': 'role',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      })),
    };
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });

  it('No location', ()=>{
    const req = {
      body: {
        'company': 'company',
        'role': 'role',
        'summary': 'summary',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      })),
    };
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });

  it('Improper location less than 3 characters', ()=>{
    const req = {
      body: {
        'company': 'company',
        'role': 'role',
        'summary': 'summary',
        'location': 'l',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      })),
    };
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });

  it('Improper Location more than 50 characters', ()=>{
    const req = {
      body: {
        'company': 'company',
        'role': 'role',
        'summary': 'summary',
        'location': 'location location location location location location location location location location',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      })),
    };
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });


  it('no status', ()=>{
    const req = {
      body: {
        'company': 'company',
        'role': 'role',
        'summary': 'summary',
        'location': 'location',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      })),
    };
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });


  it('proper payload', ()=>{
    const req = {
      body: {
        'company': 'company',
        'role': 'role',
        'summary': 'summary',
        'location': 'location',
        'status': 'ACCEPTED',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      })),
    };
    const nextFn = jest.fn();
    validateExpPayload(req as any, res as any, nextFn);
  });
});

describe('Create experience', ()=>{
  it('proper data', ()=>{
    const req = {
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
      headers: {
        'x-uid': 'uid',
        'x-univ-id': 'univId',
      },
    };
    const res = {
      sendStatus: (value: any) => {
        expect(value).toBe(200);
      },
    };
    createExperience(req as any, res as any);
  });
});

describe('Update experience', ()=>{
  it('id is invalid', ()=>{
    const req = {
      params: {
        'id': 'id1',
      },
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
      headers: {
        'x-uid': 'uid',
        'x-univ-id': 'univId',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.NotFound);
        },
      })),
    };
    updateExperience(req as any, res as any);
  });

  it('uid is not valid one', ()=>{
    const req = {
      params: {
        'id': 'univId',
      },
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
      headers: {
        'x-uid': 'uid1',
        'x-univ-id': 'univId',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.Unauthorized);
        },
      })),
    };
    updateExperience(req as any, res as any);
  });

  it('proper data', ()=>{
    const req = {
      params: {
        'id': 'univId',
      },
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
      headers: {
        'x-uid': 'uid',
        'x-univ-id': 'univId',
      },
    };
    const res = {
      sendStatus: (value: any) => {
        expect(value).toBe(200);
      },
    };
    updateExperience(req as any, res as any);
  });
});

describe('Delete experience', ()=>{
  it('id is invalid', ()=>{
    const req = {
      params: {
        'id': 'id1',
      },
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
      headers: {
        'x-uid': 'uid',
        'x-univ-id': 'univId',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.NotFound);
        },
      })),
    };
    deleteExperience(req as any, res as any);
  });

  it('uid is not valid one', ()=>{
    const req = {
      params: {
        'id': 'univId',
      },
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
      headers: {
        'x-uid': 'uid1',
        'x-univ-id': 'univId',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.Unauthorized);
        },
      })),
    };
    deleteExperience(req as any, res as any);
  });

  it('proper data', ()=>{
    const req = {
      params: {
        'id': 'univId',
      },
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
      headers: {
        'x-uid': 'uid',
        'x-univ-id': 'univId',
      },
    };
    const res = {
      sendStatus: (value: any) => {
        expect(value).toBe(200);
      },
    };
    deleteExperience(req as any, res as any);
  });
});

describe('Retrieve experience by id', ()=>{
  it('id is invalid', ()=>{
    const req = {
      params: {
        'id': 'id1',
      },
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
      headers: {
        'x-uid': 'uid',
        'x-univ-id': 'univId',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.NotFound);
        },
      })),
    };
    getExperienceById(req as any, res as any);
  });
  it('id is valid', ()=>{
    const req = {
      params: {
        'id': 'univId',
      },
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
      headers: {
        'x-uid': 'uid',
        'x-univ-id': 'univId',
      },
    };
    const res = {
      send: (value: any) => {
        expect(value.id).toBe('univId');
      },
    };
    getExperienceById(req as any, res as any);
  });
});

describe('Retrieve all experiences', ()=>{
  it('retrieve all experiences', ()=>{
    const req = {
      query: {
        'company': 'company',
      },
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
      headers: {
        'x-uid': 'uid',
        'x-univ-id': 'univId',
      },
    };
    const res = {
      send: (value: any) => {
        expect(value.length).toBe(1);
      },
    };
    getExperienceList(req as any, res as any);
  });
});



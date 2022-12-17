import {getUserById, registerUser, updateUser, validateCreateUserPayload, validateUpdateUserPayload} from '../../src/api/user';
import {ErrorCode} from '../../src/errorCodes';

const successData = jest.fn(() =>({
  id: 'univId',
  data: jest.fn().mockReturnValue({
    'emailDomains': ['@umass.edu'],
    'name': 'name',
  }),
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
        doc: docQuery,
        where: jest.fn((prop, cond, val) => ({
          get: val=='umass@umass.edu' ?succGroupQuery : emptyGroupQuery,
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

describe('Validate Create Payload Function Test cases', ()=>{
  it('Empty body', ()=>{
    const req = { };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      }))};
    const nextFn = jest.fn();
    validateCreateUserPayload(req as any, res as any, nextFn);
  });

  it('No email', ()=>{
    const req = {
      body: {
        'email': undefined,
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
    validateCreateUserPayload(req as any, res as any, nextFn);
  });

  it('Improper email', ()=>{
    const req = {
      body: {
        'email': 'improper email',
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
    validateCreateUserPayload(req as any, res as any, nextFn);
  });

  it('No password', ()=>{
    const req = {
      body: {
        'email': 'improper email',
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
    validateCreateUserPayload(req as any, res as any, nextFn);
  });

  it('password with less than 8 characters', ()=>{
    const req = {
      body: {
        'email': 'umass@umass.edu',
        'password': 'abc',
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
    validateCreateUserPayload(req as any, res as any, nextFn);
  });

  it('password with more than 50 characters', ()=>{
    const req = {
      body: {
        'email': 'umass@umass.edu',
        'password': 'password password password password password password password password',
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
    validateCreateUserPayload(req as any, res as any, nextFn);
  });

  it('no univId', ()=>{
    const req = {
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
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
    validateCreateUserPayload(req as any, res as any, nextFn);
  });

  it('no name', ()=>{
    const req = {
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
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
    validateCreateUserPayload(req as any, res as any, nextFn);
  });

  it('name less than 4', ()=>{
    const req = {
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'abc',
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
    validateCreateUserPayload(req as any, res as any, nextFn);
  });

  it('name more than 50', ()=>{
    const req = {
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name name namename name name name name name name name name  name name name name name',
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
    validateCreateUserPayload(req as any, res as any, nextFn);
  });

  it('proper payload', ()=>{
    const req = {
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
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
    validateCreateUserPayload(req as any, res as any, nextFn);
  });
});

describe('Validate Update Payload Function Test cases', ()=>{
  it('Empty body', ()=>{
    const req = { };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidPayload);
        },
      }))};
    const nextFn = jest.fn();
    validateUpdateUserPayload(req as any, res as any, nextFn);
  });

  it('no name', ()=>{
    const req = {
      body: {
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
    validateUpdateUserPayload(req as any, res as any, nextFn);
  });

  it('name less than 4', ()=>{
    const req = {
      body: {
        'name': 'abc',
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
    validateUpdateUserPayload(req as any, res as any, nextFn);
  });

  it('name more than 50', ()=>{
    const req = {
      body: {
        'name': 'name name namename name name name name name name name name  name name name name name',
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
    validateUpdateUserPayload(req as any, res as any, nextFn);
  });

  it('proper payload', ()=>{
    const req = {
      body: {
        'name': 'name',
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
    validateUpdateUserPayload(req as any, res as any, nextFn);
  });
});

describe('Creating user in auth and firestore doc', ()=>{
  it('email is already registered', ()=>{
    const req = {
      body: {
        'email': 'umass@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.EmailAlreadyRegistered);
        },
      })),
    };
    registerUser(req as any, res as any);
  });

  it('new email and univId is not registered', ()=>{
    const req = {
      body: {
        'email': 'umass@umass1.edu',
        'password': 'password12',
        'univId': 'univId1',
        'name': 'name',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.NotFound);
        },
      })),
    };
    registerUser(req as any, res as any);
  });

  it('email domain is not registered', ()=>{
    const req = {
      body: {
        'email': 'umass@umass1.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidRequest);
        },
      })),
    };
    registerUser(req as any, res as any);
  });


  it('proper data', ()=>{
    const req = {
      body: {
        'email': 'umass1@umass.edu',
        'password': 'password12',
        'univId': 'univId',
        'name': 'name',
      },
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidRequest);
        },
      })),
      send: jest.fn((value:any)=>{
        expect(value.sessionToken).toBe('sessionToken');
      }),
    };
    registerUser(req as any, res as any);
  });
});

describe('Updating user in auth and firestore doc', ()=>{
  it('mismatch header n path params', ()=>{
    const req = {
      params: {'id': 'id'},
      headers: {
        'x-uid': 'id1',
      },
      body: {name: 'name'},
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.InvalidRequest);
        },
      })),
    };
    updateUser(req as any, res as any);
  });


  it('proper data', ()=>{
    const req = {
      params: {'id': 'id'},
      headers: {
        'x-uid': 'id',
      },
      body: {name: 'name'},

    };
    const res = {
      sendStatus: (value: any) => {
        expect(value).toBe(200);
      },
    };
    updateUser(req as any, res as any);
  });
});

describe('Get user', ()=>{
  it('mismatch header n path params', ()=>{
    const req = {
      params: {'id': 'dummyID'},
    };
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.NotFound);
        },
      })),
    };
    getUserById(req as any, res as any);
  });


  it('proper data', ()=>{
    const req = {
      params: {'id': 'univId'},
      headers: {
        'x-uid': 'id',
      },
    };
    const res = {
      send: (value: any) => {
        expect(value.id).toBe('univId');
      },
    };
    getUserById(req as any, res as any);
  });
});


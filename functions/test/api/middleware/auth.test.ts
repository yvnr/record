import {ErrorCode} from '../../../src/errorCodes';
import validateAuthHeaders from '../../../src/api/middleware/auth';


jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(),
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(()=>({
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          get: jest.fn(() =>({
            id: 'id1',
            data: jest.fn().mockReturnValue({
              'apiKey1': 'apiSecret1',
            }),
            exists: true,
          })),
        })),
        where: jest.fn(),
        get: jest.fn(() => ({
          docs: [{
            id: 'id1',
            data: jest.fn().mockReturnValue({
              'data': 'data1',
            }),
            exists: true,
          }],
        })),
      })),
    })),
    auth: jest.fn(() =>({
      createUser: jest.fn(),
      updateUser: jest.fn(),
      setCustomUserClaims: jest.fn(),
      createCustomToken: jest.fn(),
    })),
  };
});

describe('Validating auth Headers', () =>{
  it('no headers', () => {
    const req = {headers: {}};
    const nextFn = jest.fn();
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.Unauthorized);
        },
      })),
    };
    validateAuthHeaders(req as any, res as any, nextFn);
  });

  it('empty authorization header', () => {
    const req = {'headers': {
      'authorization': '',
    },
    'originalUrl': '/api/user/register',
    };
    const nextFn = jest.fn();
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.Unauthorized);
        },
      })),
    };
    validateAuthHeaders(req as any, res as any, nextFn);
  });

  it('only apiKey authorization header', () => {
    const req = {'headers': {
      'authorization': 'apiKey',
    },
    'originalUrl': '/api/user/register',
    };
    const nextFn = jest.fn();
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.Unauthorized);
        },
      })),
    };
    validateAuthHeaders(req as any, res as any, nextFn);
  });

  it('apiKey and secret does not match', () => {
    const req = {'headers': {
      'authorization': 'apiKey1 apiSecret1',
    },
    'originalUrl': '/api/user/register',
    };
    const nextFn = jest.fn();
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.Unauthorized);
        },
      })),
    };
    validateAuthHeaders(req as any, res as any, nextFn);
  });

  it('valid apiKey and apiSecrets matches and exemption request', async () => {
    const req = {'headers': {
      'authorization': 'apiKey1 apiSecret1',
    },
    'originalUrl': '/api/user/register',
    'method': 'POST',
    };
    const nextFn = () => 'success';
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.Unauthorized);
        },
      })),
    };
    const result = await validateAuthHeaders(req as any, res as any, nextFn);
    expect(result).toBe('success');
  });

  it('valid apiKey and apiSecrets matches and non-exemption request', () => {
    const req = {'headers': {
      'authorization': 'apiKey1 apiSecret1',
    },
    'originalUrl': '/api/user',
    };
    const nextFn = jest.fn();
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.Unauthorized);
        },
      })),
    };
    validateAuthHeaders(req as any, res as any, nextFn);
  });

  it('no uid', () => {
    const req = {'headers': {
      'authorization': 'apiKey1 apiSecret1',
    },
    'originalUrl': '/api/application',
    };
    const nextFn = jest.fn();
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.Unauthorized);
        },
      })),
    };
    validateAuthHeaders(req as any, res as any, nextFn);
  });

  it('no univId', () => {
    const req = {'headers': {
      'authorization': 'apiKey1 apiSecret2',
      'x-uid': 'uid',
    },
    'originalUrl': '/api/application',
    };
    const nextFn = jest.fn();
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.Unauthorized);
        },
      })),
    };
    validateAuthHeaders(req as any, res as any, nextFn);
  });

  it('all headers available for non-exempt requests', async () => {
    const req = {'headers': {
      'authorization': 'apiKey1 apiSecret1',
      'x-uid': 'uid',
      'x-univ-id': 'univId',
    },
    'originalUrl': '/api/application',
    };
    const nextFn = () => 'success';
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.Unauthorized);
        },
      })),
    };
    const result = await validateAuthHeaders(req as any, res as any, nextFn);
    expect(result).toBe('success');
  });
});

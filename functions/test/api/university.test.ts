import {getUnivList, getUnivById} from '../../src/api/university';
import {ErrorCode} from '../../src/errorCodes';

const successData = jest.fn(() =>({
  id: 'id1',
  data: jest.fn().mockReturnValue({
    'data': 'data1',
  }),
  exists: true,
}));

const failData = jest.fn(()=>({exists: false}));

jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(),
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn((id:string)=>({
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          get: id == 'id1' ? successData : failData,
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


describe('Test cases for Unviersity endpoint', () =>{
  it('retirieving all universities', () => {
    const req = {};
    const res = {
      send: (value: any) => {
        expect(value.length).toBe(1);
      },
    };
    getUnivList(req as any, res as any);
  });


  it('retirieving existing university with an id', () => {
    const req = {params: {'id': 'id1'}};
    const res = {
      send: (value: any) => {
        expect(value.id).toBe('id1');
      },
    };
    getUnivById(req as any, res as any);
  });

  it('retirieving non existing university', () => {
    const req = {params: {'id': 'id2'}};
    const res = {
      status: jest.fn(() =>({
        send: (value: any) => {
          expect(value.code).toBe(ErrorCode.NotFound);
        },
      })),
    };

    getUnivById(req as any, res as any);
  });
});



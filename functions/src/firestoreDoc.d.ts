type Timestamp = import('@google-cloud/firestore').Timestamp;

type Experience = {
  company: string;
  role: string;
  location: string;
  summary: string;
  univId: string;
  uid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type University = {
  name: string;
  logo: string;
  emailDomains: string[];
};

type User = {
  name: string;
  email: string;
  univId: string;
};

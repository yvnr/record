/**
 * Listing down data representation of document in each collection
 */

type Timestamp = import('@google-cloud/firestore').Timestamp;


// Experience document data
type Experience = {
  company: string;
  role: string;
  location: string;
  summary: string;
  univId: string;
  uid: string;
  status: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Unviersity document data
type University = {
  name: string;
  logo: string;
  emailDomains: string[];
};

// User document data
type User = {
  name: string;
  email: string;
  univId: string;
};

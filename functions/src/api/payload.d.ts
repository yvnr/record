/**
 * Listing down all the request payload we need to process the request
 */

// payload for POST request for user endpoint
type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  univId: string;
};


// payload for PATCH request for user endpoint
type UpdateUserPayload = {
  name: string;
};

// paylaod request for POST and PUT for experience endpoint
type ExperiencePayload = {
  company: string;
  role: string;
  location: string;
  summary: string;
  status: string;
};

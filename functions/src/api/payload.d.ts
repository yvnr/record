type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  univId: string;
};

type UpdateUserPayload = {
  name: string;
};

type ExperiencePayload = {
  company: string;
  role: string;
  location: string;
  summary: string;
  status: string;
};

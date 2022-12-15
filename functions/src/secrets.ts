// In practice, we store these secrets in vaults or storing in environment variables.
// We are pushing it to git, to make integration and understanding easy for everyone. Will be removed in future.
export default {
  apiSecrets: {
    'record-1': '7ff614a2-aa8a-4d1b-997e-fcb7877e91f6',
  } as Record<string, string>,
};

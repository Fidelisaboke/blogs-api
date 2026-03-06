export const requireEnv = (env: string) => {
  if (!process.env[env]) {
    throw new Error(`Environment variable ${env} is required`);
  }
  return process.env[env] as string;
};

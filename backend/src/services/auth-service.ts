import axios, { AxiosRequestConfig } from 'axios';
import { config } from '../config/index.js';

const AUTH_WAKE_TIMEOUT = 10_000;
const AUTH_MAX_ATTEMPTS = 12;
const AUTH_RETRY_DELAY = 5_000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const getAuthHeaders = () => ({
  'x-api-key': config.apiKey,
  'x-project-id': config.projectId,
  'Content-Type': 'application/json'
});

export const waitForAuthService = async (): Promise<boolean> => {
  const healthUrl = `${config.authServiceUrl}/health`;

  console.log('Checking auth-service availability...');

  for (let attempt = 1; attempt <= AUTH_MAX_ATTEMPTS; attempt++) {
    try {
      console.log(
        `Auth-service wake/health check ${attempt}/${AUTH_MAX_ATTEMPTS}`
      );

      const response = await axios.get(healthUrl, {
        timeout: AUTH_WAKE_TIMEOUT,
        validateStatus: () => true
      });

      console.log(
        `Auth-service health response: ${response.status}`
      );

      if (response.status === 200) {
        console.log('Auth-service is ready.');
        return true;
      }

      console.log(
        `Auth-service is not ready yet (${response.status}). Retrying...`
      );
    } catch (error: any) {
      console.log(
        `Auth-service connection failed during wake-up attempt ` +
        `${attempt}/${AUTH_MAX_ATTEMPTS}:`,
        error.code || error.message
      );
    }

    if (attempt < AUTH_MAX_ATTEMPTS) {
      await sleep(AUTH_RETRY_DELAY);
    }
  }

  console.error(
    `Auth-service did not become ready after ` +
    `${AUTH_MAX_ATTEMPTS} attempts.`
  );

  return false;
};

export const authRequestConfig = (): AxiosRequestConfig => ({
  headers: getAuthHeaders(),
  timeout: 60_000
});

export { getAuthHeaders };
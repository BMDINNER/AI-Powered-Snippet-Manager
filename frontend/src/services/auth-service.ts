const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3001';

export const wakeUpAuthService = async (retries = 4, delay = 3000): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Waking up auth-service (attempt ${i + 1}/${retries})...`);
      const response = await fetch(`${AUTH_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) {
        console.log('Auth-service is awake and ready');
        return true;
      }
    } catch (error) {
      console.log(`Auth-service not ready yet (attempt ${i + 1})`);
      if (i === retries - 1) {
        console.warn('Auth-service not responding, proceeding anyway...');
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
};
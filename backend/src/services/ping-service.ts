import axios from 'axios';
import { config } from '../config/index.js';

let pingInterval: NodeJS.Timeout | null = null;

const pingAuthService = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${config.authServiceUrl}/ping`, {
      timeout: 5000,
      validateStatus: () => true
    });
    
    if (response.status === 200 && response.data?.pong === true) {
      console.log(`[Ping] Auth service ping successful at ${new Date().toISOString()}`);
      return true;
    }
    
    console.log(`[Ping] Auth service ping failed with status: ${response.status}`);
    return false;
  } catch (error: any) {
    console.log(`[Ping] Auth service ping error: ${error.message}`);
    return false;
  }
};

export const startPingService = (intervalMinutes: number = 10) => {
  console.log(`[Ping] Starting auth service ping service (every ${intervalMinutes} minutes)`);
  
  // Ping immediately on startup
  pingAuthService().then(success => {
    if (success) {
      console.log('[Ping] Auth service is responsive on startup');
    } else {
      console.log('[Ping] Auth service not responsive on startup, will retry at scheduled interval');
    }
  });
  
  if (pingInterval) {
    clearInterval(pingInterval);
  }
  
  const intervalMs = intervalMinutes * 60 * 1000;
  pingInterval = setInterval(() => {
    pingAuthService();
  }, intervalMs);
  
  console.log(`[Ping] Ping service started, pinging every ${intervalMinutes} minutes`);
};

export const stopPingService = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    console.log('[Ping] Ping service stopped');
  }
};

export const forcePing = async (): Promise<boolean> => {
  console.log('[Ping] Force pinging auth service...');
  return await pingAuthService();
};
import { GroqService } from './groq-service.js';

export class AiRouterService extends GroqService {}

export const aiRouterService = new AiRouterService();
export default aiRouterService;

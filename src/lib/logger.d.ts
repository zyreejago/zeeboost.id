declare module '@/lib/logger' {
  interface WebhookLogger {
    logWebhook(level: string, message: string, data?: any): void;
    logRuntime(action: string, details?: any): void;
    logError(error: Error, context?: string): void;
    logRequest(method: string, url: string, headers: any, body: string): void;
    logResponse(statusCode: number, responseBody: any, processingTime: number): void;
    rotateLogs(): void;
  }
  
  const logger: WebhookLogger;
  export default logger;
}
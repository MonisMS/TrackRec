export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  },
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Task Tracker',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
} as const;

// Type-safe environment validation
if (!config.clerk.publishableKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}
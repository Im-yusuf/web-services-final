// Entry point — starts the Express server on the configured port.
import app from './app';
import { config } from './utils/config';

const start = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`🏠 EcoNest API running on http://localhost:${config.port}`);
      console.log(`📚 API Docs: http://localhost:${config.port}/api/docs`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

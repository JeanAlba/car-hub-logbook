import 'dotenv/config';
import { connectDatabase } from './config/database';
import { app } from './app';

const port = Number(process.env.PORT ?? 3000);

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.info(`server running on http://localhost:${port}`);
      console.info(`documentation on http://localhost:${port}/docs`);
    });
  })
  .catch((error: unknown) => {
    console.error('could not connect to MongoDB', error);
    process.exit(1);
  });

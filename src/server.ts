import 'dotenv/config';
import { conectarBanco } from './configs/database';
import { app } from './app';

const porta = Number(process.env.PORTA ?? 3000);

conectarBanco()
  .then(() => {
    app.listen(porta, () => {
      console.info(`server running on http://localhost:${porta}`);
      console.info(`documentation on http://localhost:${porta}/documentacao`);
    });
  })
  .catch((erro: unknown) => {
    console.error('could not connect to MongoDB', erro);
    process.exit(1);
  });

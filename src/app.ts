import express, { type ErrorRequestHandler, type Request, type Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';
import { AppError } from './errors/appError';
import { routes } from './routes/router';

function getErrorResponse(error: unknown): { status: number; message: string } {
  if (error instanceof AppError) {
    return { status: error.status, message: error.message };
  }

  const status =
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

  if (status === 400) {
    return { status, message: 'Invalid request' };
  }

  if (status === 413) {
    return { status, message: 'Request body too large' };
  }

  return { status: 500, message: 'Internal server error' };
}

const handleError: ErrorRequestHandler = (error: unknown, _req, res, next): void => {
  void next;

  const { status, message } = getErrorResponse(error);

  if (status === 500) {
    console.error('Error processing request', error);
  }

  res.status(status).json({ message });
};

function respondRouteNotFound(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route not found' });
}

export const app = express();

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(routes);
app.use(respondRouteNotFound);
app.use(handleError);

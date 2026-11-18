import { body, serverError, unauthorized } from '../responses';

export const dashboardPaths = {
  '/dashboard': {
    get: {
      tags: ['Dashboard'],
      summary: 'Consolidated overview of cars, spending, warranties and recent services',
      responses: {
        200: body('DashboardSummary'),
        401: unauthorized,
        500: serverError,
      },
    },
  },
};

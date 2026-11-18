import { carPaths } from './cars';
import { dashboardPaths } from './dashboard';
import { healthAndUsersPaths } from './healthAndUsers';
import { serviceRecordPaths } from './serviceRecords';

export const paths = {
  ...healthAndUsersPaths,
  ...dashboardPaths,
  ...carPaths,
  ...serviceRecordPaths,
};

import { carPaths } from './cars';
import { healthAndUsersPaths } from './healthAndUsers';
import { serviceRecordPaths } from './serviceRecords';

export const paths = { ...healthAndUsersPaths, ...carPaths, ...serviceRecordPaths };

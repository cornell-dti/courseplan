import functions from 'firebase-functions';
import { populate } from '../../scripts/population/courses-populate';

const populateCourses = (): void => {
  functions.pubsub.schedule('*/5 * * * *').onRun(async () => {
    populate();
    functions.logger.info('Populated Courses!');
    return null;
  });
};

export default populateCourses;

import {
  GDSServiceAPI
} from 'gds-config';

export default class EventProcessorService {
  checkJobs(callback) {
    try {
      const services = new GDSServiceAPI();
      services.eventServicePort.links.getJobsByStatus.execute({
        params: {
          status: 'NEW'
        }
      }, (err, jobs) => {
        if (err) {
          global.gdsLogger.logError(err);
          throw new Error('Failed getting jobs');
        } else {
          callback(undefined, jobs);
        }
      });
    } catch (err) {
      callback(err);
    }
  }
}
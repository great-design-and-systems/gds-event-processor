import {
  GDSServiceAPI,
  GDSServices,
} from 'gds-config';

import ProcessJob from '../control/process-job';
import batch from 'batchflow';

export default class EventProcessorService {
  checkJobs(callback) {
    try {
      const services = new GDSServiceAPI();
      const GDS_API = process.env.GDS_API;
      if (!GDS_API) {
        throw new Error('GDS_API environment is missing.');
      }
      services.eventServicePort.links.getJobsByStatus.execute({
        params: {
          status: 'NEW'
        }
      }, (err, jobs) => {
        if (err) {
          global.gdsLogger.logError(err);
          throw new Error('Failed getting jobs');
        } else {
          if (jobs.data.data && jobs.data.data.length) {
            new GDSServices().initApi(GDS_API, (errApi, api) => {
              if (errApi) {
                throw new Error('Failed getting api from ' + GDS_API);
              }
              batch(jobs.data.data).parallel()
                .each((i, job, done) => {
                  const jobData = job.data;
                  services.eventServicePort.links.updateJobStatus.execute({
                    params: {
                      eventJobId: jobData._id,
                      status: 'IN_PROGRESS'
                    }
                  }, (errStatus) => {
                    if (errStatus) {
                      global.gdsLogger.logError(err);
                      done();
                    } else {
                      new ProcessJob(services, job, api, (errJob) => {
                        if (errJob) {
                          global.gdsLogger.logError(err);
                          done();
                        } else {
                          done();
                        }
                      });
                    }
                  });
                }).end(() => {
                  callback(undefined, jobs);
                });
            });
          } else {
            callback();
          }
        }
      });
    } catch (err) {
      callback(err);
    }
  }
}
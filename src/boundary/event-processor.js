import CreateProcess from '../control/create-process';
import CreateProcessOptions from '../control/create-process-options';
import RemoveProcessByJobId from '../control/remove-process-by-job-id';
import {
  GDSServiceAPI,
  GDSServices
} from 'gds-config';
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
          new GDSServices().initService(GDS_API, (errApi, api) => {
            if (errApi) {
              throw new Error('Failed getting api from ' + GDS_API);
            }
            batch(jobs.data.data).parallel()
              .each((i, job, done) => {
                try {
                  const jobData = job.data;
                  services.eventServicePort.links.updateJobStatus.execute({
                    params: {
                      eventJobId: jobData._id,
                      status: 'IN_PROGRESS'
                    }
                  }, (errStatus) => {
                    if (errStatus) {
                      throw errStatus;
                    } else {
                     
                    }
                  });
                } catch (err) {
                  global.gdsLogger.logError(err);
                  done();
                }
              }).end(() => {
                callback(undefined, jobs);
              });
          });

        }
      });
    } catch (err) {
      callback(err);
    }
  }
}
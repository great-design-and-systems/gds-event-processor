import ExecuteJob from './execute-job';
export default class ExecuteProcess {
  constructor(services, jobData, api, domain, link, callback) {
    new ExecuteJob(api, options, domain, link, (errExecute) => {
      try {
        if (errExecute) {
          services.eventServicePort.links.updateJobStatus.execute({
            params: {
              eventJobId: jobData._id,
              status: 'LOCKED'
            }
          }, () => {
            throw errExecute;
          });
        } else {
          services.eventServicePort.links.updateJobStatus.execute({
            params: {
              eventJobId: jobData._id,
              status: 'COMPLETED'
            }
          }, (errStatus) => {
            if (errStatus) {
              throw errStatus;
            }
            callback();
          });
        }
      } catch (err) {
        callback(err);
      }
    });
  }
}
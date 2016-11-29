import ExecuteJob from './execute-job';
import CreateProcess from '../create-process';
import CreateProcessOptions from '../create-process-options';
import RemoveProcessByJobId from '../remove-process-by-job-id';
export default class ExecuteProcess {
  constructor(services, job, api, callback) {
    const jobData = job.data;
    const actionSplitted = job.action.split('.');
    const domain = actionSplitted[0];
    const link = actionSplitted[1];
    new CreateProcess(jobData._id, jobData.triggeredBy, domain, (errProcess) => {
      if (errProcess) {
        global.gdsLogger.logError(errProcess);
        callback(errProcess);
      } else {
        try {
          new CreateProcessOptions(services.eventServicePort, jobData._id, (errOptions, options) => {
            if (errOptions) {
              throw errOptions;
            }
            new ExecuteJob(api, options, domain, link, (errExecute) => {
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
            });

          });
        } catch (errDuringProcess) {
          new RemoveProcessByJobId(jobData._id, () => {
            callback(errDuringProcess);
          });
        }
      }
    });

  }
}
import CreateProcess from './create-process';
import CreateProcessOptions from './create-process-options';
import ExecuteJob from './execute-job';
import RemoveProcessByJobId from './remove-process-by-job-id';

export default class ExecuteProcess {
  constructor(services, job, api, optionsValue, callback) {
    const jobData = job.data;
    const actionSplitted = jobData.action.split('.');
    const domain = actionSplitted[0];
    const link = actionSplitted[1];
    new CreateProcess(jobData._id, jobData.triggeredBy, domain, (errProcess) => {
      if (errProcess) {
        global.gdsLogger.logError(errProcess);
        callback(errProcess);
      } else {
        try {
          new CreateProcessOptions(services.eventServicePort, jobData._id, optionsValue, (errOptions, options) => {
            if (errOptions) {
              throw errOptions;
            }
            new ExecuteJob(api, options, domain, link, (errExecute, result) => {
              if (errExecute) {
                services.eventServicePort.links.updateJobStatus.execute({
                  params: {
                    eventJobId: jobData._id,
                    status: 'LOCKED'
                  }
                }, (errLock) => {
                  new RemoveProcessByJobId(jobData._id, () => {
                    callback(errExecute);
                  });
                });
              } else {
                services.eventServicePort.links.updateJobStatus.execute({
                  params: {
                    eventJobId: jobData._id,
                    status: 'COMPLETED'
                  }
                }, (errStatus) => {
                  if (errStatus) {
                    new RemoveProcessByJobId(jobData._id, () => {
                      callback(errStatus);
                    });
                  }
                  new RemoveProcessByJobId(jobData._id, () => {
                    callback(undefined, result.data);
                  });
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
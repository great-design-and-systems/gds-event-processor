import ExecuteProcess from './execute-process';

export default class ExecuteProcedure {
  constructor(services, job, api, optionsValue = undefined, callback) {
    const jobData = job.data;
    const jobId = jobData._id;
    const getJobById = services.eventServicePort.links.getJobById;
    const updateJobStatus = services.eventServicePort.links.updateJobStatus;
    try {
      getJobById.execute({
        params: {
          eventJobId: jobId
        }
      }, (errNextJob, nextJob) => {
        if (errNextJob) {
          throw errNextJob;
        }
        const procedure = nextJob.data.procedure;
        const nextEventJobId = procedure.nextEventJobId;
        if (nextEventJobId) {
          getJobById.execute({
            params: { eventJobId: nextEventJobId }
          }, (errNextEvent, nextEventJob) => {
            if (errNextEvent) {
              throw errNextEvent;
            }
            new ExecuteProcess(services, nextEventJob, api, optionsValue, (errProcess, result) => {
              if (errProcess) {
                throw errProcess;
              }
              if (nextEventJob.procedure && nextEventJob.procedure.nextEventJobId) {
                new ExecuteProcedure(services, nextEventJob, api, result, callback.bind(this));
              } else {
                callback();
              }
            });
          });
        }

      });
    } catch (error) {
      global.gdsLogger.logError(error);
      callback(error);
    }
  }
}
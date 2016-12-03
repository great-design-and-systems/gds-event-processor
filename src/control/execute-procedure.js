import ExecuteProcess from './execute-process';

export default class ExecuteProcedure {
  constructor(services, job, api, callback) {
    const jobData = job.data;
    const jobId = jobData._id;
    const action = jobData.action;
    const getJobById = services.eventServicePort.links.getJobById;
    const updateJobStatus = services.eventServicePort.links.updateJobStatus;
    const updateProcedureContext = services.eventServicePort.links.updateProcedureContext;
    try {
      getJobById.execute({
        params: {
          eventJobId: jobId
        }
      }, (errNextJob, thisJob) => {
        if (errNextJob) {
          throw errNextJob;
        }
        const procedure = thisJob.data.data.procedure;
        const nextEventJobId = procedure.nextEventJobId;
        const context = procedure.context ? JSON.parse(procedure.context) : undefined;
        if (!action || action === 'N/A') {
          updateJobStatus.execute({
            params: {
              eventJobId: nextEventJobId,
              status: 'NEW'
            }
          }, callback);
        } else {
          new ExecuteProcess(services, thisJob.data, api, context, (errProcess, result) => {
            if (errProcess) {
              callback(errProcess);
            } else {
              updateProcedureContext.execute({
                params: {
                  eventJobId: nextEventJobId
                },
                data: result
              }, (errContext) => {
                if (errContext) {
                  callback(errContext);
                } else {
                  updateJobStatus.execute({
                    params: {
                      eventJobId: nextEventJobId,
                      status: 'NEW'
                    }
                  }, callback);
                }
              });
            }
          });
        }
      });
    } catch (error) {
      global.gdsLogger.logError(error);
      callback(error);
    }
  }
}
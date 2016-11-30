export default class ExecuteProcedure {
  constructor(services, job, api, callback) {
    const jobData = job.data;
    const nextEventJobId = jobData.nextEventJobId;
    const getJobById = services.eventServicePort.links.getJobById;
    const updateJobStatus = services.eventServicePort.links.updateJobStatus;
    getJobById.execute({
      params: {
        eventJobId: nextEventJobId
      }
    }, (errNextJob, nextJob) => {
      const procedure = nextJob.data.procedure;
    });
  }
}
import Schedule from 'node-schedule';

export default class ExecuteScheduled {
    constructor(services, job, callback) {
        const jobData = job.data;
        const getJobById = services.eventServicePort.links.getJobById;
        const updateJobStatus = services.eventServicePort.links.updateJobStatus;
        getJobById.execute({
            params: {
                eventJobId: jobData._id
            }
        }, (errScheduledJob, scheduledJobResult) => {
            if (errScheduledJob) {
                callback(errScheduledJob);
            } else {
                const jobId = jobData._id;
                const data = scheduledJobResult.data.data;
                const scheduled = data.scheduled;
                const nextEventJobId = scheduled.nextEventJobId;
                const dateTime = scheduled.dateTime;
                Schedule.scheduleJob(new Date(dateTime), () => {
                    updateJobStatus.execute({
                        params: {
                            eventJobId: nextEventJobId,
                            status: 'NEW'
                        }
                    }, errNextJob => {
                        if (errNextJob) {
                            updateJobStatus.execute({
                                params: {
                                    eventJobId: jobId,
                                    status: 'LOCKED'
                                }
                            }, () => {
                                global.gdsLogger.logError(new Error('Scheduled event failed for job id ' + jobId));
                            });
                        } else {
                            updateJobStatus.execute({
                                params: {
                                    eventJobId: jobId,
                                    status: 'COMPLETED'
                                }
                            }, () => {
                                global.gdsLogger.logInfo('Scheduled event has been triggered for job id ' + jobId);
                            });
                        }
                    });
                });
                callback();
            }
        });
    }
}
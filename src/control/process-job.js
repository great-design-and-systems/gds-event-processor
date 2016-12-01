import ExecuteProcedure from './execute-procedure';
import ExecuteProcess from './execute-process';

export default class ProcessJob {
    constructor(services, job, api, callback) {
        const eventType = job.data.eventType;
        const updateJobStatus = services.eventServicePort.links.updateJobStatus;

        switch (eventType) {
            case 'PROCEDURE':
                new ExecuteProcedure(services, job, api, undefined, (err) => {
                    if (err) {
                        updateJobStatus.execute({
                            params: {
                                eventJobId: job.data._id,
                                status: 'LOCKED'
                            }
                        }, () => {
                            callback(err);
                        });
                    } else {
                        updateJobStatus.execute({
                            params: {
                                eventJobId: job.data._id,
                                status: 'COMPLETED'
                            }
                        }, callback);
                    }
                });
                break;
            case 'SCHEDULED':
                break;
            default:
                new ExecuteProcess(services, job, api, undefined, callback);
                break;
        }

    }
}
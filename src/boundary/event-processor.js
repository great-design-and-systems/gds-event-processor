import CreateProcess from '../control/create-process';
import {
    GDSServiceAPI,
} from 'gds-config';
import batch from 'batchflow';

export default class EventProcessorService {
    checkJobs(callback) {
        try {
            const services = new GDSServiceAPI();
            services.eventServicePort.links.getJobsByStatus.execute({
                params: {
                    status: 'NEW'
                }
            }, (err, jobs) => {
                if (err) {
                    global.gdsLogger.logError(err);
                    throw new Error('Failed getting jobs');
                } else {
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
                                        new CreateProcess(jobData._id, jobData.triggeredBy, (errProcess) => {
                                            if (errProcess) {
                                                throw errProcess;
                                            } else {
                                                done();
                                            }
                                        });
                                    }
                                });
                            } catch (err) {
                                global.gdsLogger.logError(err);
                                done();
                            }
                        }).end(() => {
                            callback(undefined, jobs);
                        });
                }
            });
        } catch (err) {
            callback(err);
        }
    }
}
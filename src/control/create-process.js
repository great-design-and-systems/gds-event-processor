import ProcessModel from '../entity/process';

export default class CreateProcess {
  constructor(eventJobId, triggeredBy, domain, callback) {
    ProcessModel.create({
      eventJobId: eventJobId,
      triggeredBy: triggeredBy,
      domain: domain
    }, (err, result) => {
      if (err) {
        global.gdsLogger.logError(err);
        callback({
          message: 'Error creating process for jobId ' + eventJobId
        });
      } else {
        callback(undefined, result);
      }
    });
  }
}
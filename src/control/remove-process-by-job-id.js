import ProcessModel from '../entity/process';

export default class RemoveProcessByJobId {
  constructor(eventJobId, triggeredBy, callback) {
    ProcessModel.remove({
      eventJobId: eventJobId
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
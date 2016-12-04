import ProcessModel from '../entity/process';

export default class GetProcesses {
    constructor(paginate, callback) {
        ProcessModel.paginate({}, paginate, (err, result) => {
            if (err) {
                global.gdsLogger.logError(err);
                callback({
                    message: 'Failed getting processes '
                });
            } else {
                callback(undefined, result);
            }
        });
    }
}
import lodash from 'lodash';

export default class ExecuteJob {
  constructor(api, options, domain, action, callback) {
    try {
      let process;
      lodash.forIn(api, (apiDomain) => {
        if (apiDomain.domain === domain) {
          process = lodash.get(apiDomain.links, action);
        }
      });
      if (!process) {
        throw new Error('Domain not found: ' + domain);
      } else {
        process.execute(options, (err, result) => {
          if (err) {
            if (err instanceof Error) {
              callback(err);
            } else if (err.message) {
              callback(new Error(err.message));
            } else {
              callback(new Error('Failed executing action ' + action));
            }
          } else {
            callback(undefined, result);
          }
        });
      }
    } catch (err) {
      global.gdsLogger.logError(err);
      callback(err);
    }
  }
}
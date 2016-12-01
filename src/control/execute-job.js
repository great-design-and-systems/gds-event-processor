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
        process.execute(options, callback)
      }
    } catch (err) {
      global.gdsLogger.logError(err);
      callback(err);
    }
  }
}
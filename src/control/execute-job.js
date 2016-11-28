import lodash from 'lodash';

export default class ExecuteJob {
  constructor(api, options, domain, action, callback) {
    lodash.forIn(api, (apiDomain) => {
      if (apiDomain.domainName === domain) {
        lodash.get(apiDomain.links, action).execute(options, callback);
      }
    });
  }
}
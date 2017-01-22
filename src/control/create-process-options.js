import { GDSUtil } from 'gds-config';
import lodash from 'lodash';

export default class CreateProcessOptions {
  constructor(eventServicePort, eventJobId, optionValue, callback) {
    eventServicePort.links.getContextFieldByJobId.execute({
      params: {
        eventJobId: eventJobId
      }
    }, (errContext, eventContexts) => {
      if (errContext) {
        global.gdsLogger.logError(errContext);
        callback({
          message: 'Failed getting input contexts.'
        });
      } else {
        const contexts = eventContexts.data.data || [];
        const options = {};
        contexts.forEach((contextDTO) => {
          const context = contextDTO.data;
          switch (context.type) {
            case 'PATH':
              addField(options, 'params', context.field, context.value, optionValue);
              break;
            case 'HEADER':
              addField(options, 'headers', context.field, context.value, optionValue);
              break;
            case 'QUERY':
              addField(options, 'query', context.field, context.value, optionValue);
              break;
            case 'BODY':
              addField(options, 'data', context.field, context.value, optionValue);
              break;
          }
        });
        callback(undefined, options);
      }
    });
  }
}

function addField(context, type, field, value, optionsValue) {
  if (!lodash.get(context, type)) {
    lodash.set(context, type, {});
  }
  lodash.set(lodash.get(context, type), field, getValue(optionsValue, value));
}

function getMatches(value, regFor) {
  regFor.lastIndex = 0;
  const matches = [];
  let matchers;
  while ((matchers = regFor.exec(value)) !== null) {
    var match = matchers[0];
    matches.push(match);
  }
  return matches;
}

function getValue(optionsValue, value) {
  let resultValue = value;
  const regFor = /(\$)(.*)(;)/g;
  if (regFor.test(resultValue)) {
    if (optionsValue) {
      const matches = getMatches(value, regFor);
      matches.forEach(exp => {
        let expr = exp.replace('$', '').replace(';', '');
        if (expr === 'this') {
          resultValue = optionsValue;
        }
        else {
          new GDSUtil().getJsonValue(optionsValue, expr, (err, result) => {
            if (err) {
              throw err;
            } else {
              resultValue = resultValue.replace(exp, result);
            }
          })
        }
      });
    }
  }
  return new GDSUtil().isJson(resultValue) ? JSON.parse(resultValue) : resultValue.constructor === Array ? JSON.parse(resultValue) : resultValue;
}
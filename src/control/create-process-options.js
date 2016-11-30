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
        const contexts = eventContexts.data || [];
        const options = {};
        contexts.forEach((i, context) => {
          switch (context.data.type) {
            case 'PATH':
              addField(options, 'params', context.data.field, context.data.value, optionValue);
              break;
            case 'HEADER':
              addField(options, 'headers', context.data.field, context.data.value, optionValue);
              break;
            case 'QUERY':
              addField(options, 'query', context.data.field, context.data.value, optionValue);
              break;
            case 'BODY':
              addField(options, 'data', context.data.field, context.data.value, optionValue);
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

function getValue(optionsValue, value) {
  let resultValue = value;
  if (optionsValue) {
    new GDSUtil().getJsonValue(optionsValue, value, (err, result) => {
      if (err) {
        throw err;
      } else {
        resultValue = result;
      }
    })
  }
  return resultValue;
}
import lodash from 'lodash';
export default class CreateProcessOptions {
  constructor(eventServicePort, eventJobId, callback) {
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
              addField(options, 'params', context.data.field, context.data.value);
              break;
            case 'HEADER':
              addField(options, 'headers', context.data.field, context.data.value);
              break;
            case 'QUERY':
              addField(options, 'query', context.data.field, context.data.value);
              break;
            case 'BODY':
              addField(options, 'data', context.data.field, context.data.value);
              break;
          }
        });
        callback(undefined, options);
      }
    });
  }
}

function addField(context, type, field, value) {
  if (!lodash.get(context, type)) {
    lodash.set(context, type, {});
  }
  lodash.set(lodash.get(context, type), field, value);
}
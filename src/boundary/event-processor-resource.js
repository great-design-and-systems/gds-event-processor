import { GDSDomainDTO, GDSDomainPaginateHelper, GDSServiceAPI, GDSServices } from 'gds-config';

import EventProcessorService from './event-processor';

const API = process.env.API_NAME || '/api/event-processor/';
export default class EventProcessorResource {
  constructor(app) {
    const eventProcessorService = new EventProcessorService();
    const services = new GDSServiceAPI();

    app.get('/', (req, res) => {
      const domain = new GDSDomainDTO();
      domain.addGet('getProcesses', 'http://' + req.headers.host + API + 'get-processes');
      res.status(200).send(domain);
    });
    app.get(API + 'get-processes', (req, res) => {
      eventProcessorService.getProcesses(new GDSDomainPaginateHelper(req), (err, result) => {
        if (err) {
          res.status(500).send(new GDSDomainDTO('ERROR_MESSAGE',
            err.message
          ));
        } else {
          const data = [];
          const domain = new GDSDomainDTO('GET-EVENT-PROCESSES', data);
          if (result && result.docs) {
            let docDom;
            result.docs.forEach(doc => {
              docDom = new GDSDomainDTO('EVENT-PROCESS', doc);
              docDom.addGet('getJobById', services.eventServicePort.links.getJobById.url.replace(':eventJobId', doc.eventJobId));
              data.push(docDom);
            });
          }
          res.status(200).send(domain);
        }
      });
    });

    checkNewJobs();
  }
}

function checkNewJobs() {
  const INTERVAL = process.env.BATCH_INTERVAL || 1500;
  const eventProcessorService = new EventProcessorService();
  eventProcessorService.checkJobs((err, job) => {
    if (err) {
      global.gdsLogger.logError(err);
    }
    setTimeout(() => {
      new checkNewJobs();
    }, INTERVAL);
  });
}
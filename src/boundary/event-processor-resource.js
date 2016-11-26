import EventProcessorService from './event-processor';
import schedule from 'node-schedule';

export default class EventProcessorResource {
  constructor() {
    checkNewJobs();
  }
}

function checkNewJobs() {
  const INTERVAL = process.env.BATCH_INTERVAL || 900;
  const eventProcessorService = new EventProcessorService();
  eventProcessorService.checkJobs((err, job) => {
    if (err) {
      global.gdsLogger.logError(err);
    }
    setTimeout(checkNewJobs, INTERVAL);
  });
}
import {
  GDSDatabase,
  GDSUtil,
  GDSServices
} from 'gds-config';
import EventProcessorResource from './boundary/event-processor-resource';

const PORT = process.env.PORT || 5000;
new GDSServices().initServices(() => {
  /*  new GDSDatabase().connect((errDB) => {
      if (errDB) {
        console.error(errDB);
      } else {
        new GDSUtil().getLogger(() => {
          new EventProcessorResource();
        });
      }
   });*/
  new GDSUtil().getLogger(() => {
        new EventProcessorResource();
  });
});
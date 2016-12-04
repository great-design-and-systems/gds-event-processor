import {
  GDSDatabase,
  GDSServer,
  GDSServices,
  GDSUtil,
} from 'gds-config';

import EventProcessorResource from './boundary/event-processor-resource';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;
new GDSServices().initServices(() => {
  new GDSDatabase().connect((errDB) => {
    if (errDB) {
      console.error(errDB);
    } else {
      new GDSServer(app);
      new GDSUtil().getLogger(() => {
        app.listen(PORT, () => {
          global.gdsLogger.logInfo('Express is listening to port ' + PORT);
          new EventProcessorResource(app);
        });
      });
    }
  });
});
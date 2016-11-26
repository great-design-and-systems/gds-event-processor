import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const ProcessSchema = mongoose.Schema({
  eventJobId: {
    type: String,
    required: [true, 'Event name is required.']
  },
  triggeredBy: {
    type: String,
    required: [true, 'Triggered by is required']
  },
  createdOn: {
    type: Date,
    default: Date.now
  }
});
EventHistorySchema.plugin(mongoosePaginate);

const ProcessModel = mongoose.model('event-process', ProcessSchema);

export default ProcessModel;
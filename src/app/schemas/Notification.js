import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    product: {
      type: String,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notification', NotificationSchema);

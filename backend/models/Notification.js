    import mongoose from 'mongoose';

    const NotificationSchema = new mongoose.Schema({
      // Jise notification bheji gayi hai
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      // Notification ka title
      title: {
        type: String,
        required: true,
      },
      // Notification ka message
      message: {
        type: String,
        required: true,
      },
      // Notification padh li gayi hai ya nahi
      isRead: {
        type: Boolean,
        default: false,
      },
      // Notification par click karne par kaun sa link khulega (optional)
      link: {
        type: String,
      },
    }, { timestamps: true });

    export default mongoose.model('Notification', NotificationSchema);
    
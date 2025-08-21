    import mongoose from 'mongoose';

    const ActivityLogSchema = new mongoose.Schema({
      // Jis user ne action kiya
      actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      // Kya action kiya
      action: {
        type: String,
        required: true,
        enum: [
          'user_role_updated',
          'user_deleted',
          'plan_created',
          'plan_updated',
          'user_login',
          // Future mein aur actions add kar sakte hain
        ],
      },
      // Action ka target kaun tha (optional)
      targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      // Extra details
      details: {
        type: String,
      },
    }, { timestamps: true });

    export default mongoose.model('ActivityLog', ActivityLogSchema);
    
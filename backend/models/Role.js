    import mongoose from 'mongoose';

    const RoleSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      permissions: [{
        type: String,
        trim: true,
      }],
    }, { timestamps: true });

    export default mongoose.model('Role', RoleSchema);
    
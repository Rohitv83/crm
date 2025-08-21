    import mongoose from 'mongoose';

    const EmailTemplateSchema = new mongoose.Schema({
      // Template ka internal naam
      name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      // Email ka subject line
      subject: {
        type: String,
        required: true,
        trim: true,
      },
      // Email ka poora content (HTML format mein)
      body: {
        type: String,
        required: true,
      },
    }, { timestamps: true });

    export default mongoose.model('EmailTemplate', EmailTemplateSchema);
    
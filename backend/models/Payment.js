    import mongoose from 'mongoose';

    const PaymentSchema = new mongoose.Schema({
      invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      paymentDate: {
        type: Date,
        required: true,
      },
      paymentMethod: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'cash', 'other'],
        default: 'bank_transfer',
      },
      transactionId: {
        type: String,
        trim: true,
      },
      recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      }
    }, { timestamps: true });

    export default mongoose.model('Payment', PaymentSchema);
    
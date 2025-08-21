    import mongoose from 'mongoose';

    const InvoiceItemSchema = new mongoose.Schema({
      description: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true },
    });

    const InvoiceSchema = new mongoose.Schema({
      invoiceNumber: {
        type: String,
        required: true,
        unique: true,
      },
      // The client this invoice is for
      client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      // The superadmin or admin who created the invoice
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      items: [InvoiceItemSchema],
      totalAmount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        required: true,
        enum: ['draft', 'sent', 'paid', 'overdue'],
        default: 'draft',
      },
      dueDate: {
        type: Date,
        required: true,
      },
    }, { timestamps: true });

    export default mongoose.model('Invoice', InvoiceSchema);
    
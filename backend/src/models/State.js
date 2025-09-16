import mongoose, { Schema } from 'mongoose';

const stateSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Ensure a state name is unique within a company
stateSchema.index({ name: 1, companyId: 1 }, { unique: true });

export default mongoose.model('State', stateSchema);


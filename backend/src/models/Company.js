import mongoose, { Schema } from 'mongoose';

const companySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Company', companySchema);


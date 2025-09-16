import mongoose, { Schema } from 'mongoose';

const companyAdminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, // Storing password in plain text as requested
        required: true
    },
    role: {
        type: String,
        default: 'CompanyAdmin'
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

export default mongoose.model('CompanyAdmin', companyAdminSchema);


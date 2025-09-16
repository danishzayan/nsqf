import mongoose, { Schema } from 'mongoose';

const superAdminSchema = new Schema({
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
        default: 'SuperAdmin'
    }
}, { timestamps: true });

export default mongoose.model('SuperAdmin', superAdminSchema);


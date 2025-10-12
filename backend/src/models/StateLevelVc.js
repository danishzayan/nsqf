// models/StateCoordinator.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const stateCoordinatorSchema = new Schema({
    personalInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
    },
    loginCredentials: {
        username: { type: String, required: false, unique: true, sparse: true }, // Added unique and sparse
        password: { type: String, required: true }, // 🚨 REMINDER: Hash this password!
    },
    // ✅ This is the key change. Assigns the coordinator to one or more states.
    managedStateIds: [{
        type: Schema.Types.ObjectId,
        ref: 'State',
        required: true
    }],
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Optional: Add an index for efficient lookups
stateCoordinatorSchema.index({ companyId: 1, 'personalInfo.email': 1 });

const StateCoordinator = mongoose.model('StateCoordinator', stateCoordinatorSchema);
export default StateCoordinator;
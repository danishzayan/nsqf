// models/StateCoordinator.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const stateCoordinatorSchema = new Schema({
    // Grouping for better organization
    personalInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
    },
    loginCredentials: {
        username: { type: String, required: false },
        password: { type: String, required: true },
    },
    // The state they operate in
    stateId: {
        type: Schema.Types.ObjectId,
        ref: 'State',
        required: true
    },
    // The list of trainers this coordinator manages
    managedTrainers: [{
        type: Schema.Types.ObjectId,
        ref: 'Trainer' // Make sure ref name matches the Trainer model
    }],
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
    // The 'assignedSchools' field is removed to prevent data duplication.
    // You can derive this list from the schools of the 'managedTrainers'.

}, { timestamps: true });

const StateCoordinator = mongoose.model('StateCoordinator', stateCoordinatorSchema);
export default StateCoordinator;
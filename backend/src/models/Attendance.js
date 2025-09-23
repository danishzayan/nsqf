// models/Attendance.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const attendanceSchema = new Schema({
    // studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
    status: {
        type: String,
        enum: ['present', 'absent'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
     checkInTime: { type: Date },
    checkOutTime: { type: Date },
    // Store the location where attendance was marked
    markedLocation: {
        type: {
            type: String,
            enum: ['Point'],
            // required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            // required: true
        }
    }
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
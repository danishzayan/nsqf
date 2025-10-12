import mongoose, { Schema } from 'mongoose';

const attendanceCorrectionRequestSchema = new Schema({
    // Link to the original attendance record that needs correction
    attendanceId: {
        type: Schema.Types.ObjectId,
        ref: 'Attendance',
        required: true,
    },
    // The trainer who is making the request
    trainerId: {
        type: Schema.Types.ObjectId,
        ref: 'Trainer',
        required: true,
    },
    // The coordinator who must approve the request
    coordinatorId: {
        type: Schema.Types.ObjectId,
        ref: 'StateCoordinator',
        required: true,
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    // The trainer's reason for the correction
    reason: {
        type: String,
        required: true,
    },
    // The status of the request
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    // Optional: A comment from the coordinator when they approve/reject
    coordinatorComment: {
        type: String,
    }
}, { timestamps: true });

// Index for efficient querying by coordinator
attendanceCorrectionRequestSchema.index({ coordinatorId: 1, status: 1 });

const AttendanceCorrectionRequest = mongoose.model('AttendanceCorrectionRequest', attendanceCorrectionRequestSchema);
export default AttendanceCorrectionRequest;
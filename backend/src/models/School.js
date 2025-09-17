import mongoose from 'mongoose';
const { Schema } = mongoose;

const schoolSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    uid:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number], // Array of numbers for [longitude, latitude]
            required: true
        }
    },
    address: {
        type: String,
        required: true,
    },
    blockId: {
        type: Schema.Types.ObjectId,
        ref: 'Block',
        required: true
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    // This array provides a quick way to see which trades are offered.
    trades: [{
        type: Schema.Types.ObjectId,
        ref: 'Trade'
    }]
}, { timestamps: true });

const School = mongoose.model('School', schoolSchema);
export default School;

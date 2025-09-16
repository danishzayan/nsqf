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
    location: { // As per diagram: GeoLocation. Storing as a simple string for now.
        type: String,
        required: true
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

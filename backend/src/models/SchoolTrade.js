import mongoose from 'mongoose';
const { Schema } = mongoose;

// This model represents the many-to-many relationship between School and Trade
const schoolTradeSchema = new Schema({
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    tradeId: [{
        type: Schema.Types.ObjectId,
        ref: 'Trade',
        required: true
    }],
    assignedDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure a school can only have a specific trade assigned once.
schoolTradeSchema.index({ schoolId: 1, tradeId: 1 }, { unique: true });

const SchoolTrade = mongoose.model('SchoolTrade', schoolTradeSchema);
export default SchoolTrade;

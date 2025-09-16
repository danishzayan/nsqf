import mongoose, { Schema } from 'mongoose';

const blockSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    districtId: {
        type: Schema.Types.ObjectId,
        ref: 'District',
        required: true
    },
    pincode:{
         type: String,
        required: true
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Ensure a block name is unique within a district
blockSchema.index({ name: 1, districtId: 1 }, { unique: true });

export default mongoose.model('Block', blockSchema);


import mongoose from 'mongoose';
const { Schema } = mongoose;

const tradeSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const Trade = mongoose.model('Trade', tradeSchema);
export default Trade;

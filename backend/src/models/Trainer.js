import mongoose from 'mongoose';
const { Schema } = mongoose;

const trainerSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    tradeId: {
      type: Schema.Types.ObjectId,
      ref: 'Trade',
      required: true,
    },
  //  location: {
  //       type: {
  //           type: String,
  //           enum: ['Point'], // 'location.type' must be 'Point'
  //           required: true
  //       },
  //       coordinates: {
  //           type: [Number], // Array of numbers for [longitude, latitude]
  //           required: true
  //       }
  //   },
    // Personal information (flattened)
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }, // plain text password as per your setup
   
    status: {
      type: String,
      enum: ['active', 'inactive', ],
      default: 'active',
    },
       coordinatorId: {
        type: Schema.Types.ObjectId,
        ref: 'StateCoordinator' // Must match the model name of your coordinator
    }
  },
  { timestamps: true }
);

const Trainer = mongoose.model('Trainer', trainerSchema);
export default Trainer;

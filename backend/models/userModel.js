import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['buyer', 'agent', 'admin'],
    default: 'buyer',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// UserSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) {
//     next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// UserSchema.methods.matchPassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

const userModel = mongoose.model('User', UserSchema)
export default userModel;

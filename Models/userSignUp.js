const bcrypt = require('bcryptjs'); // Add this line at the top
const mongoose=require ('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please enter your name']
  },
  email:{
    type: String,
    required: [true, 'please enter your email'],
    unique:true,
    lowercase:true,
    validate:[validator.isEmail, 'please enter a valid email'],
  },
  password:{
    type:String,
    required:[true,'please enter a password'],
    minlength: 7,
    select: false
    
  }
});
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified('password')) return next();
  
  // Hash the password with a salt round of 12
  this.password = await bcrypt.hash(this.password, 12);
  
  next();
});
// Instance method to compare passwords
userSchema.methods.comparePasswordInDb = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


const User =mongoose.model('User',userSchema);

module.exports=User;
const dotenv=require('dotenv');
dotenv.config({path:'./config.env'});
const mongoose=require('mongoose');
const app= require('./app');

mongoose.connect(process.env.MONGODB_URI)
.then((conn)=>{
  console.log('DB connection sucessful');
}).catch((error)=>{
  console.log('some error has occured.', error.message);
  process.exit(1); // Exit the process if the connection fails
});


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
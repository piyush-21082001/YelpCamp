var mongoose = require('mongoose')
const dotenv = require("dotenv");

dotenv.config();
const connectDB = async() => {
    console.log("reached here")
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI,
{useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,})
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    }catch(error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}
module.export= connectDB()

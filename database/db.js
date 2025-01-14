const mongoose = require('mongoose');

async function connectToDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected successfully")

    }catch(error){
        console.log('MongoDB connection failed', e);
        process.exit(1)
    }
}

module.exports = connectToDB;
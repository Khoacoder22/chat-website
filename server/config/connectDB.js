const mongoose = require('mongoose')

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        const connection = mongoose.connection
        connection.on('connected', ()=>{ console.log("Connect to DB")})
        connection.on('error', (error) =>{console.log("Something errors in DB")})

    } catch(error){
        console.log("Failed to connect" + error)
    }
}

module.exports = connectDB
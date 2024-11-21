const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB')
const router = require('./routes/index')
// const app = express();
const cookieParser = require('cookie-parser')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const {app, server} = require('./socket/index')

// Enable CORS with specific origin and credentials
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())

// Define the port to listen on
const PORT = process.env.PORT || 8080;

app.get('/',(request,response)=>{
    response.json({
        message : "server running at " + PORT
    })
})

//api endpoint 
app.use('/api', router)

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


connectDB().then(()=>{
// Start the server and log the running port
server.listen(PORT, () =>{ console.log(`Server running at port ${PORT}`)
})
})

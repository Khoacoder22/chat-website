const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { app, server } = require('./socket/index');

// Enable CORS with specific origin and credentials (handle cross-origin cookie sending)
app.use(cors({
    origin: process.env.FRONTEND_URL,   // Replace with your frontend domain
    credentials: true,                  // Allow cookies to be sent cross-origin
}));

// Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Define the port to listen on
const PORT = process.env.PORT || 8080;

app.get('/', (request, response) => {
    response.json({
        message: "Server running at " + PORT
    });
});

// API endpoint
app.use('/api', router);

// Swagger UI for API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connect to database and start the server
connectDB().then(() => {
    // Start the server and log the running port
    server.listen(PORT, () => { 
        console.log(`Server running at port ${PORT}`);
    });
});

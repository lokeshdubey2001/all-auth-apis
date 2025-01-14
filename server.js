require('dotenv').config();
const express = require('express');
const connectToDB = require('./database/db');
const userRoutes = require('./routes/user-routes');
const authRoutes = require('./routes/auth-routes');

const app = express();
const PORT = process.env.SERVER_PORT;

connectToDB();

//view-engine
app.set('view engine', 'ejs');
app.set('views', './views');

//middleware
app.use(express.json());


//routes
app.use('/api/', userRoutes);
app.use('/', authRoutes);

app.listen(PORT, function(){
    console.log(`Server is now running on the port ${PORT}`);
    
})

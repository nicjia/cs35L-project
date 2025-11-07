//Generate an instance of express framework
const express = require('express');
// Make API requests, initialize the server etc. app is an instance of express
const app = express();

//import tables

const db = require('./models'); //goes thorugh every single model/table we created


db.sequelize.sync().then(() => {
    //start the API
    app.listen(3001, () => {
        console.log('Server is running on http://localhost:3001');
    });
});
//now working with no passwrod locally


//create an instance of express library
const express = require('express');
// const app = express();
// //express has a routing system which has already been implemented into the framework
// app.use(express.json()); //middleware to parse json data
const router = express.Router(); // now we use router as the end point for Tasks.js

const { Tasks } = require('../models'); // we will use this to interact with the database
router.get("/", async (req, res) => {
    //res.send("GET request to the Tasks endpoint");
    const listofTasks = await Tasks.findAll(); // use sequelize to get all tasks from the database
    res.json(listofTasks); // send the list of tasks as a json response
}   
); // to handle get requests



router.post("/", async (req,res) =>{
    //use sequilize to create a new task in the database
    const task = req.body; // get the task data from the request body
    await Tasks.create(task); // create a new task in the database
    res.json(task); // send the created task back as a response
}); // to handle post requests

module.exports = router;//we need to access this router from index.js
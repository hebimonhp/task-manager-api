const express = require('express');
require('./db/mongoose');
const userRouter = require('./router/user');
const tasksRouter = require('./router/tasks');

const app = express();
const port = process.env.PORT;


// Middleware
// app.use((req,res,next) => {
//     if (req.method === "GET") {
//         res.send('GET Request is disabled');
//     } else {
//         next();
//     }
// });
// app.use((req,res,next) => {
//     res.status(503).send('Server is updating');
// });


app.use(express.json());
app.use(userRouter);
app.use(tasksRouter);

app.listen(port, () => {
    console.log('Server is up on ' + port)
});

// const Task = require('./models/tasks');
// const User = require('./models/user');

// const main = async () => {
    // const task = await Task.findById('5e6f9b1034637e4f0b44070a');
    // find user owner by owner field
    // await task.populate('owner').execPopulate();
    // console.log(task.owner);


    // const user = await User.findById('5e6f9a8f34637e4f0b440706');
    // await user.populate('tasks').execPopulate();
    // console.log(user.tasks);
// };


// main();

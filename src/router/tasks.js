const express = require('express');
const Tasks = require('../models/tasks');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/tasks',auth, async (req, res) => {
    const task = new Tasks({
        ...req.body,
        owner: req.user._id
        }
    );
    try {
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

// GET /TASKS?completed=true
// GET /TASKS?limit=10&skip
// GET /tasks?sortBy=?createdAt_asc
router.get('/tasks', auth,async (req,res) => {
    const match = {};
    // if completed get is request
    if (req.query.completed) {
        // if completed string equal to true
        match.completed = req.query.completed === 'true';
    }

    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        // ternary operator : conditions , value if condition is true and false
        sort[parts[0]] = parts[1] === 'desc' ? -1:1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options : {
                // if limit request is not exist => mongoose will ignore
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
                // sort: {
                //     // asc = 1, desc = -1
                //     // createdAt : 1
                //
                //     // completed: 1
                // }
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/tasks/:id',async (req,res) => {
    const _id = req.params.id;
    try {
        const task = await Tasks.findById(_id);
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/tasks/:id', async (req,res) => {
    const updates = Object.keys(req.body);
    const validUpdates = ['description','completed'];
    const isValid = updates.every(update => validUpdates.includes(update));
    if (!isValid) {
        return res.status(400).send('Invalid Update');
    }
    try {
        const task = await Tasks.findById(req.params.id);
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();

        if (!task) {
            return res.status(404).send();
        }
        res.status(200).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete('/tasks/:id',async (req, res) =>  {
    try {
        const task = await Tasks.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
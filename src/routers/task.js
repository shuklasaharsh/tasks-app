// NPM modules
const express = require('express')
// File imports
    // models
const Task = require('../models/task')
    // Middleware
const auth = require('../middleware/auth')

const router = new express.Router()
// Task Creation
router.post('/tasks', auth, async (req,res)=>{

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Read all tasks
//GET /tasks?completed=true
//GET /tasks?limit=10&skip=0: First 10 results
//GET /tasks?limit=10&skip=30: Skip the first 30 results (First three pages) And show 10 results
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = (parts[1]==='desc'?-1:1)
    }
    try {
        // const tasks = await Task.find({owner: req.user._id})
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Read Task by ID
router.get('/tasks/:id', auth, async (req,res)=>{
    const _id = req.params.id;
    try {
        const task = await  Task.findOne({_id: _id, owner: req.user._id})
        if (!task) {
            return res.status(404).send('not found')
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }

})

// Update Task by ID
router.patch('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send('invalid')
    }
    try {
        // const task = await Task.findByIdAndUpdate(_id, req.body, { new:true, runValidators: true})
        const task = await Task.findOne({_id: _id, owner: req.user._id})
        if (!task) {
            return res.status(404).send('Not found')
        }
        updates.forEach((update)=>task[update] = req.body[update])
        await task.save()
        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete Task By ID
router.delete('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if (!task) {
            return res.status(404).send('Not Found')
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

/*const fin1 = async () => {
    const task = await Task.findById('60e13b42cdb8d006306ab347')
    await task.populate('owner').execPopulate()
    console.log(task.owner)
}*/



// fin1()

module.exports = router
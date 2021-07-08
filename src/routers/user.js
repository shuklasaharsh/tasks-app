// NPM imports
const express = require('express')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const sharp = require('sharp')
// Files
    // Models
const User = require('../models/user')
    //Middleware
const auth = require('../middleware/auth')
    //Email
const mail = require('../emails/account')
// Multer object for Upload

const avatarUpload = multer({
    limits: {
        fileSize: 2000000
    },
    fileFilter(req,file,callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            callback(new Error('File must be Jpg, Jpeg or PNG'))
        }

        callback(undefined, true)
    }
})

const router = new express.Router()
// User Creation
router.post('/users', async (req,res)=>{
    const user = new User(req.body)
    try {
        const token = await user.generateAuthToken()
        await user.save()
        //mail.sendWelcomeEmail(user.email, user.name)
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})
// read all users
router.get('/users/me', auth, async (req,res)=>{
    res.status(200).send(req.user)
})
// Read User
router.get('/users/me', auth, async (req,res)=>{

    try {
        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})
// update user by id
router.patch('/users/me', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send('invalid updates')
    }

    try {
        // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true})
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})
// Delete User by ID
router.delete('/users/me', auth, async (req,res) => {
    try {
        //mail.sendDeletionEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})


//imc Log in Route
router.post('/users/login', async (req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

//imc Log out route
router.post('/users/logout', auth, async (req , res)=> {
        try {
            // console.log('Starting')
            // console.log(req.user.tokens)
            req.user.tokens = req.user.tokens.filter((token)=>{
                return token.token !== req.token
            })
            // console.log(req.user.tokens)
            // console.log('Ending')
            await req.user.save()
            res.send()
        } catch (e) {
            res.status(500).send()
        }
})
//imc Log out all
router.post('/users/logoutAll', auth, async (req , res)=> {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send('Logged Out')
    } catch (e) {
        res.status(500).send('Internal Server Error\n' + e)
    }
})

// END OF CRUD AND AUTH OPS

// AVATAR
const errorMiddleware = (req,res,next)=> {
    throw new Error("Test")
}

router.post('/users/me/avatar',auth, avatarUpload.single('img'),async (req, res)=> {
    // req.user.avatar = req.file.buffer
    req.user.avatar = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    await req.user.save()
    res.status(200).send('done')
}, (e, req,res,next)=> {
    res.status(400).send({error: e.message})
})

router.delete('/users/me/avatar', auth, async (req, res)=> {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send('Remove OK')
})

router.get('/users/:id/avatar', async (req,res)=> {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }


})

/*const fin2 = async () => {
    const user = await User.findById('60e12521eab49e0436e72e06')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
}

fin2()*/


module.exports = router
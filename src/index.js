// NPM Imports
const express = require('express')
const bcrypt = require('bcryptjs')
const multer = require('multer')
// File imports
    // Data
require('./db/mongoose')
    // Routers
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
    // Middleware
const maintenance = require('./middleware/maintenance')


const app = express()
const port = process.env.PORT
app.use(maintenance)
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


// Starting server on port
app.listen(port, ()=>{
    console.log("Server listening on port: ", port)
})
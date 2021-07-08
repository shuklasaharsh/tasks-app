
// App
const app = require('./app')
const port = process.env.PORT

// Starting server on port
app.listen(port, ()=>{
    console.log("Server listening on port: ", port)
})
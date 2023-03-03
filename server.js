require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')
const express = require('express')
const app = express()
port = 3000

const todoRouter = require('./routers/todos.js')
const listRouter = require('./routers/lists.js')
const userRouter = require('./routers/users.js')

app.use(cors())
app.use(express.json())

app.use('/todos', todoRouter)
app.use('/lists', listRouter)
app.use('/users', userRouter)

// error middleware
app.use((err, req, res, next) => {
    if(!err.statusCode) err.message = 'something went wrong'
    res.status(err.statusCode || 500).send(err.message)
})

mongoose.set('strictQuery', true)
mongoose.connect('mongodb://127.0.0.1:27017/db', err => {
    if(err) console.log(err)
    else console.log("DATABASE CONNECTED SUCCESSFULLY")
})
app.listen(port, () =>{
    console.log(`SERVER CONNECTED ON PORT ${port}`)
})
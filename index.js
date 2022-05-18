const express = require('express')
const cors = require('cors')
require('dotenv').config()
const cookieParser = require("cookie-parser");


const app = express()


const whitelist = ['http://localhost:3000']
const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  }
app.use(cors(corsOptions))

const connectMongoDB = require('./db')

connectMongoDB()


app.use(cookieParser());
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


const routes = require('./router')

routes(app)

const PORT = process.env.PORT || 3000

app.listen(PORT, function() {
    console.log(`Server đang chạy PORT ${PORT}`)
})
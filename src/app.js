import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))


app.use(express.json({limit:'16kb'})) //form data 
app.use(express.urlencoded({extended: true, limit: '16kb'})) //for url form submission
app.use(express.static('public')) //for public files 
app.use(cookieParser()) // parses cookie sent by client we can access and manipulate cookies 


export {app}
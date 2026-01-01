
import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from 'dotenv'
dotenv.config({
    path:'./.env'
})



connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on PORT: ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("MongoDB Connection failed !!! ",error);   
})

// import { DB_NAME } from "./constants";

// //IIFE -- immediately excutes function without calling function it immediately executes the function 

// const app = express();
// (async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
//         mongoose.on("error",(error) => {
//             console.log("ERR: ",error)
//             throw error
//         })

//         app.listen(process.env.PORT,() => {
//             console.log(`app is listening on port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.log(error);
//         throw error;
//     }
// }) ()



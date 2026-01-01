
import connectDB from "./db/index.js";




connectDB();

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



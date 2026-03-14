import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //one who is subscribing
        ref: User
    },
    channel: {
        type: Schema.Types.ObjectId, //one to  whom subscriber is subscribing
        ref: User
    },

},{timestamps:true});


export const Subscription = mongoose.model("Subscription",subscriptionSchema)

// in subscrition model we have 2 fileds one is subscriber and other is channel subscried by subscriber 

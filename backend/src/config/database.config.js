import mongoose from "mongoose"
import {Env} from "./env.config.js"

const connectDatabase=async()=>
{
    try
    {
        await mongoose.connect(Env.MONGO_URI)
        console.log('connected to mongo database')
    }
    catch(error)
    {
        console.error(`Error connecting to mongo database`)
        process.exit(1)
    }
}

const disconnectDatabase=async()=>
{
    try
    {
     await mongoose.disconnect()
     console.log(`Disconnected from mongo database`)

    }
    catch(error)
    {
        console.log(`Error disconnecting from mongo database`)
        process.exit(1)
    }
}

export {connectDatabase,disconnectDatabase}
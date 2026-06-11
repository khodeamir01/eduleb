const dotenv = require("dotenv");
const mongoose = require("mongoose");

const isProductionMode = process.env.NODE_ENV === "production";

if (!isProductionMode) dotenv.config({quiet: true});
const app = require("./app");

async function connectToDB() {
    
    try {

        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected : ${mongoose.connection.host}`);
        
    } catch (error) {
        console.log(`Error in mongoose connection : ${error}`);
        process.exit(1);
    }

};

async function startServer() {
    
    const port = +process.env.PORT || 3000
    
    app.listen(port, () => {
        console.log(`Server is running in ${isProductionMode ? "production" : "development"} mode on port ${port}`);
    })
};

async function run () {
   await connectToDB();
   await startServer();
};

run();
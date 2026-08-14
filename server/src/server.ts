import "dotenv/config"; import app from "./app"; import { connectDatabase } from "./config/db";
const port=Number(process.env.PORT||5000); connectDatabase().then(()=>app.listen(port,()=>console.log(`API listening on ${port}`))).catch(error=>{console.error("Unable to start server",error);process.exit(1);});

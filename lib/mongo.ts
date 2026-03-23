import mongoose from "mongoose"

const mongoEnv: any = process.env.MONGO_URI
const connection: any = {}
async function mongoConnect() {
  if(connection.isConnected) {
    return;
  }

  const db = await mongoose.connect(mongoEnv)

  connection.isConnected = db.connections[0].readyState
}

export default mongoConnect
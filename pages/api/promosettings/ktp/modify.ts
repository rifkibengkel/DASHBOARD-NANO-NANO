import * as model from "./_model"
import dayjs from "dayjs"

// const authGuard = async (req, res) => {
//     const session = await getSession({req})
//     if (!session) {
//         return res.status(401).json({message: "Unauthorized!!!"})
//     } else {
//         return handler(req, res)
//     }
// }

// const handler = async (req, res) => {
//     const id = VRQ(req.body.id, "num")
//     const startTime = dayjs('12/12/1212 ' + req.body.startTime, "DD/MM/YYYY HH:mm:ss").format("HH:mm:ss").toUpperCase();
//     const endTime = dayjs('12/12/1212 ' + req.body.endTime, "DD/MM/YYYY HH:mm:ss").format("HH:mm:ss").toUpperCase();
//     const enabled = VRQ(req.body.enabled, "num") == "" ? 0 : VRQ(req.body.enabled, "num");
//     const limit = VRQ(req.body.limit, "num") == "" ? 0 : VRQ(req.body.limit, "num");
//     const interval = VRQ(req.body.interval, "num") == "" ? 0 : VRQ(req.body.interval, "num");
    
    
//     try {
//         if(id == "" || startTime == "INVALID DATE" || endTime == "INVALID DATE") {
//             res.status(404).json({message: "Parameters Invalid"})
//         } else {
//             // await model.updatePrizeSetting(startTime, endTime, enabled, limit, interval, id)
//             return res.json({message: 'Success'})     
//         }
//     } catch (err) {
//         res.status(500).json({message: err.message})
//     }
// }

// export default authGuard


import * as model from "./_model"
// import dayjs from "dayjs"

interface Input {
    id: string;
    startTime: string;
    endTime: string;
    enabled: string;
    limit: string;
    interval: string;
    purchase_min: string
    purchase_max: string
    userId: number
  }

export const modify = async (param: Input) => {
    try {
      const id = param.id ? param.id : "";
      const startTime = param.startTime ?? "";
      const endTime = param.endTime ?? "";
      const enabled = param.enabled ? param.enabled : '0';
      const limit = param.limit ? param.limit : '0';
      const interval = param.interval ? param.interval : '0';
      const purchase_min = param.purchase_min ?? '0'
      const purchase_max = param.purchase_max ?? '0'
      const userId = param.userId ? param.userId : 0

      if (id == "" || startTime == "INVALID DATE" || endTime == "INVALID DATE") {
        return {
          error: {
            type: "error",
            message: "Invalid Parameter",
            description: "Error",
          },
        };
      }
    
      await model.startTransaction();
      await model.updatePrizeSetting(startTime, endTime, enabled, limit, interval, id, purchase_min, purchase_max, userId)
      await model.commitTransaction();
      return "Success";
    } catch (error) {
        await model.rollback();
        return {
          error: {
            type: "error",
            message: "Something Went Wrong",
            description: "Error",
          },
        };
    }
  };
  
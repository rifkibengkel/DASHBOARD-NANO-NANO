import dayjs from "dayjs";
import * as model from "./_model";

interface Input {
  dateTarget: any;
  prizeId: string;
  region: string;
  quantity: number;
  promoType: string;
  przType: number;
  userId?: number;
}

interface Modifie {
  dateFrom: any;
  prizeId: string;
  dateTo: any;
  quantity: number;
  promoType: string;
  przType: number;
  userId: number;
}

export const save = async (param: Input) => {
  const dateTarget = param.dateTarget
    ? dayjs(param.dateTarget).format("YYYY-MM-DD")
    : "";
  // const regionId = param.region ? param.region : '';
  const prizeId = param.prizeId ? param.prizeId : "";
  const quantity = param.quantity ? param.quantity : 0;
  // const promoType = param.promoType ? param.promoType : ''
  const przType = param.przType ? param.przType : 0;
  const userId = param.userId ? param.userId : 0;
  if (prizeId == "" || quantity == 0) {
    return {
      error: {
        type: "error",
        message: "No Lengkap",
        description: "Error",
      },
    };
  }

  // } else if(przType === 3 && regionId  == "") {
  //     return {
  //         error: {
  //             type: 'error',
  //             message: 'No Lengkap',
  //             description: 'Error'
  //         }
  //     }
  // }

  try {
    await model.startTransaction();
    for (let v = 0; v < quantity; v++) {
      await model.addNewAllocation2(dateTarget, prizeId, userId);
    }

    await model.commitTransaction();
    return "Success";
  } catch (err) {
    await model.rollback();
    return {
      error: {
        type: "error",
        message: "Error dude!",
        description: "Error",
      },
    };
  }
};

export const modify = async (param: Modifie) => {
  const dateFrom = param.dateFrom ? param.dateFrom : "";
  const prizeId = param.prizeId ? param.prizeId : "";
  const dateTo = param.dateTo ? param.dateTo : "";
  const quantity = param.quantity ? param.quantity : 0;
  const promoType = param.promoType ? param.promoType : "";
  const userId = param.userId ? param.userId : 0;

  if (prizeId == "" || quantity == 0) {
    return {
      error: {
        type: "error",
        message: "No Lengkap",
        description: "Error",
      },
    };
  }

  try {
    await model.startTransaction();
    await model.updateAllocation2(prizeId, quantity.toString(), userId);
    await model.commitTransaction();
    return "Success";
  } catch (err) {
    await model.rollback();
    return {
      error: {
        type: "error",
        message: "Error dude!",
        description: "Error",
      },
    };
  }
};

// export const remove = async (param: Input) => {
//     const id = param.id ? param.id : "";

//     if(id == "") {
//         return {
//             error: {
//                 type: 'error',
//                 message: 'No Lengkap',
//                 description: 'Error'
//             }
//         }
//     }

//     try {
//         await model.startTransaction()
//         await model.deleteList(id)
//         await model.commitTransaction()
//         return 'ok'
//     } catch(err) {
//         await model.rollback()
//         return {
//             error: {
//                 type: 'error',
//                 message: 'Error dude!',
//                 description: 'Error'
//             }
//         }
//     }
// }

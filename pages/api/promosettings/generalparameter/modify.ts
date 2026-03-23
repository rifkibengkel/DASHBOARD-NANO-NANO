import * as model from "./_model";

interface Input {
  id: string;
  description: string;
  parameter: string;
  status: boolean;
  userId: number
}

export const save = async (param: Input) => {
  const description = param.description ? param.description : "";
  const parameter = param.parameter ? param.parameter : "";
  const status = param.status ? param.status : 0;
  const userId = param.userId ? param.userId : 0

  if (description == "" || parameter == "") {
    return {
      error: {
        type: "error",
        message: "No Lengkap",
        description: "Error",
      },
    };
  }

  await model.startTransaction();
  const insertList: any = await model.insertGP(description, parameter, status.toString(), userId);
  await model.commitTransaction();
  if (insertList.insertId != 0) {
    return "Success";
  } else {
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

export const modify = async (param: Input) => {
  const id = param.id ? param.id : "";
  const description = param.description ? param.description : "";
  const parameter = param.parameter ? param.parameter : "";
  const status = param.status === true ? 1 : 0;
  const userId = param.userId ? param.userId : 0

  if (id == "" || description == "" || parameter == "") {
    return {
      error: {
        type: "error",
        message: "No Lengkap",
        description: "Error",
      },
    };
  }

  await model.startTransaction();
  const editList: any = await model.editGP(description, parameter, status.toString(), id, userId);
  await model.commitTransaction();
  if (editList.changedRows != 0) {
    return "Success";
  } else {
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

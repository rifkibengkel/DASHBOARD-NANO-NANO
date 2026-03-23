import * as model from "./_model";

interface Input {
  id: string;
  name: string;
  sender: string;
  idNumber: string;
  userId: number;
}

export const save = async (param: Input) => {
  const name = param.name ? param.name : "";
  const sender = param.sender ? param.sender : "";
  const idNumber = param.idNumber ? param.idNumber : "";
  const userId = param.userId ? param.userId : 0;

  if (name == "" || sender == "" || idNumber == "") {
    return {
      error: {
        type: "error",
        message: "No Entry",
        description: "Error",
      },
    };
  }

  const response: any = await model.searchList(sender, 0, "insert");
  if (response?.length < 1) {
    await model.startTransaction();
    const insertList: any = await model.insertList(
      name,
      sender,
      idNumber,
      userId
    );
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
  }
};

export const modify = async (param: Input) => {
  const id = param.id ? param.id : "";
  const name = param.name ? param.name : "";
  const sender = param.sender ? param.sender : "";
  const idNumber = param.idNumber ? param.idNumber : "";
  const userId = param.userId ? param.userId : 0;

  if (id == "" || name == "" || sender == "" || idNumber == "") {
    return {
      error: {
        type: "error",
        message: "No Lengkap",
        description: "Error",
      },
    };
  }

  const response: any = await model.searchList(sender, id, "edit");
  if (response?.length > 0) {
    await model.startTransaction();
    const editList: any = await model.editList(
      name,
      sender,
      idNumber,
      id,
      userId
    );

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
  }
};

export const remove = async (param: Input) => {
  const id = param.id ? param.id : "";

  if (id == "") {
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
    await model.deleteList(id);
    await model.commitTransaction();
    return "ok";
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

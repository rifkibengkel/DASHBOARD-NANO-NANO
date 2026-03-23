import * as model from "./_model";

interface Input {
  id: string;
  title: string;
  content: string;
  type: number;
}

export const save = async (param: Input) => {
  const title = param.title ? Buffer.from(param.title, 'base64').toString('ascii') : "";
  const content = param.content ? Buffer.from(param.content, 'base64').toString('ascii') : "";
  const type = param.type ? param.type : 0;

  if (title == "" || content == "" || type == 0) {
    return {
      error: {
        type: "error",
        message: "No Lengkap",
        description: "Error",
      },
    };
  }

  await model.startTransaction();
  const insertList: any = await model.insertFAQ(title, content, type.toString());
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
  const title = param.title ? Buffer.from(param.title, 'base64').toString('ascii') : "";
  const content = param.content ? Buffer.from(param.content, 'base64').toString('ascii') : "";
  const type = param.type ? param.type : 0;

  if (id == "" || title == "" || content == "" || type == 0) {
    return {
      error: {
        type: "error",
        message: "No Lengkap",
        description: "Error",
      },
    };
  }

  await model.startTransaction();
  const editList: any = await model.editFAQ(title, content, type.toString(), id);
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

export const remove = async (param: Input) => {
  const id = param.id ? param.id : "";

  if(id == "") {
      return {
          error: {
              type: 'error',
              message: 'No Lengkap',
              description: 'Error'
          }
      }
  }

  try {
      await model.startTransaction()
      await model.dlt(id)
      await model.commitTransaction()
      return 'Success'
  } catch(err) {
      await model.rollback()
      return {
          error: {
              type: 'error',
              message: 'Error dude!',
              description: 'Error'
          }
      }
  }
}
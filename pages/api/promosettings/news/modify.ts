import * as model from "./_model";

interface IntfC {
  id: string;
  title: string;
  content: string;
  picture: string;
}

export const save = async (param: IntfC) => {
  const title = param.title ? param.title : "";
  const content = param.content ? param.content : "";
  const picture = param.picture ? param.picture : "";
  
  if (title == "" || content == "" || picture == "") {
    return {
      error: {
        type: "error",
        message: "No Lengkap",
        description: "Error",
      },
    };
  }

  let params = {
   title,
   content,
   picture
  } as IntfC


  await model.startTransaction();
  const insertList: any = await model.insert(params);
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

export const modify = async (param: IntfC) => {
  const id = param.id ? param.id : "";
  const title = param.title ? param.title : "";
  const content = param.content ? param.content : "";
  const picture = param.picture ? param.picture : "";
  
  if (id == "" || title == "" || content == "" || picture == "") {
    return {
      error: {
        type: "error",
        message: "No Lengkap",
        description: "Error",
      },
    };
  }

  let params = {
   id,
   title,
   content,
   picture
  } as IntfC

  await model.startTransaction();
  const editList: any = await model.edit(params);
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

export const remove = async (param: string) => {
  const id = param ? param : "";

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
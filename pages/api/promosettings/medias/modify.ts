import * as model from "./_model";

interface Input {
    id: string
    code: string;
    name: string;
    sort: string;
    is_active: string
    userId: number
  }

  export const save = async (param: Input) => {
    const code = param.code ? param.code : "";
    const name = param.name ? param.name : "";
    const sort = param.sort ? param.sort : '0';
    const userId = param.userId ? param.userId : 0
  
    if (code == "" || name == "" || sort == "") {
      return {
        error: {
          type: "error",
          message: "No Lengkap",
          description: "Error",
        },
      };
    }
  
    await model.startTransaction();
    const insertList: any = await model.insertMedia(code, name, sort, userId)
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
    const code = param.code ? param.code : "";
    const name = param.name ? param.name : "";
    const sort = param.sort ? param.sort : '0';
    const is_active = param.is_active ? param.is_active : '0';
    const userId = param.userId ? param.userId : 0
    
  
    if (id == "" || code == "" || name == "" || sort == "" || is_active == "") {
      return {
        error: {
          type: "error",
          message: "No Lengkap",
          description: "Error",
        },
      };
    }
  
    await model.startTransaction();
    const editList: any = await model.editMedia(code, name, sort, is_active, id, userId)
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
// import crypto from 'crypto';
// import { v4 as uuidv4 } from 'uuid';
import { exeQuery } from "./db";
import * as bcrypt from "bcryptjs";

/**
 * User methods. The example doesn't contain a DB, but for real applications you must use a
 * db here, such as MongoDB, Fauna, SQL, etc.
 */

interface IUser {
  username: string;
  name: string;
  password: string;
  accessId: number;
  role: string;
}

const users: any = [];

// Here you should lookup for the user in your DB
export async function findUser({ username }: { username: string }) {
  // // This is an in memory store for users, there is no data persistence without a proper DB
  // return users.find((user: any) => user.username === username)
  const query = `SELECT A.id, A.username, A.password, A."accessId", A.fullname, B.description AS role 
  FROM user_mobile A
  JOIN access B ON A."accessId" = B.id
  WHERE A.username = $1`;
  const findUser: any = await exeQuery(query, [username]);

  if (findUser) {
    return findUser[0];
  }

  return null;
}

// Compare the password of an already fetched user (using `findUser`) and compare the
// password for a potential match
export function validatePassword(user: IUser, inputPassword: string) {
  const passwordsMatch = bcrypt.compareSync(inputPassword, user.password);
  return passwordsMatch;
}

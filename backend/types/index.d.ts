import type { UserPayload } from "../models/userPayload";

declare global{
  namespace Express{
    interface Request{
      user?:UserPayload;
    }
  }
}

export {};
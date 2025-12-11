import { userPayload } from "../../models/userPayload";

declare global{
  namespace Express{
    interface Request{
      user?:userPayload;
    }
  }
}
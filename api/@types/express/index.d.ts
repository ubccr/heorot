import { ObjectId } from "mongoose"

declare global {
  namespace Express {
    interface Request {
      userId: ObjectId
    }
  }
}

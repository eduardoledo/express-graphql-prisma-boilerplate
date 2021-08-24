import { MiddlewareType } from "../middlewares/middleware.check";

export interface IMiddlewareCheckInputType {
    type: MiddlewareType,
    roles?: string[]
}

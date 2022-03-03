import express, { Request, Response, Express, NextFunction } from "express";
import { buildingRouter } from "./building";
import { floorRouter } from "./floor";
import { elevatorRouter } from "./elevator";
import { logAndSendError } from "./logging";
import Router from "express-promise-router";
const router = Router();

export const app: Express = express();


export enum Status {
    Success = "success",
    Failure = "failure"
}

// I know there are probably route ways of doing this... better ways etc.

router.use("/building", buildingRouter);
router.use("/elevator", elevatorRouter);
router.use("/floor", floorRouter);
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logAndSendError(err, res);
});
app.use(router);

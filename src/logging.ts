import { Response } from "express";
import { Status } from "./app";

export const log = (msg: string) => {
    console.log(`INFO: ${Date.now()} ${msg}`);
};

export const logAndSendError = (e: Error, res: Response) => {
    console.error(`EXCEPTION: ${Date.now}`, e);
    console.error(e.stack);
    res.status(500).send(JSON.stringify({ status: Status.Failure, error: e.toString() }));
};

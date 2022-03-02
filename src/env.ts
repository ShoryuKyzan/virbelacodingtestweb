import { existsSync, unlinkSync } from "fs";


export const getDBFilename = (): string => {
    let filename = "";
    if (process.env["NODE_ENV"] === "test") {
        filename = "testmodels.db";
    } else {
        filename = "elevatorService.db";
    }
    return filename;
};
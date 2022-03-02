import { existsSync, unlinkSync } from "fs";


export const getDBFilename = (): string => {
    let filename = "";
    if (process.env["NODE_ENV"] === "test") {
        filename = "testmodels.db";
        // cleanup first
        if (existsSync(filename)) {
            unlinkSync(filename);
        }
    } else {
        filename = "elevatorService.db";
    }
    return filename;
};
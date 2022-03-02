import { Building, Floor, Elevator, sequelize } from "../src/model";
import { unlinkSync } from "fs";
import { getDBFilename } from "../src/env";
import { Output } from "test-console";

export const setup = async function () {
    /**
     * Initializes a database with the given filename, deleting it first if it exists.
     * Create 1 x 101 floor building, with 4 elevators spanning
     * 0: 0-14
     * 1: 0, 15-29
     * 2: 0, 30-45
     * 3: 45-101
     * 
     * @return sequelize object
    */

    // TODO there is probably some way to avoid all these awaits until the end. will have to look into that

    try {
        await sequelize.sync();
        const b = await Building.create({ name: "DataDyne" });
        for (let i = 0; i < 101; i++) {
            const f = await Floor.create({
                floorNo: i + 1,
            });
            await b.addFloor([f]);
        }


        // set floors for elevators

        const floors = await b.getFloors();

        let e = await Elevator.create({ elevatorNo: "0" });
        await b.addElevator([e]);
        let start = 0;
        for (let i = 0; i < 15; i++) {
            await e.addFloor(floors[start + i]);
        }

        e = await Elevator.create({ elevatorNo: "1" });
        await b.addElevator([e]);
        start = 15;
        await e.addFloor(floors[0]);
        for (let i = 0; i < 15; i++) {
            await e.addFloor(floors[start + i]);
        }

        e = await Elevator.create({ elevatorNo: "2" });
        await b.addElevator([e]);
        start = 30;
        await e.addFloor(floors[0]);
        for (let i = 0; i < 16; i++) {
            await e.addFloor(floors[start + i]);
        }

        e = await Elevator.create({ elevatorNo: "3" });
        await b.addElevator([e]);
        start = 45;
        for (let i = 0; i < 55; i++) {
            await e.addFloor(floors[start + i]);
        }

        // print out data
        // console.log(b.toJSON());

        // const fs = await b.getFloors();
        // fs.forEach((floor) => {
        //     console.log(floor.toJSON());
        // });
        // const b3 = await Building.findOne({ where: { name: "DataDyne" } }); // XXX
        // console.log(b3.toJSON()); // XXX
        await sequelize.sync();
    } catch (e) {
        console.error(e);
    }

};


export const teardown = async () => {
    await sequelize.sync();
    await sequelize.close();
    const filename = getDBFilename();
    unlinkSync(filename);
};

export const filterLogs = (output: Output, afterTimestamp: number): string[] => {
    /**
     * Filters the output to just log messages after the current timestamp.
     * 
     * @param output - string[] - array of strings that is the output data
     * @param afterTimestamp - number - start scanning messages after unix timestamp
     * 
     * @return string[] - filtered output
     */

    const fullOutputLines = output.join("").split("\n");

    const filter = /^\s*INFO:\s+([0-9]+)\s*(.*)\s*$/;

    const ret: string[] = [];
    fullOutputLines.forEach((line) => {
        const matches = line.match(filter);
        if (matches && matches.length >= 1) {
            const timestamp = parseInt(matches[1], 10);
            if (timestamp >= afterTimestamp) {
                ret.push(matches[2]);
            }
        }
    });
    return ret;

};

export const cleanupRecords = (records: any, keysToClean: string[] = ["createdAt", "updatedAt", "id"]) => {
    /**
     * Cleans up sequelize records, removing id and other fields by default. This allows test to be agnostic to when the data was created.
     */
    // lots of any's here because its meant to sanitize many things
    let inputRecords: any = records;
    let returnSingle = false;
    if (!Array.isArray(records)) {
        inputRecords = [records];
        returnSingle = true;
    }
    (inputRecords as object[]).forEach((record: any) => {
        keysToClean.forEach((key) => {
            if (key in record) {
                record[key] = "";
            }
        });
    });
    if (returnSingle) {
        return inputRecords[0];
    } else {
        return inputRecords;
    }
};


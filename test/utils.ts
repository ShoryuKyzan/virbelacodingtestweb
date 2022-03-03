import { Building, Floor, Elevator, sequelize } from "../src/model";
import { existsSync, unlinkSync } from "fs";
import { getDBFilename } from "../src/env";

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

    const filename = getDBFilename();
    if (existsSync(filename)) {
        unlinkSync(filename);
    }

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

    // workaround, it wont let you delete it unless u do this
    // workaround is not working!
    // const queryInterface: any = sequelize.getQueryInterface();
    // await queryInterface.sequelize.connectionManager.connections.default.close(); // manually close the sqlite connection which sequelize.close() omits
    await sequelize.close();

    // this wont work because the db is still holding a connection, not worth it to fix rn, it is always deleted on startup anyways.
    // const filename = getDBFilename();
    // unlinkSync(filename);
};


export const CleanupRecordKeys = {
    Dates: ["createdAt", "updatedAt"],
    All: ["id", "createdAt", "updatedAt"]
};

export const cleanupRecords = (records: any, keysToClean: string[] = CleanupRecordKeys.All) => {
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


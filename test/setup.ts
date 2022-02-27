import { existsSync, unlinkSync } from "fs";
import { Sequelize } from "sequelize";
import { Building, Floor, Elevator, init } from "../src/model";

module.exports = async function (_: any, __: any) {
    /**
     * Initializes a database with the given filename, deleting it first if it exists.
     * Create 1 x 101 floor building, with 4 elevators spanning
     * 0: 0-15
     * 1: 15-30
     * 2: 30-45
     * 3: 45-101
     * 
     * @return sequelize object
    */
    const filename = "testModels.db";
    if (existsSync(filename)) {
        unlinkSync(filename);
    }
    const sequelize = new Sequelize("sqlite:" + filename);
    init(sequelize);

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

        let e = await Elevator.create({});
        await b.addElevator([e]);
        let start = 0;
        for (let i = 0; i < 15; i++) {
            await e.addFloor(floors[start + i]);
        }

        e = await Elevator.create({});
        await b.addElevator([e]);
        start = 15;
        for (let i = 0; i < 15; i++) {
            await e.addFloor(floors[start + i]);
        }

        e = await Elevator.create({});
        await b.addElevator([e]);
        start = 30;
        for (let i = 0; i < 15; i++) {
            await e.addFloor(floors[start + i]);
        }
        e = await Elevator.create({});
        await b.addElevator([e]);
        start = 45;
        for (let i = 0; i < 55; i++) {
            await e.addFloor(floors[start + i]);
        }

        // print out data
        console.log(b.toJSON());

        const fs = await b.getFloors();
        fs.forEach((floor) => {
            console.log(floor.toJSON());
        });
        (global as any).sequelize = sequelize;
    } catch (e) {
        console.log(e);
    }

};
import { Building, Floor, Elevator, sequelize } from "../src/model";

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
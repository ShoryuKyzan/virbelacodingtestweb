import { Building, Elevator } from "./model";

export const getElevator = async (building: string, elevatorNo: string): Promise<Elevator> => {
    console.log(Building); // XXX
    console.log(Building.findOne()); // XXX
    console.log(await Building.findOne()); // XXX
    const b2 = await Building.findOne(); // XXX
    console.log(b2); // XXX
    const b = (await Building.findOne({
        where: {
            name: building
        }
    }));
    const e = (await Elevator.findAll({
        where: {
            buildingId: b.id,
            elevatorNo: elevatorNo
        }
    }))[0];
    console.log(b, e); // XXX
    return e;
};
export const openDoor = async (building: string, elevatorNo: string) => {
    const e = await getElevator(building, elevatorNo);
    e.openDoor();
    await e.save();
};

export const closeDoor = async (building: string, elevatorNo: string) => {
    const e = await getElevator(building, elevatorNo);
    e.closeDoor();
    await e.save();
};

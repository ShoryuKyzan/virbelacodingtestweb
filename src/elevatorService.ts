import { log } from "./logging";
import { Building, Elevator, Floor } from "./model";

export const createBuilding = async (name: string): Promise<Building> => {
    return await Building.create({ name: name });
};

export const createElevator = async (buildingName: string, elevatorNo: string): Promise<Elevator> => {
    const building = await Building.findOne({ where: { name: buildingName } });
    const conflicts = await Elevator.findAll({
        where: {
            buildingId: building.id,
            elevatorNo: elevatorNo
        }
    });
    if (conflicts.length > 0) {
        throw new Error(`Elevator No #${elevatorNo} already exists`);
    }
    const newElevator = await Elevator.create({ elevatorNo });
    await building.addElevator([newElevator]);
    return newElevator;
};
export const createFloor = async (buildingName: string, floorNo: number): Promise<Floor> => {
    const building = await Building.findOne({ where: { name: buildingName } });
    const conflicts = await Floor.findAll({
        where: {
            buildingId: building.id,
            floorNo: floorNo
        }
    });
    if (conflicts.length > 0) {
        throw new Error(`Floor No #${floorNo} already exists`);
    }
    const floor = await Floor.create({ floorNo });
    await building.addFloor([floor]);
    return floor;
};

export const getElevator = async (building: string, elevatorNo: string): Promise<Elevator> => {
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
    return e;
};

export const getFloor = async (building: string, floorNo: number): Promise<Floor> => {
    const b = (await Building.findOne({
        where: {
            name: building
        }
    }));
    const f = (await Floor.findAll({
        where: {
            buildingId: b.id,
            floorNo
        }
    }))[0];
    return f;
};

export const openDoor = async (building: string, elevatorNo: string) => {
    const e = await getElevator(building, elevatorNo);
    e.openDoor();
    await e.save();
    log(`${building} elevator ${elevatorNo} door opened`);
};

export const closeDoor = async (building: string, elevatorNo: string) => {
    const e = await getElevator(building, elevatorNo);
    e.closeDoor();
    await e.save();
    log(`${building} elevator ${elevatorNo} door closed`);
};

import { getElevator, getFloor } from "./buildingService";
import { log } from "./logging";
import { Building, Elevator, Floor } from "./model";
import { AlreadyExistsError } from "./service";

export const createElevator = async (buildingName: string, elevatorNo: string): Promise<Elevator> => {
    const building = await Building.findOne({ where: { name: buildingName } });
    const conflicts = await Elevator.findAll({
        where: {
            buildingId: building.id,
            elevatorNo: elevatorNo
        }
    });
    if (conflicts.length > 0) {
        throw new AlreadyExistsError(`Elevator No #${elevatorNo} already exists`);
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
        throw new AlreadyExistsError(`Floor No #${floorNo} already exists`);
    }
    const floor = await Floor.create({ floorNo });
    await building.addFloor([floor]);
    return floor;
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

export const goToFloor = async (building: string, elevatorNo: string, floorNo: number) => {
    const e = await getElevator(building, elevatorNo);
    const f = await getFloor(building, floorNo);
    await closeDoor(building, elevatorNo);
    e.currentFloorId = f.id;
    e.save();
    log(`${building} elevator ${elevatorNo} went to floor ${floorNo}`);
    await openDoor(building, elevatorNo);
};
import { Building, Elevator, Floor, sequelize } from "./model";
import { AlreadyExistsError } from "./service";

export const createBuilding = async (name: string): Promise<Building> => {
    const existingBuildings = await Building.findAll({ where: { name } });
    if (existingBuildings.length > 0) {
        throw new AlreadyExistsError(`Building ${name} already exists`);
    }
    const building = await Building.create({ name });

    return building;
};

export const createBuildingFloor = async (buildingName: string, floorNo: number): Promise<Floor> => {
    const b = await Building.findOne({ where: { name: buildingName } });
    const existingFloors = await Floor.findAll({ where: { buildingId: b.id, floorNo } });
    if (existingFloors.length > 0) {
        throw new AlreadyExistsError(`Floor no ${floorNo} already exists in this building`);
    }
    // i'd think foreign key association would happen automatically but it does not seem to, more research required...
    const floor = await Floor.create({ buildingId: b.id, floorNo });
    await b.addFloor([floor]);
    return floor;
};

export const createBuildingElevator = async (buildingName: string, elevatorNo: string): Promise<Elevator> => {
    const b = await Building.findOne({ where: { name: buildingName } });
    const existingElevators = await Elevator.findAll({ where: { buildingId: b.id, elevatorNo } });
    if (existingElevators.length > 0) {
        throw new AlreadyExistsError(`Elevator no ${elevatorNo} already exists in this building`);
    }
    // i'd think foreign key association would happen automatically but it does not seem to, more research required...
    const elevator = await Elevator.create({ buildingId: b.id, elevatorNo });
    await b.addElevator([elevator]);
    await b.save();
    await elevator.save();
    return elevator;
};

export const getBuildingFloors = async (buildingName: string): Promise<Floor[]> => {
    const b = await Building.findOne({ where: { name: buildingName } });
    return await b.getFloors();
};

export const getBuildingElevators = async (buildingName: string): Promise<Elevator[]> => {
    const b = await Building.findOne({ where: { name: buildingName } });
    return await b.getElevators();
};
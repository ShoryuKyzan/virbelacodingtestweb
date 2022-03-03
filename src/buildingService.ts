import { Building } from "./model";

export const createBuilding = async (name: string): Promise<Building> => {
    const existingBuildings = await Building.findAll({ where: { name } });
    if (existingBuildings.length > 0) {
        throw new Error(`Building ${name} already exists`);
    }
    const building = await Building.create({ name });

    return building;
};


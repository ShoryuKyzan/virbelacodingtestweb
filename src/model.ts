import {
    DataTypes,
    HasManyAddAssociationMixin,
    HasManyGetAssociationsMixin,
    Model,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    HasOneGetAssociationMixin,
    HasOneSetAssociationMixin,
    HasManySetAssociationsMixin,
} from "sequelize";

class Building extends Model<
    InferAttributes<Building>,
    InferCreationAttributes<Building>
> {
    declare name: string;

    declare addFloor: HasManySetAssociationsMixin<Floor, number>;
    declare addElevator: HasManySetAssociationsMixin<Elevator, number>;
    declare getFloors: HasManyGetAssociationsMixin<Floor>;
    declare getElevators: HasManyGetAssociationsMixin<Elevator>;
}

class Floor extends Model<
    InferAttributes<Floor>,
    InferCreationAttributes<Floor>
> {
    declare floorNo: number;

    declare getBuilding: HasOneGetAssociationMixin<Building>;
    declare setBuilding: HasOneSetAssociationMixin<Building, number>;
}

enum DoorStatus {
    Open,
    Closed,
}
enum ElevatorStatus {
    Idle,
}
class Elevator extends Model<
    InferAttributes<Elevator>,
    InferCreationAttributes<Elevator>
> {
    declare status: ElevatorStatus;
    declare doorStatus: DoorStatus;

    // Since TS cannot determine model association at compile time
    // we have to declare them here purely virtually
    // these will not exist until `Model.init` was called.
    declare getBuilding: HasOneGetAssociationMixin<Building>;
    declare setBuilding: HasOneSetAssociationMixin<Building, number>;

    declare getFloors: HasManyGetAssociationsMixin<Floor>;
    declare addFloor: HasManyAddAssociationMixin<Floor, number>;

    // i can has api
    public foo() {
        console.log("youre a foo");
    }
}

export const init = (sequelize: Sequelize) => {
    Building.init(
        {
            name: DataTypes.INTEGER,
        },
        { sequelize, modelName: "building" }
    );
    Floor.init(
        {
            floorNo: DataTypes.INTEGER,
        },
        { sequelize, modelName: "floor" }
    );
    Elevator.init(
        {
            status: {
                type: DataTypes.INTEGER,
                defaultValue: ElevatorStatus.Idle,
            },
            doorStatus: {
                type: DataTypes.INTEGER,
                defaultValue: DoorStatus.Closed,
            },
        },
        { sequelize, tableName: "elevator" }
    );
    Building.hasMany(Floor);
    Building.hasMany(Elevator);
    Floor.belongsTo(Building);
    Elevator.belongsTo(Building);
    Elevator.belongsToMany(Floor, { through: "FloorElevator" });
    Floor.belongsToMany(Elevator, { through: "FloorElevator" });
};

async function testXXX() {
    const sequelize = new Sequelize("sqlite:testModels.db");
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
    } catch (e) {
        console.log(e);
    }
}
testXXX();

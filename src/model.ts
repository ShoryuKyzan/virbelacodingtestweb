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

export class Building extends Model<
    InferAttributes<Building>,
    InferCreationAttributes<Building>
> {
    declare name: string;

    declare addFloor: HasManySetAssociationsMixin<Floor, number>;
    declare addElevator: HasManySetAssociationsMixin<Elevator, number>;
    declare getFloors: HasManyGetAssociationsMixin<Floor>;
    declare getElevators: HasManyGetAssociationsMixin<Elevator>;
}

export class Floor extends Model<
    InferAttributes<Floor>,
    InferCreationAttributes<Floor>
> {
    declare floorNo: number;

    declare getBuilding: HasOneGetAssociationMixin<Building>;
    declare setBuilding: HasOneSetAssociationMixin<Building, number>;
}

export enum DoorStatus {
    Open,
    Closed,
}
export enum ElevatorStatus {
    Idle,
}
export class Elevator extends Model<
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

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
    CreationOptional,
} from "sequelize";
import { getDBFilename } from "./env";

export class Building extends Model<
    InferAttributes<Building>,
    InferCreationAttributes<Building>
> {
    declare id: CreationOptional<number>;
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
    declare id: CreationOptional<number>;
    declare buildingId: CreationOptional<number>;
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
    declare id: CreationOptional<number>;
    declare buildingId: CreationOptional<number>;
    declare status: CreationOptional<ElevatorStatus>;
    declare doorStatus: CreationOptional<DoorStatus>;
    declare elevatorNo: string;

    // Since TS cannot determine model association at compile time
    // we have to declare them here purely virtually
    // these will not exist until `Model.init` was called.
    declare getBuilding: HasOneGetAssociationMixin<Building>;
    declare setBuilding: HasOneSetAssociationMixin<Building, number>;

    declare getFloors: HasManyGetAssociationsMixin<Floor>;
    declare addFloor: HasManyAddAssociationMixin<Floor, number>;

    public openDoor() {
        this.doorStatus = DoorStatus.Open;
    }
    public closeDoor() {
        this.doorStatus = DoorStatus.Closed;
    }
}


// environment based filename
const filename = getDBFilename();
export const sequelize = new Sequelize("sqlite:" + filename, null, null, { logging: false, dialect: "sqlite", storage: filename });

Building.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: DataTypes.INTEGER,
    },
    { sequelize, modelName: "building" }
);
Floor.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        floorNo: DataTypes.INTEGER,
        buildingId: DataTypes.INTEGER
    },
    { sequelize, modelName: "floor" }
);
Elevator.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        buildingId: DataTypes.INTEGER,
        status: {
            type: DataTypes.INTEGER,
            defaultValue: ElevatorStatus.Idle,
        },
        doorStatus: {
            type: DataTypes.INTEGER,
            defaultValue: DoorStatus.Closed,
        },
        elevatorNo: DataTypes.STRING
    },
    { sequelize, tableName: "elevator" }
);
Building.hasMany(Floor);
Building.hasMany(Elevator);
Floor.belongsTo(Building);
Elevator.belongsTo(Building);
Elevator.belongsToMany(Floor, { through: "FloorElevator" });
Floor.belongsToMany(Elevator, { through: "FloorElevator" });

module.exports = {
    Building,
    Floor,
    Elevator,
    DoorStatus,
    ElevatorStatus,
    sequelize
};
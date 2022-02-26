import {
    DataTypes,
    HasManyAddAssociationMixin,
    HasManyGetAssociationsMixin,
    Model,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    HasOneGetAssociationMixin,
    HasOneSetAssociationMixin
} from "sequelize";


const sequelize = new Sequelize("sqlite:elevator-system.db");

class Building extends Model < InferAttributes < Building >,
InferCreationAttributes < Building >> {
    declare name : string;
}
Building.init({
    name: DataTypes.INTEGER
}, {sequelize, modelName: "building"});

class Floor extends Model < InferAttributes < Floor >,
InferCreationAttributes < Floor >> {
    declare floorNo : number;

    declare getBuilding : HasOneGetAssociationMixin < Building >;
    declare setBuilding : HasOneSetAssociationMixin < Building, number >;
}
Floor.init({
    floorNo: DataTypes.INTEGER
}, {sequelize, modelName: "floor"});


class Elevator extends Model < InferAttributes < Elevator >,
InferCreationAttributes < Elevator >> {
    declare status : "idle";
    declare doorStatus : "open" | "close";

    // Since TS cannot determine model association at compile time
    // we have to declare them here purely virtually
    // these will not exist until `Model.init` was called.
    declare getBuilding : HasOneGetAssociationMixin < Building >;
    declare setBuilding : HasOneSetAssociationMixin < Building,
    number >;

    declare getFloors : HasManyGetAssociationsMixin<Floor>;
    declare addFloor : HasManyAddAssociationMixin<Floor, number>;

    // i can has api
    public foo() {
        console.log("youre a foo");
    }

} Elevator.init({
    status: DataTypes.STRING,
    doorStatus: DataTypes.STRING
}, {sequelize, tableName: "group"});

Building.hasMany(Floor);
Building.hasMany(Elevator);
Floor.belongsTo(Building);
Elevator.belongsTo(Building);
Elevator.belongsToMany(Floor, {through: "FloorElevator"});
Floor.belongsToMany(Elevator, {through: "FloorElevator"});

import {
    Association,
    DataTypes,
    HasManyAddAssociationMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManySetAssociationsMixin,
    HasManyAddAssociationsMixin,
    HasManyHasAssociationsMixin,
    HasManyRemoveAssociationMixin,
    HasManyRemoveAssociationsMixin,
    Model,
    ModelDefined,
    Optional,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute
} from "sequelize";


import {HasOneGetAssociationMixin, HasOneSetAssociationMixin} from "sequelize";
const sequelize = new Sequelize("sqlite:elevator-system.db");


class Elevator extends Model < InferAttributes < Elevator >,
InferCreationAttributes < Elevator >> {
    declare aaa : string;
    declare doorStatus : "open" | "close";
    // i can has api
    public foo() {
        console.log("youre a foo");
    }

}
Elevator.init({
    aaa: DataTypes.STRING,
    doorStatus: DataTypes.STRING
}, {sequelize, tableName: "elevator"});

// 'projects' is excluded as it's not an attribute, it's an association.
class User extends Model < InferAttributes < User, {
    omit : "group"
} >,
InferCreationAttributes < User, {omit: "group"} >> {
    declare username: string;
    declare birthday: Date;

    // Since TS cannot determine model association at compile time
    // we have to declare them here purely virtually
    // these will not exist until `Model.init` was called.
    declare getGroup: HasOneGetAssociationMixin < Group >;
    declare setGroup: HasOneSetAssociationMixin < Group,
    number >;
    declare group: NonAttribute < Group >;

    declare static associations: {
        group: Association < User,
        Group >;
    };

    // i can has api
    public foo() {
        console.log("youre a foo");
    }

}
// XXX


User.init({
    username: DataTypes.STRING,
    birthday: DataTypes.DATE
}, {sequelize, modelName: "user"});

class Group extends Model {} Group.init({
    name: DataTypes.STRING
}, {sequelize, modelName: "group"});


User.belongsTo(Group);
Group.hasMany(User);

(async () => {
    try {
        await sequelize.sync();
        const group = await Group.create({name: "main"});
        const jane = await User.create({
            username: "janedoe",
            birthday: new Date(1980, 6, 20)
        });
        await jane.setGroup(group);
        jane.foo();
        console.log(jane.toJSON());
        const g = await jane.getGroup();
        console.log(g.toJSON());
    } catch (e) {
        console.log(e);
    }
})();

export const test = (val : number) => {
    return val;
};

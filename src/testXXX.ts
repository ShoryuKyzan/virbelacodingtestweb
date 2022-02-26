import {Sequelize, Model, DataTypes} from "sequelize";
const sequelize = new Sequelize("sqlite:elevator-system.db");

class Group extends Model {} Group.init({
    name: DataTypes.STRING
}, {sequelize, modelName: "group"});

class User extends Model {
    declare username : string;
    declare birthday : Date;
    declare group : Group;
    declare getGroup : () => Group;
    declare setGroup : (g : Group) => void;
    // i can has api
    public foo() {
        console.log("youre a foo");
    }
} User.init({
    username: DataTypes.STRING,
    birthday: DataTypes.DATE
}, {sequelize, modelName: "user"});


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

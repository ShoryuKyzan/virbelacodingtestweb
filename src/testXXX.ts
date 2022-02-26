import { Sequelize, Model, DataTypes } from "sequelize";
const sequelize = new Sequelize("sqlite::memory:");

class User extends Model {}
User.init({
  username: DataTypes.STRING,
  birthday: DataTypes.DATE
}, { sequelize, modelName: "user" });

(async () => {
  await sequelize.sync();
  const jane = await User.create({
    username: "janedoe",
    birthday: new Date(1980, 6, 20)
  });
  console.log(jane.toJSON());
})();

export const test = (val : number) => {
    return val;
};



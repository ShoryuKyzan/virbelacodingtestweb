import { Sequelize, Model, DataTypes } from "sequelize";
const sequelize = new Sequelize("sqlite:elevator-system.db");

class User extends Model {
    
    // i can has api
    public foo() {
        console.log("youre a foo");
    }
}
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
  jane.foo();
  console.log(jane.toJSON());
})();

export const test = (val : number) => {
    return val;
};




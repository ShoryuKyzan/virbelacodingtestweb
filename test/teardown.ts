import { unlinkSync } from "fs";
import { Sequelize } from "sequelize";

module.exports = async function (_: any, __: any) {
    const sequelize: Sequelize = (global as any).sequelize;
    await sequelize.sync();
    await sequelize.close();
    const filename = "testModels.db";
    unlinkSync(filename);
};
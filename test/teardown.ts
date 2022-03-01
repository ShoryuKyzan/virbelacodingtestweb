import { unlinkSync } from "fs";
import { getDBFilename } from "../src/env";
import { sequelize } from "../src/model";

module.exports = async function (_: any, __: any) {
    await sequelize.sync();
    await sequelize.close();
    const filename = getDBFilename();
    unlinkSync(filename);
};
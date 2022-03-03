import { sequelize } from "./model";
import { app } from "./app";

const port = 8080;
app.listen(port, async () => {
    // get the db started up.
    sequelize.sync();

    console.log(`Server started on ${port}!`);
});

import express, { Express } from "express";
import { CorsOptions } from "cors";
import cors from "cors";

export const app: Express = express();


/* holdover from another project, makes it easy to do this in frontend stuff */
const copts: CorsOptions = {
    origin: (origin, callback) => { // allow all
        callback(null, true);
    }
};

app.get("/test", cors(copts), (req, res) => {
    res.send(JSON.stringify({ message: "your a foo" }));
    // XXX const prom = fetch(url).then(response => response.json());
    // use async/await instead!
});
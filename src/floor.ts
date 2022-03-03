import Router from "express-promise-router";
import cors from "cors";
import { copts } from "./cors";
import { Floor } from "./model";
import { Status } from "./app";

export const floorRouter = Router();



floorRouter.get("/", cors(copts), async (req, res) => {
    const floors = await Floor.findAll();
    res.send(JSON.stringify({ status: Status.Success, floors }));
});

floorRouter.get("/:floorId", cors(copts), async (req, res) => {
    const floor = await Floor.findAll({ where: { id: req.params["floorId"] } });
    res.send(JSON.stringify({ status: Status.Success, floor }));
});




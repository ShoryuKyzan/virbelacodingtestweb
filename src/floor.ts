import Router from "express-promise-router";
import cors from "cors";
import { copts } from "./cors";
import { Building, Floor } from "./model";
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

floorRouter.post("/:floorId", cors(copts), async (req, res) => {
    const newFloorNo = req.body.floorNo;

    const f = await Floor.findOne({ where: { id: req.params["floorId"] } });
    const b = await Building.findOne({ where: { id: f.buildingId } });
    const existingFloors = await Floor.findAll({ where: { buildingId: b.id, floorNo: newFloorNo } });
    if (existingFloors.length > 0) {
        throw new Error(`Floor ${newFloorNo} already exists in this building`);
    }
    f.floorNo = parseInt(newFloorNo, 10);
    await f.save();

    res.send(JSON.stringify({ status: Status.Success, floor: f }));
});

floorRouter.delete("/:floorId", cors(copts), async (req, res) => {
    const floor = await Floor.findOne({ where: { id: req.params["floorId"] } });
    await floor.destroy();
    res.send(JSON.stringify({ status: Status.Success }));
});






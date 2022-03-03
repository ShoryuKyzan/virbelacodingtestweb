import Router from "express-promise-router";
import cors from "cors";
import { copts } from "./cors";
import { Elevator } from "./model";
import { Status } from "./app";
import { AlreadyExistsError } from "./service";

export const elevatorRouter = Router();

elevatorRouter.get("/", cors(copts), async (req, res) => {
    const elevators = await Elevator.findAll();
    res.send(JSON.stringify({ status: Status.Success, elevators }));
});

elevatorRouter.get("/:elevatorId", cors(copts), async (req, res) => {
    const elevator = await Elevator.findAll({ where: { id: req.params["elevatorId"] } });
    res.send(JSON.stringify({ status: Status.Success, elevator }));
});

elevatorRouter.delete("/:elevatorId", cors(copts), async (req, res) => {
    const elevator = await Elevator.findOne({ where: { id: req.params["elevatorId"] } });
    await elevator.destroy();
    res.send(JSON.stringify({ status: Status.Success }));
});

elevatorRouter.post("/:elevatorId", cors(copts), async (req, res) => {
    const e = await Elevator.findOne({ where: { id: req.params["elevatorId"] } });
    const elevatorNo = req.body.elevatorNo;
    const existingElevators = await Elevator.findAll({ where: { buildingId: e.buildingId, elevatorNo } });
    if (existingElevators.length > 0) {
        throw new AlreadyExistsError(`Elevator with No ${elevatorNo} already exists in this building`);
    }
    e.elevatorNo = elevatorNo;
    await e.save();
    res.send(JSON.stringify({ status: Status.Success, elevator: e }));
});

// TODO should think about openDoor/closeDoor apis.. and how to reduce code duplication between the two..

// TODO should think about openDoor/closeDoor apis.. and how to reduce code duplication between the two..

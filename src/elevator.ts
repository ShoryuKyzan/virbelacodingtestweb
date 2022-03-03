import Router from "express-promise-router";
import cors from "cors";
import { copts } from "./cors";
import { Elevator } from "./model";
import { Status } from "./app";

export const elevatorRouter = Router();

elevatorRouter.get("/", cors(copts), async (req, res) => {
    const elevators = await Elevator.findAll();
    res.send(JSON.stringify({ status: Status.Success, elevators }));
});

elevatorRouter.get("/:elevatorId", cors(copts), async (req, res) => {
    const elevator = await Elevator.findAll({ where: { id: req.params["elevatorId"] } });
    res.send(JSON.stringify({ status: Status.Success, elevator }));
});

// TODO should think about openDoor/closeDoor apis.. and how to reduce code duplication between the two..
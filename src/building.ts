import Router from "express-promise-router";
import { Response } from "express";
import cors from "cors";
import { copts } from "./cors";
import { Building, Elevator, Floor } from "./model";
import { Status } from "./app";
import { closeDoor, createElevator, createFloor, getElevator, openDoor } from "./elevatorService";
import { createBuilding, createBuildingElevator, createBuildingFloor, getBuildingElevators, getBuildingFloors } from "./buildingService";
import { AlreadyExistsError } from "./service";

export const buildingRouter = Router();


// the types returned from here are generic, but swagger api and a client could define a distinctly typed api for every response
buildingRouter.get("/", cors(copts), async (req, res) => {
    const buildings = await Building.findAll();
    res.send(JSON.stringify({ status: Status.Success, buildings }));
});

buildingRouter.get("/:buildingName", cors(copts), async (req, res) => {
    const building = await Building.findOne({ where: { name: req.params["buildingName"] } });
    res.send(JSON.stringify({ status: Status.Success, building }));
});

buildingRouter.put("/:buildingName", cors(copts), async (req, res) => {
    const building = await createBuilding(req.params["buildingName"]);

    res.send(JSON.stringify({ status: Status.Success, building }));
});


buildingRouter.post("/:buildingName", cors(copts), async (req, res) => {
    const buildingName = req.params["buildingName"];
    const newBuildingName = req.body.name;

    const existingBuildings = await Building.findAll({ where: { name: newBuildingName } });
    if (existingBuildings.length > 0) {
        throw new AlreadyExistsError(`Building ${newBuildingName} already exists`);
    }
    const building = await Building.findOne({ where: { name: buildingName } });
    building.name = newBuildingName;
    await building.save();

    res.send(JSON.stringify({ status: Status.Success, building }));
});

buildingRouter.delete("/:buildingName", cors(copts), async (req, res) => {
    const building = await Building.findOne({ where: { name: req.params["buildingName"] } });
    await building.destroy();

    // TODO ensure all owned floors and elevators destroyed
    res.send(JSON.stringify({ status: Status.Success }));
});

buildingRouter.put("/:buildingName/floor", cors(copts), async (req, res) => {
    const floor = await createBuildingFloor(req.params["buildingName"], req.body.floorNo);
    res.send(JSON.stringify({ status: Status.Success, floor }));
});

buildingRouter.put("/:buildingName/elevator", cors(copts), async (req, res) => {
    const elevator = await createBuildingElevator(req.params["buildingName"], req.body.elevatorNo);
    res.send(JSON.stringify({ status: Status.Success, elevator }));
});

buildingRouter.get("/:buildingName/floor", cors(copts), async (req, res) => {
    const floors = await getBuildingFloors(req.params["buildingName"]);
    res.send(JSON.stringify({ status: Status.Success, floors }));
});

buildingRouter.get("/:buildingName/elevator", cors(copts), async (req, res) => {
    const elevators = await getBuildingElevators(req.params["buildingName"]);
    res.send(JSON.stringify({ status: Status.Success, elevators }));
});


// buildingRouter.get("/:buildingName/elevator", cors(copts), async (req, res) => {
//     const building = await Building.findOne({ where: { name: req.params["buildingName"] } });
//     const elevators = await Elevator.findAll({ where: { buildingId: building.id } });
//     res.send(JSON.stringify({ status: Status.Success, building, elevators }));
// });

// buildingRouter.put("/:buildingName/elevator", cors(copts), async (req, res) => {
//     const newElevator: {
//         elevatorNo: string
//     } = JSON.parse(req.body);
//     const elevator = await createElevator(req.params["buildingName"], newElevator.elevatorNo);
//     res.send(JSON.stringify({ status: Status.Success, elevator }));
// });

// buildingRouter.get("/:buildingName/elevator/:elevatorNo", cors(copts), async (req, res) => {
//     const building = await Building.findOne({ where: { name: req.params["buildingName"] } });
//     const elevator = await Elevator.findOne({
//         where: {
//             buildingId: building.id,
//             elevatorNo: req.params["elevatorNo"]
//         }
//     });
//     res.send(JSON.stringify({ status: Status.Success, building, elevator }));
// });

// buildingRouter.delete("/:buildingName/elevator/:elevatorNo", cors(copts), async (req, res) => {
//     const building = await Building.findOne({ where: { name: req.params["buildingName"] } });
//     const elevator = await Elevator.findOne({
//         where: {
//             buildingId: building.id,
//             elevatorNo: req.params["elevatorNo"]
//         }
//     });
//     await elevator.destroy();
//     res.send(JSON.stringify({ status: Status.Success }));
// });

// buildingRouter.get("/:buildingName/floor", cors(copts), async (req, res) => {
//     const building = await Building.findOne({ where: { name: req.params["buildingName"] } });
//     const floors = await Floor.findAll({ where: { buildingId: building.id } });
//     res.send(JSON.stringify({ status: Status.Success, building, floors }));
// });

// buildingRouter.post("/:buildingName/floor", cors(copts), async (req, res) => {
//     const newFloor: {
//         floorNo: number
//     } = JSON.parse(req.body);
//     const floor = await createFloor(req.params["buildingName"], newFloor.floorNo);
//     res.send(JSON.stringify({ status: Status.Success, floor }));
// });

// buildingRouter.get("/:buildingName/floor/:floorNo", cors(copts), async (req, res) => {
//     const building = await Building.findOne({ where: { name: req.params["buildingName"] } });
//     const floor = await Floor.findOne({
//         where: {
//             buildingId: building.id,
//             floorNo: req.params["floorNo"]
//         }
//     });
//     res.send(JSON.stringify({ status: Status.Success, building, floor }));
// });

// buildingRouter.delete("/:buildingName/floor/:floorNo", cors(copts), async (req, res) => {
//     const building = await Building.findOne({ where: { name: req.params["buildingName"] } });
//     const floor = await Floor.findOne({
//         where: {
//             buildingId: building.id,
//             floorNo: req.params["floorNo"]
//         }
//     });
//     await floor.destroy();
//     res.send(JSON.stringify({ status: Status.Success }));
// });

// buildingRouter.get("/:buildingName/elevator/:elevatorNo/openDoor", cors(copts), async (req, res) => {
//     const building = req.params["buildingName"];
//     const elevatorNo = req.params["elevatorNo"];
//     await openDoor(building, elevatorNo);
//     const e = await getElevator(building, elevatorNo);
//     res.send(JSON.stringify({ status: Status.Success, elevator: e }));
// });

// buildingRouter.get("/:buildingName/elevator/:elevatorNo/closeDoor", cors(copts), async (req, res) => {
//     const building = req.params["buildingName"];
//     const elevatorNo = req.params["elevatorNo"];
//     await closeDoor(building, elevatorNo);
//     const e = await getElevator(building, elevatorNo);
//     res.send(JSON.stringify({ status: Status.Success, elevator: e }));
// });

// TODO probably can save code by reimporting routes in here that handle the sub-actions of each thing managed
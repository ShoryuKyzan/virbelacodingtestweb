import request from "supertest";
import { app, Status } from "../src/app";
import { Building, DoorStatus, Elevator, Floor, sequelize } from "../src/model";
import { CleanupForceInsertKeys, CleanupRecordKeys, cleanupRecords } from "./utils";
import { createBuilding } from "../src/buildingService";
import { getFloor } from "../src/buildingService";
import { closeDoor } from "../src/elevatorService";

test("get buildings", async () => {
    const response = await request(app).get("/building");
    console.log(response.text); // XXX
    const actualBody = JSON.parse(response.text);
    // clened
    const expectedBody = {
        "status": "success",
        "buildings":
            [{ "id": "", "name": "DataDyne", "createdAt": "", "updatedAt": "" }]
    };

    actualBody.buildings = cleanupRecords(actualBody.buildings);
    console.log("buildings", actualBody.buildings); // XXX
    expect(actualBody).toStrictEqual(expectedBody);
});

test("get building", async () => {
    const response = await request(app).get("/building/DataDyne");
    console.log(response.text); // XXX
    const actualBody = JSON.parse(response.text);
    // clened
    const expectedBody = {
        "status": "success",
        "building": { "id": 1, "name": "DataDyne", "createdAt": "", "updatedAt": "" }
    };

    actualBody.building = cleanupRecords(actualBody.building, CleanupRecordKeys.Dates);
    console.log("building", actualBody.building); // XXX
    expect(actualBody).toStrictEqual(expectedBody);
});


test("create building", async () => {
    const buildingName = "G5 Building";
    const response = await request(app).put(`/building/${buildingName}`);
    const actualBody = JSON.parse(response.text);

    const expectedBody = {
        "status": "success",
        "building": { "id": "", "name": buildingName, "createdAt": "", "updatedAt": "" }
    };

    actualBody.building = cleanupRecords(actualBody.building);
    console.log("expected, actual:", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);

    const buildings = await Building.findAll({ where: { name: buildingName } });
    expect(buildings.length).toBe(1);

    // cleanup
    await buildings[0].destroy();
});

test("update building", async () => {
    // create building to delete
    const buildingName = "Carrington Institute";
    await Building.create({ name: buildingName });

    // ensure created
    let buildings = await Building.findAll({ where: { name: buildingName } });
    expect(buildings.length).toBe(1);

    const newBuildingName = "Carrington Institute (Skedar)";

    const response = await request(app).post(`/building/${buildingName}`)
        .send({ name: newBuildingName })
        .set("Accept", "application/json");
    const actualBody = JSON.parse(response.text);

    const expectedUpdatedBuilding = { "id": "", "name": newBuildingName, "createdAt": "", "updatedAt": "" };
    const expectedBody = { status: Status.Success, building: expectedUpdatedBuilding };

    console.log("expected, actual:", expectedBody, actualBody);
    actualBody.building = cleanupRecords(actualBody.building);

    expect(actualBody).toStrictEqual(expectedBody);

    // confirm new name when looking up
    buildings = await Building.findAll({ where: { name: newBuildingName } });
    expect(buildings.length).toBe(1);

    // cleanup
    await buildings[0].destroy();

});

test("delete building", async () => {
    // create building to delete
    const buildingName = "Skedar Ruins";
    const b = await createBuilding(buildingName);
    const e1 = await Elevator.create({ elevatorNo: "0" });
    const e2 = await Elevator.create({ elevatorNo: "1" });
    const e3 = await Elevator.create({ elevatorNo: "2" });
    const e4 = await Elevator.create({ elevatorNo: "3" });
    const f1 = await Floor.create({ floorNo: 0 });
    const f2 = await Floor.create({ floorNo: 1 });
    const f3 = await Floor.create({ floorNo: 2 });
    const f4 = await Floor.create({ floorNo: 3 });
    await b.addElevator([e1,
        e2,
        e3,
        e4]);
    await b.addFloor([f1,
        f2,
        f3,
        f4]);

    const oldBuildingId = b.id;

    const response = await request(app).delete(`/building/${buildingName}`);
    const actualBody = JSON.parse(response.text);

    const expectedBody = { status: Status.Success };

    console.log("expected, actual:", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);

    // confirm deletion of building and connected floors and elevators.
    const buildings = await Building.findAll({ where: { name: buildingName } });
    expect(buildings.length).toBe(0);
    const elevators = await Elevator.findAll({ where: { buildingId: oldBuildingId } });
    expect(elevators.length).toBe(0);
    const floors = await Floor.findAll({ where: { buildingId: oldBuildingId } });
    expect(floors.length).toBe(0);

});

test("create building floor", async () => {
    // create building to delete
    const buildingName = "Skedar Ship";
    const b = await createBuilding(buildingName);
    const f1 = await Floor.create({ floorNo: 0 });
    const f2 = await Floor.create({ floorNo: 1 });
    await b.addFloor([f1, f2]);


    // fail
    let response = await request(app).put(`/building/${buildingName}/floor`).send({ floorNo: 1 });
    expect(response.status).toBe(500);
    // success
    response = await request(app).put(`/building/${buildingName}/floor`).send({ floorNo: 2 });
    const actualBody = JSON.parse(response.text);

    const expectedBody = {
        status: Status.Success,
        floor: {
            "id": "",
            "floorNo": 2,
            "buildingId": b.id,
            "createdAt": "",
            "updatedAt": ""
        }
    };

    actualBody.floor = cleanupRecords(actualBody.floor);

    console.log("expected, actual:", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);

    //cleanup
    await b.destroy();
});

test("create building elevator", async () => {
    // create building to delete
    const buildingName = "Air Force One";
    const b = await createBuilding(buildingName);
    const e1 = await Elevator.create({ elevatorNo: "0" });
    const e2 = await Elevator.create({ elevatorNo: "1" });
    await b.addElevator([e1, e2]);


    // fail
    let response = await request(app).put(`/building/${buildingName}/elevator`).send({ elevatorNo: "1" });
    expect(response.status).toBe(500);
    // success
    response = await request(app).put(`/building/${buildingName}/elevator`).send({ elevatorNo: "2" });
    const actualBody = JSON.parse(response.text);

    const expectedBody = {
        status: Status.Success,
        elevator: {
            "id": "",
            "buildingId": b.id,
            "status": 0,
            "doorStatus": 1,
            "currentFloorId": "",
            "elevatorNo": "2",
            "createdAt": "",
            "updatedAt": ""
        }
    };

    actualBody.elevator = cleanupRecords(actualBody.elevator, CleanupRecordKeys.All, CleanupForceInsertKeys.ElevatorCurrentFloor);

    console.log("expected, actual:", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);

    //cleanup
    await b.destroy();
});


test("get building elevators", async () => {
    const response = await request(app).get("/building/DataDyne/elevator");
    const actualBody = JSON.parse(response.text);
    // clened
    const expectedBody = {
        "status": "success",
        "elevators":
            [
                { "id": 1, "buildingId": 1, "status": 0, "doorStatus": 1, "currentFloorId": "", "elevatorNo": "0", "createdAt": "2022-03-03T04:16:59.057Z", "updatedAt": "2022-03-03T04:16:59.061Z" },
                { "id": 2, "buildingId": 1, "status": 0, "doorStatus": 1, "currentFloorId": "", "elevatorNo": "1", "createdAt": "2022-03-03T04:16:59.154Z", "updatedAt": "2022-03-03T04:16:59.158Z" },
                { "id": 3, "buildingId": 1, "status": 0, "doorStatus": 1, "currentFloorId": "", "elevatorNo": "2", "createdAt": "2022-03-03T04:16:59.259Z", "updatedAt": "2022-03-03T04:17:06.611Z" },
                { "id": 4, "buildingId": 1, "status": 0, "doorStatus": 1, "currentFloorId": "", "elevatorNo": "3", "createdAt": "2022-03-03T04:16:59.364Z", "updatedAt": "2022-03-03T04:16:59.368Z" }
            ]
    };
    expectedBody.elevators = cleanupRecords(expectedBody.elevators, CleanupRecordKeys.Dates);

    actualBody.elevators = cleanupRecords(actualBody.elevators, CleanupRecordKeys.DatesAndElevatorCurrentFloor, CleanupForceInsertKeys.ElevatorCurrentFloor);
    console.log("expected, actual:", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);
});

test("get building floors", async () => {
    const response = await request(app).get("/building/DataDyne/floor");
    const actualBody = JSON.parse(response.text);
    // clened
    const expectedBody = {
        "status": "success",
        "floors": allFloors
    };
    expectedBody.floors = cleanupRecords(actualBody.floors, CleanupRecordKeys.Dates);

    actualBody.floors = cleanupRecords(actualBody.floors, CleanupRecordKeys.Dates);
    console.log("expected, actual:", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);
});


test("openDoor", async () => {
    const response = await request(app).get("/building/DataDyne/elevator/2/openDoor");

    const actualBody = JSON.parse(response.text);
    const expectedBody = {
        status: Status.Success,
        elevator: cleanupRecords({ "id": 3, "buildingId": 1, "status": 0, "currentFloorId": "", "doorStatus": DoorStatus.Open, "elevatorNo": "2", "createdAt": "2022-03-03T04:16:59.259Z", "updatedAt": "2022-03-03T04:17:06.611Z" }, CleanupRecordKeys.Dates)
    };

    actualBody.elevator = cleanupRecords(actualBody.elevator, CleanupRecordKeys.DatesAndElevatorCurrentFloor, CleanupForceInsertKeys.ElevatorCurrentFloor);
    console.log("expected, actual:", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);
    // cleanup, close again
    await request(app).get("/building/DataDyne/elevator/2/closeDoor");
});

test("closeDoor", async () => {
    const response = await request(app).get("/building/DataDyne/elevator/2/closeDoor");

    const actualBody = JSON.parse(response.text);
    const expectedBody = {
        status: Status.Success,
        elevator: cleanupRecords({
            id: 3,
            buildingId: 1,
            status: 0,
            currentFloorId: "",
            doorStatus: DoorStatus.Closed,
            elevatorNo: "2",
            createdAt: "2022-03-03T04:16:59.259Z",
            updatedAt: "2022-03-03T04:17:06.611Z",
        }, CleanupRecordKeys.DatesAndElevatorCurrentFloor)
    };

    actualBody.elevator = cleanupRecords(actualBody.elevator, CleanupRecordKeys.DatesAndElevatorCurrentFloor, CleanupForceInsertKeys.ElevatorCurrentFloor);
    console.log("expected, actual:", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);
});

test("goToFloor", async () => {
    const response = await request(app).get("/building/DataDyne/elevator/2/goToFloor/100");

    const f = await getFloor("DataDyne", 100);

    const actualBody = JSON.parse(response.text);
    const expectedBody = {
        status: Status.Success,
        elevator: cleanupRecords({
            "id": 3,
            "buildingId": 1,
            "status": 0,
            "doorStatus": DoorStatus.Open,
            "elevatorNo": "2",
            "currentFloorId": f.id,
            "createdAt": "2022-03-03T04:16:59.259Z",
            "updatedAt": "2022-03-03T04:17:06.611Z"
        }, CleanupRecordKeys.Dates)
    };

    actualBody.elevator = cleanupRecords(actualBody.elevator, CleanupRecordKeys.Dates);
    console.log("expected, actual:", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);

    // cleanup, reset door back to closed.
    await closeDoor("DataDyne", "2");
});

const allFloors = [
    {
        "id": 1,
        "floorNo": 1,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.075Z",
        "updatedAt": "2022-03-03T04:16:58.082Z"
    },
    {
        "id": 2,
        "floorNo": 2,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.090Z",
        "updatedAt": "2022-03-03T04:16:58.095Z"
    },
    {
        "id": 3,
        "floorNo": 3,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.100Z",
        "updatedAt": "2022-03-03T04:16:58.103Z"
    },
    {
        "id": 4,
        "floorNo": 4,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.108Z",
        "updatedAt": "2022-03-03T04:16:58.114Z"
    },
    {
        "id": 5,
        "floorNo": 5,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.119Z",
        "updatedAt": "2022-03-03T04:16:58.124Z"
    },
    {
        "id": 6,
        "floorNo": 6,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.131Z",
        "updatedAt": "2022-03-03T04:16:58.138Z"
    },
    {
        "id": 7,
        "floorNo": 7,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.142Z",
        "updatedAt": "2022-03-03T04:16:58.147Z"
    },
    {
        "id": 8,
        "floorNo": 8,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.153Z",
        "updatedAt": "2022-03-03T04:16:58.158Z"
    },
    {
        "id": 9,
        "floorNo": 9,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.163Z",
        "updatedAt": "2022-03-03T04:16:58.167Z"
    },
    {
        "id": 10,
        "floorNo": 10,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.173Z",
        "updatedAt": "2022-03-03T04:16:58.179Z"
    },
    {
        "id": 11,
        "floorNo": 11,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.184Z",
        "updatedAt": "2022-03-03T04:16:58.191Z"
    },
    {
        "id": 12,
        "floorNo": 12,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.197Z",
        "updatedAt": "2022-03-03T04:16:58.201Z"
    },
    {
        "id": 13,
        "floorNo": 13,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.205Z",
        "updatedAt": "2022-03-03T04:16:58.209Z"
    },
    {
        "id": 14,
        "floorNo": 14,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.216Z",
        "updatedAt": "2022-03-03T04:16:58.221Z"
    },
    {
        "id": 15,
        "floorNo": 15,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.226Z",
        "updatedAt": "2022-03-03T04:16:58.230Z"
    },
    {
        "id": 16,
        "floorNo": 16,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.235Z",
        "updatedAt": "2022-03-03T04:16:58.240Z"
    },
    {
        "id": 17,
        "floorNo": 17,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.244Z",
        "updatedAt": "2022-03-03T04:16:58.248Z"
    },
    {
        "id": 18,
        "floorNo": 18,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.252Z",
        "updatedAt": "2022-03-03T04:16:58.257Z"
    },
    {
        "id": 19,
        "floorNo": 19,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.262Z",
        "updatedAt": "2022-03-03T04:16:58.266Z"
    },
    {
        "id": 20,
        "floorNo": 20,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.270Z",
        "updatedAt": "2022-03-03T04:16:58.276Z"
    },
    {
        "id": 21,
        "floorNo": 21,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.284Z",
        "updatedAt": "2022-03-03T04:16:58.289Z"
    },
    {
        "id": 22,
        "floorNo": 22,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.294Z",
        "updatedAt": "2022-03-03T04:16:58.301Z"
    },
    {
        "id": 23,
        "floorNo": 23,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.306Z",
        "updatedAt": "2022-03-03T04:16:58.310Z"
    },
    {
        "id": 24,
        "floorNo": 24,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.315Z",
        "updatedAt": "2022-03-03T04:16:58.320Z"
    },
    {
        "id": 25,
        "floorNo": 25,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.324Z",
        "updatedAt": "2022-03-03T04:16:58.328Z"
    },
    {
        "id": 26,
        "floorNo": 26,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.332Z",
        "updatedAt": "2022-03-03T04:16:58.338Z"
    },
    {
        "id": 27,
        "floorNo": 27,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.344Z",
        "updatedAt": "2022-03-03T04:16:58.348Z"
    },
    {
        "id": 28,
        "floorNo": 28,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.352Z",
        "updatedAt": "2022-03-03T04:16:58.357Z"
    },
    {
        "id": 29,
        "floorNo": 29,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.364Z",
        "updatedAt": "2022-03-03T04:16:58.368Z"
    },
    {
        "id": 30,
        "floorNo": 30,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.372Z",
        "updatedAt": "2022-03-03T04:16:58.377Z"
    },
    {
        "id": 31,
        "floorNo": 31,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.386Z",
        "updatedAt": "2022-03-03T04:16:58.391Z"
    },
    {
        "id": 32,
        "floorNo": 32,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.396Z",
        "updatedAt": "2022-03-03T04:16:58.401Z"
    },
    {
        "id": 33,
        "floorNo": 33,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.407Z",
        "updatedAt": "2022-03-03T04:16:58.412Z"
    },
    {
        "id": 34,
        "floorNo": 34,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.416Z",
        "updatedAt": "2022-03-03T04:16:58.420Z"
    },
    {
        "id": 35,
        "floorNo": 35,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.426Z",
        "updatedAt": "2022-03-03T04:16:58.430Z"
    },
    {
        "id": 36,
        "floorNo": 36,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.434Z",
        "updatedAt": "2022-03-03T04:16:58.438Z"
    },
    {
        "id": 37,
        "floorNo": 37,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.444Z",
        "updatedAt": "2022-03-03T04:16:58.449Z"
    },
    {
        "id": 38,
        "floorNo": 38,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.453Z",
        "updatedAt": "2022-03-03T04:16:58.457Z"
    },
    {
        "id": 39,
        "floorNo": 39,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.461Z",
        "updatedAt": "2022-03-03T04:16:58.466Z"
    },
    {
        "id": 40,
        "floorNo": 40,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.471Z",
        "updatedAt": "2022-03-03T04:16:58.475Z"
    },
    {
        "id": 41,
        "floorNo": 41,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.482Z",
        "updatedAt": "2022-03-03T04:16:58.487Z"
    },
    {
        "id": 42,
        "floorNo": 42,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.491Z",
        "updatedAt": "2022-03-03T04:16:58.495Z"
    },
    {
        "id": 43,
        "floorNo": 43,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.499Z",
        "updatedAt": "2022-03-03T04:16:58.503Z"
    },
    {
        "id": 44,
        "floorNo": 44,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.507Z",
        "updatedAt": "2022-03-03T04:16:58.512Z"
    },
    {
        "id": 45,
        "floorNo": 45,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.516Z",
        "updatedAt": "2022-03-03T04:16:58.521Z"
    },
    {
        "id": 46,
        "floorNo": 46,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.529Z",
        "updatedAt": "2022-03-03T04:16:58.535Z"
    },
    {
        "id": 47,
        "floorNo": 47,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.539Z",
        "updatedAt": "2022-03-03T04:16:58.542Z"
    },
    {
        "id": 48,
        "floorNo": 48,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.547Z",
        "updatedAt": "2022-03-03T04:16:58.551Z"
    },
    {
        "id": 49,
        "floorNo": 49,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.555Z",
        "updatedAt": "2022-03-03T04:16:58.558Z"
    },
    {
        "id": 50,
        "floorNo": 50,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.562Z",
        "updatedAt": "2022-03-03T04:16:58.566Z"
    },
    {
        "id": 51,
        "floorNo": 51,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.570Z",
        "updatedAt": "2022-03-03T04:16:58.574Z"
    },
    {
        "id": 52,
        "floorNo": 52,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.578Z",
        "updatedAt": "2022-03-03T04:16:58.581Z"
    },
    {
        "id": 53,
        "floorNo": 53,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.585Z",
        "updatedAt": "2022-03-03T04:16:58.591Z"
    },
    {
        "id": 54,
        "floorNo": 54,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.595Z",
        "updatedAt": "2022-03-03T04:16:58.599Z"
    },
    {
        "id": 55,
        "floorNo": 55,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.603Z",
        "updatedAt": "2022-03-03T04:16:58.611Z"
    },
    {
        "id": 56,
        "floorNo": 56,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.617Z",
        "updatedAt": "2022-03-03T04:16:58.621Z"
    },
    {
        "id": 57,
        "floorNo": 57,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.625Z",
        "updatedAt": "2022-03-03T04:16:58.632Z"
    },
    {
        "id": 58,
        "floorNo": 58,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.637Z",
        "updatedAt": "2022-03-03T04:16:58.642Z"
    },
    {
        "id": 59,
        "floorNo": 59,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.645Z",
        "updatedAt": "2022-03-03T04:16:58.650Z"
    },
    {
        "id": 60,
        "floorNo": 60,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.655Z",
        "updatedAt": "2022-03-03T04:16:58.659Z"
    },
    {
        "id": 61,
        "floorNo": 61,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.663Z",
        "updatedAt": "2022-03-03T04:16:58.667Z"
    },
    {
        "id": 62,
        "floorNo": 62,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.673Z",
        "updatedAt": "2022-03-03T04:16:58.679Z"
    },
    {
        "id": 63,
        "floorNo": 63,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.682Z",
        "updatedAt": "2022-03-03T04:16:58.686Z"
    },
    {
        "id": 64,
        "floorNo": 64,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.690Z",
        "updatedAt": "2022-03-03T04:16:58.695Z"
    },
    {
        "id": 65,
        "floorNo": 65,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.699Z",
        "updatedAt": "2022-03-03T04:16:58.702Z"
    },
    {
        "id": 66,
        "floorNo": 66,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.707Z",
        "updatedAt": "2022-03-03T04:16:58.711Z"
    },
    {
        "id": 67,
        "floorNo": 67,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.714Z",
        "updatedAt": "2022-03-03T04:16:58.718Z"
    },
    {
        "id": 68,
        "floorNo": 68,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.722Z",
        "updatedAt": "2022-03-03T04:16:58.726Z"
    },
    {
        "id": 69,
        "floorNo": 69,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.730Z",
        "updatedAt": "2022-03-03T04:16:58.737Z"
    },
    {
        "id": 70,
        "floorNo": 70,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.742Z",
        "updatedAt": "2022-03-03T04:16:58.747Z"
    },
    {
        "id": 71,
        "floorNo": 71,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.751Z",
        "updatedAt": "2022-03-03T04:16:58.758Z"
    },
    {
        "id": 72,
        "floorNo": 72,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.763Z",
        "updatedAt": "2022-03-03T04:16:58.767Z"
    },
    {
        "id": 73,
        "floorNo": 73,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.771Z",
        "updatedAt": "2022-03-03T04:16:58.777Z"
    },
    {
        "id": 74,
        "floorNo": 74,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.780Z",
        "updatedAt": "2022-03-03T04:16:58.785Z"
    },
    {
        "id": 75,
        "floorNo": 75,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.789Z",
        "updatedAt": "2022-03-03T04:16:58.793Z"
    },
    {
        "id": 76,
        "floorNo": 76,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.799Z",
        "updatedAt": "2022-03-03T04:16:58.804Z"
    },
    {
        "id": 77,
        "floorNo": 77,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.808Z",
        "updatedAt": "2022-03-03T04:16:58.813Z"
    },
    {
        "id": 78,
        "floorNo": 78,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.817Z",
        "updatedAt": "2022-03-03T04:16:58.821Z"
    },
    {
        "id": 79,
        "floorNo": 79,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.825Z",
        "updatedAt": "2022-03-03T04:16:58.829Z"
    },
    {
        "id": 80,
        "floorNo": 80,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.833Z",
        "updatedAt": "2022-03-03T04:16:58.839Z"
    },
    {
        "id": 81,
        "floorNo": 81,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.847Z",
        "updatedAt": "2022-03-03T04:16:58.851Z"
    },
    {
        "id": 82,
        "floorNo": 82,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.855Z",
        "updatedAt": "2022-03-03T04:16:58.861Z"
    },
    {
        "id": 83,
        "floorNo": 83,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.865Z",
        "updatedAt": "2022-03-03T04:16:58.868Z"
    },
    {
        "id": 84,
        "floorNo": 84,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.872Z",
        "updatedAt": "2022-03-03T04:16:58.876Z"
    },
    {
        "id": 85,
        "floorNo": 85,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.883Z",
        "updatedAt": "2022-03-03T04:16:58.887Z"
    },
    {
        "id": 86,
        "floorNo": 86,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.891Z",
        "updatedAt": "2022-03-03T04:16:58.895Z"
    },
    {
        "id": 87,
        "floorNo": 87,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.899Z",
        "updatedAt": "2022-03-03T04:16:58.910Z"
    },
    {
        "id": 88,
        "floorNo": 88,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.915Z",
        "updatedAt": "2022-03-03T04:16:58.920Z"
    },
    {
        "id": 89,
        "floorNo": 89,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.926Z",
        "updatedAt": "2022-03-03T04:16:58.930Z"
    },
    {
        "id": 90,
        "floorNo": 90,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.934Z",
        "updatedAt": "2022-03-03T04:16:58.938Z"
    },
    {
        "id": 91,
        "floorNo": 91,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.943Z",
        "updatedAt": "2022-03-03T04:16:58.947Z"
    },
    {
        "id": 92,
        "floorNo": 92,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.951Z",
        "updatedAt": "2022-03-03T04:16:58.955Z"
    },
    {
        "id": 93,
        "floorNo": 93,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.960Z",
        "updatedAt": "2022-03-03T04:16:58.967Z"
    },
    {
        "id": 94,
        "floorNo": 94,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.972Z",
        "updatedAt": "2022-03-03T04:16:58.977Z"
    },
    {
        "id": 95,
        "floorNo": 95,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.983Z",
        "updatedAt": "2022-03-03T04:16:58.990Z"
    },
    {
        "id": 96,
        "floorNo": 96,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:58.994Z",
        "updatedAt": "2022-03-03T04:16:58.998Z"
    },
    {
        "id": 97,
        "floorNo": 97,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:59.002Z",
        "updatedAt": "2022-03-03T04:16:59.008Z"
    },
    {
        "id": 98,
        "floorNo": 98,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:59.012Z",
        "updatedAt": "2022-03-03T04:16:59.016Z"
    },
    {
        "id": 99,
        "floorNo": 99,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:59.020Z",
        "updatedAt": "2022-03-03T04:16:59.024Z"
    },
    {
        "id": 100,
        "floorNo": 100,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:59.031Z",
        "updatedAt": "2022-03-03T04:16:59.035Z"
    },
    {
        "id": 101,
        "floorNo": 101,
        "buildingId": 1,
        "createdAt": "2022-03-03T04:16:59.039Z",
        "updatedAt": "2022-03-03T04:16:59.043Z"
    }
];

import request from "supertest";
import { app, Status } from "../src/app";
import { createBuilding } from "../src/buildingService";
import { Elevator, Floor, sequelize } from "../src/model";
import { CleanupRecordKeys, cleanupRecords } from "./utils";

test("get elevators", async () => {
    const response = await request(app).get("/elevator");

    const actualBody = JSON.parse(response.text);

    const expectedElevators = cleanupRecords([
        { "id": 1, "buildingId": 1, "status": 0, "doorStatus": 1, "elevatorNo": "0", "createdAt": "2022-03-02T21:56:14.541Z", "updatedAt": "2022-03-02T21:56:14.585Z" },
        { "id": 2, "buildingId": 1, "status": 0, "doorStatus": 1, "elevatorNo": "1", "createdAt": "2022-03-02T21:56:14.973Z", "updatedAt": "2022-03-02T21:56:14.978Z" },
        { "id": 3, "buildingId": 1, "status": 0, "doorStatus": 1, "elevatorNo": "2", "createdAt": "2022-03-02T21:56:15.349Z", "updatedAt": "2022-03-02T21:56:17.253Z" },
        { "id": 4, "buildingId": 1, "status": 0, "doorStatus": 1, "elevatorNo": "3", "createdAt": "2022-03-02T21:56:15.677Z", "updatedAt": "2022-03-02T21:56:15.725Z" }],
        CleanupRecordKeys.Dates);
    const expectedBody = { "status": Status.Success, "elevators": expectedElevators };

    actualBody.elevators = cleanupRecords(actualBody.elevators, CleanupRecordKeys.Dates);
    console.log("expected, actual: ", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);
});

test("get elevator by id", async () => {
    const response = await request(app).get("/elevator/2");

    const actualBody = JSON.parse(response.text);

    const expectedElevator = cleanupRecords(
        [{ "id": 2, "buildingId": 1, "status": 0, "doorStatus": 1, "elevatorNo": "1", "createdAt": "2022-03-02T21:56:14.973Z", "updatedAt": "2022-03-02T21:56:14.978Z" }],
        CleanupRecordKeys.Dates);
    const expectedBody = { "status": Status.Success, "elevator": expectedElevator };

    actualBody.elevator = cleanupRecords(actualBody.elevator, CleanupRecordKeys.Dates);
    console.log("expected, actual: ", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);
});


test("delete elevator", async () => {
    const e = await Elevator.create({ elevatorNo: "1" }); // no associated building which is fine
    const oldId = e.id;
    const response = await request(app).delete(`/elevator/${e.id}`);

    const actualBody = JSON.parse(response.text);

    const expectedBody = { "status": Status.Success };

    console.log("expected, actual: ", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);

    // ensure deleted
    const es = await Elevator.findAll({ where: { id: oldId } });
    expect(es.length).toBe(0);
});

test("update elevator", async () => {

    // create building to delete
    const buildingName = "Area 51 Underground";
    const b = await createBuilding(buildingName);
    const e1 = await Elevator.create({ elevatorNo: "0" });
    const e2 = await Elevator.create({ elevatorNo: "1" });
    const e3 = await Elevator.create({ elevatorNo: "2" });
    const e4 = await Elevator.create({ elevatorNo: "3" });
    b.addElevator([e1,
        e2,
        e3,
        e4]);


    // fail
    let response = await request(app).post(`/elevator/${e3.id}`).send({ elevatorNo: "3" });
    expect(response.status).toBe(500);

    // success
    response = await request(app).post(`/elevator/${e3.id}`).send({ elevatorNo: "4" });
    const actualBody = JSON.parse(response.text);
    const expectedBody = {
        "status": Status.Success,
        "elevator": {
            "id": "",
            "buildingId": b.id,
            "status": 0,
            "doorStatus": 1,
            "elevatorNo": "4",
            "createdAt": "",
            "updatedAt": ""
        }
    };

    actualBody.elevator = cleanupRecords(actualBody.elevator);
    console.log("expected, actual: ", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);

    await b.destroy();
});

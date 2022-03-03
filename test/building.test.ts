import request from "supertest";
import { app, Status } from "../src/app";
import { Building, Elevator, Floor, sequelize } from "../src/model";
import { CleanupRecordKeys, cleanupRecords } from "./utils";
import { createBuilding } from "../src/buildingService";

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

// test("get building elevators", async () => {
//     const response = await request(app).get("/building/DataDyne/elevator");

//     const actualBody = JSON.parse(response.text);
//     console.log("elevators", response.body); // XXX
//     // const expectedBody = { status: Status.Success, elevator: {} }; // TODO fill this in
//     // expectedBody.id = actualBody.id; // id doesnt matter

//     // expect(response.statusCode).toBe(200);
//     // expect(actualBody).toStrictEqual(expectedBody);
// });

// test("openDoor", async () => {
//     const response = await request(app).get("/building/DataDyne/elevator/2/openDoor");

//     const actualBody = JSON.parse(response.body);
//     console.log("openDoor", response.body); // XXX
//     // const expectedBody = { status: Status.Success, elevator: {} }; // TODO fill this in
//     // expectedBody.id = actualBody.id; // id doesnt matter

//     // expect(response.statusCode).toBe(200);
//     // expect(actualBody).toStrictEqual(expectedBody);
// });
// test("closeDoor", async () => {
//     const response = await request(app).get("/building/DataDyne/elevator/2/closeDoor");

//     const actualBody = JSON.parse(response.body);
//     console.log("closeDoor", response.body); // XXX
//     // const expectedBody = { status: Status.Success, elevator: {} }; // TODO fill this in
//     // expectedBody.id = actualBody.id; // id doesnt matter

//     // expect(response.statusCode).toBe(200);
//     // expect(actualBody).toStrictEqual(expectedBody);
// });


test("create building", async () => {
    const buildingName = "Carrington Institute";
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
    await sequelize.sync();
});

test("delete building", async () => {
    // create building to delete
    const buildingName = "Carrington Institute";
    const b = await createBuilding(buildingName);
    const e1 = await Elevator.create({ elevatorNo: "0" });
    const e2 = await Elevator.create({ elevatorNo: "1" });
    const e3 = await Elevator.create({ elevatorNo: "2" });
    const e4 = await Elevator.create({ elevatorNo: "3" });
    const f1 = await Floor.create({ floorNo: 0 });
    const f2 = await Floor.create({ floorNo: 1 });
    const f3 = await Floor.create({ floorNo: 2 });
    const f4 = await Floor.create({ floorNo: 3 });
    b.addElevator([e1,
        e2,
        e3,
        e4]);
    b.addFloor([f1,
        f2,
        f3,
        f4]);
    sequelize.sync();

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

test("update building", async () => {
    // create building to delete
    const buildingName = "Carrington Institute";
    await Building.create({ name: buildingName });
    sequelize.sync();

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
    await sequelize.sync();


});
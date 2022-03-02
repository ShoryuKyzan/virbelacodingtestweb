import request from "supertest";
import { app } from "../src/app";
import { cleanupRecords, setup, teardown } from "./utils";

// didn't use jest's version of this due to some issues with db init originally.
beforeAll(async () => {
    await setup();
    console.log("schema setup");
});

afterAll(async () => {
    await teardown();
});

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
    // const expectedBody = { status: Status.Success, elevator: {} }; // TODO fill this in
    // expectedBody.id = actualBody.id; // id doesnt matter

    // expect(response.statusCode).toBe(200);
    // expect(actualBody).toStrictEqual(expectedBody);
});
// test("get elevators", async () => {
//     const response = await request(app).get("/elevator");

//     const actualBody = JSON.parse(response.text);
//     console.log("elevators", response.body); // XXX
//     // const expectedBody = { status: Status.Success, elevator: {} }; // TODO fill this in
//     // expectedBody.id = actualBody.id; // id doesnt matter

//     // expect(response.statusCode).toBe(200);
//     // expect(actualBody).toStrictEqual(expectedBody);
// });
// test("get building elevators", async () => {
//     const response = await request(app).get("/building/DataDyne/elevator");

//     const actualBody = JSON.parse(response.body);
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

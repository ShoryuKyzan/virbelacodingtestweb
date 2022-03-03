import request from "supertest";
import { app, Status } from "../src/app";
import { cleanupRecords } from "./utils";

test("get elevators", async () => {
    const response = await request(app).get("/elevator");

    const actualBody = JSON.parse(response.text);

    const expectedElevators = cleanupRecords([
        { "id": 1, "buildingId": 1, "status": 0, "doorStatus": 1, "elevatorNo": "0", "createdAt": "2022-03-02T21:56:14.541Z", "updatedAt": "2022-03-02T21:56:14.585Z" },
        { "id": 2, "buildingId": 1, "status": 0, "doorStatus": 1, "elevatorNo": "1", "createdAt": "2022-03-02T21:56:14.973Z", "updatedAt": "2022-03-02T21:56:14.978Z" },
        { "id": 3, "buildingId": 1, "status": 0, "doorStatus": 1, "elevatorNo": "2", "createdAt": "2022-03-02T21:56:15.349Z", "updatedAt": "2022-03-02T21:56:17.253Z" },
        { "id": 4, "buildingId": 1, "status": 0, "doorStatus": 1, "elevatorNo": "3", "createdAt": "2022-03-02T21:56:15.677Z", "updatedAt": "2022-03-02T21:56:15.725Z" }]);
    const expectedBody = { "status": Status.Success, "elevators": expectedElevators };

    actualBody.elevators = cleanupRecords(actualBody.elevators);
    console.log("expected, actual: ", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);
});

test("get elevator by id", async () => {
    const response = await request(app).get("/elevator/2");

    const actualBody = JSON.parse(response.text);

    const expectedElevator = cleanupRecords(
        [{ "id": 2, "buildingId": 1, "status": 0, "doorStatus": 1, "elevatorNo": "1", "createdAt": "2022-03-02T21:56:14.973Z", "updatedAt": "2022-03-02T21:56:14.978Z" }]);
    const expectedBody = { "status": Status.Success, "elevator": expectedElevator };

    actualBody.elevator = cleanupRecords(actualBody.elevator);
    console.log("expected, actual: ", expectedBody, actualBody);
    expect(actualBody).toStrictEqual(expectedBody);
});

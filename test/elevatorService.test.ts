import { openDoor, closeDoor, getElevator, createElevator, createFloor, getFloor } from "../src/elevatorService";
import { DoorStatus, sequelize } from "../src/model";
import { CleanupRecordKeys, cleanupRecords } from "./utils";


test("openDoor", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const buildingName = "DataDyne";
    const elevatorNo = "2";
    const expectedLogs = [
        "DataDyne elevator 2 door closed",
        "DataDyne elevator 2 door opened"
    ];

    // open elevator #2 door
    await closeDoor(buildingName, elevatorNo);
    await openDoor(buildingName, elevatorNo);

    // record results and restore console logging
    const consoleLogs = consoleSpy.mock.calls;
    consoleSpy.mockRestore();

    console.log("actual, expected: ", consoleLogs, expectedLogs);

    expect(consoleLogs.length).toBe(2);
    expect(consoleLogs[0][0]).toContain(expectedLogs[0]);
    expect(consoleLogs[1][0]).toContain(expectedLogs[1]);

    const e = await getElevator(buildingName, elevatorNo);
    console.log("doorstatus open", DoorStatus.Open);
    console.log("Elevator doorstatus", e.doorStatus, e.toJSON());
    expect(e.doorStatus).toBe(DoorStatus.Open);

    // set back to closed
    await closeDoor(buildingName, elevatorNo);
});

test("closeDoor", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const buildingName = "DataDyne";
    const elevatorNo = "2";
    const expectedLogs = [
        "DataDyne elevator 2 door opened",
        "DataDyne elevator 2 door closed"
    ];

    // open elevator #2 door
    await openDoor(buildingName, elevatorNo);
    await closeDoor(buildingName, elevatorNo);

    // record results and restore console logging
    const consoleLogs = consoleSpy.mock.calls;
    consoleSpy.mockRestore();

    console.log("actual, expected: ", consoleLogs, expectedLogs);

    expect(consoleLogs.length).toBe(2);
    expect(consoleLogs[0][0]).toContain(expectedLogs[0]);
    expect(consoleLogs[1][0]).toContain(expectedLogs[1]);

    const e = await getElevator(buildingName, elevatorNo);
    console.log("doorstatus closed", DoorStatus.Closed);
    console.log("Elevator doorstatus", e.doorStatus, e.toJSON());
    expect(e.doorStatus).toBe(DoorStatus.Closed);
    // set back to closed just in case
    await closeDoor(buildingName, elevatorNo);
});

test("getElevator", async () => {
    const buildingName = "DataDyne";
    const elevatorNo = "2";

    const expectedElevator = cleanupRecords({
        "id": 3,
        "buildingId": 1,
        "status": 0,
        "doorStatus": 1,
        "elevatorNo": "2",
        "createdAt": "2022-03-02T21:56:15.349Z",
        "updatedAt": "2022-03-02T21:56:17.253Z"
    }, CleanupRecordKeys.Dates);
    let e = await getElevator(buildingName, elevatorNo);
    e = cleanupRecords(e.toJSON(), CleanupRecordKeys.Dates);
    console.log("expected, actual: ", expectedElevator, e);
    expect(e).toStrictEqual(expectedElevator);
});


test("createElevator", async () => {
    const buildingName = "DataDyne";
    const elevatorNo = "4";

    const expectedElevator = cleanupRecords({ "id": "", "buildingId": 1, "status": 0, "doorStatus": 1, "elevatorNo": "4", "createdAt": "", "updatedAt": "" });
    await createElevator(buildingName, elevatorNo);

    const e = await getElevator(buildingName, elevatorNo);
    const elevatorObj = cleanupRecords(e.toJSON());
    console.log("expected, actual: ", expectedElevator, elevatorObj);
    expect(elevatorObj).toStrictEqual(expectedElevator);
    // delete elevator after
    await e.destroy();
});


test("createFloor", async () => {
    const buildingName = "DataDyne";
    const floorNo = 102;

    const expectedFloor = cleanupRecords({ "id": "", "floorNo": 102, "buildingId": 1, "createdAt": "", "updatedAt": "" });
    await createFloor(buildingName, floorNo);

    const f = await getFloor(buildingName, floorNo);
    const floorObj = cleanupRecords(f.toJSON());
    console.log("expected, actual: ", expectedFloor, floorObj);
    expect(floorObj).toStrictEqual(expectedFloor);
    // delete after
    await f.destroy();
});



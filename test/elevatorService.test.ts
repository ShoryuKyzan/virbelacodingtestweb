import { getElevator, getFloor } from "../src/buildingService";
import { openDoor, closeDoor, createElevator, createFloor, goToFloor } from "../src/elevatorService";
import { DoorStatus, Floor, sequelize } from "../src/model";
import { CleanupForceInsertKeys, CleanupRecordKeys, cleanupRecords } from "./utils";


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


test("goToFloor", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const buildingName = "DataDyne";
    const elevatorNo = "2";
    const floorNo = 55;
    const expectedLogs = [
        "DataDyne elevator 2 door closed",
        "DataDyne elevator 2 went to floor 55",
        "DataDyne elevator 2 door opened"
    ];

    // open elevator #2 door
    await goToFloor(buildingName, elevatorNo, floorNo);

    // record results and restore console logging
    const consoleLogs = consoleSpy.mock.calls;
    consoleSpy.mockRestore();

    console.log("actual, expected: ", consoleLogs, expectedLogs);

    expect(consoleLogs.length).toBe(3);
    expect(consoleLogs[0][0]).toContain(expectedLogs[0]);
    expect(consoleLogs[1][0]).toContain(expectedLogs[1]);
    expect(consoleLogs[2][0]).toContain(expectedLogs[2]);

    const e = await getElevator(buildingName, elevatorNo);
    const expectedFloor = (await getFloor(buildingName, floorNo)).toJSON();
    const actualFloor = (await Floor.findByPk(e.currentFloorId)).toJSON();
    console.log("expected, actual:", expectedFloor, actualFloor);
    expect(actualFloor).toStrictEqual(expectedFloor);

    // cleanup, reset door back to closed.
    await closeDoor(buildingName, elevatorNo);
    await sequelize.sync(); /// havin trouble with things not getting written/synced with other tests.
});

test("getElevator", async () => {
    const buildingName = "DataDyne";
    const elevatorNo = "2";

    const expectedElevator = cleanupRecords({
        "id": 3,
        "buildingId": 1,
        "status": 0,
        "doorStatus": 1,
        "currentFloorId": "",
        "elevatorNo": "2",
        "createdAt": "2022-03-02T21:56:15.349Z",
        "updatedAt": "2022-03-02T21:56:17.253Z"
    }, CleanupRecordKeys.Dates);
    let e = await getElevator(buildingName, elevatorNo);
    e = cleanupRecords(e.toJSON(), CleanupRecordKeys.DatesAndElevatorCurrentFloor, CleanupForceInsertKeys.ElevatorCurrentFloor);
    console.log("expected, actual: ", expectedElevator, e);
    expect(e).toStrictEqual(expectedElevator);
});


test("createElevator", async () => {
    const buildingName = "DataDyne";
    const elevatorNo = "4";

    const expectedElevator = cleanupRecords({
        id: "",
        buildingId: 1,
        status: 0,
        doorStatus: 1,
        currentFloorId: "",
        elevatorNo: "4",
        createdAt: "",
        updatedAt: "",
    });
    await createElevator(buildingName, elevatorNo);

    const e = await getElevator(buildingName, elevatorNo);
    const elevatorObj = cleanupRecords(e.toJSON(), CleanupRecordKeys.All, CleanupForceInsertKeys.ElevatorCurrentFloor);
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
    await sequelize.sync();
});



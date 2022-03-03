import { openDoor, closeDoor, getElevator } from "../src/elevatorService";
import { DoorStatus } from "../src/model";


test("openDoor", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const buildingName = "DataDyne";
    const elevatorName = "2";
    const expectedLogs = [
        "DataDyne elevator 2 door closed",
        "DataDyne elevator 2 door opened"
    ];

    // open elevator #2 door
    await closeDoor(buildingName, elevatorName);
    await openDoor(buildingName, elevatorName);

    // record results and restore console logging
    const consoleLogs = consoleSpy.mock.calls;
    consoleSpy.mockRestore();

    console.log("actual, expected: ", consoleLogs, expectedLogs);

    expect(consoleLogs.length).toBe(2);
    expect(consoleLogs[0][0]).toContain(expectedLogs[0]);
    expect(consoleLogs[1][0]).toContain(expectedLogs[1]);

    const e = await getElevator(buildingName, elevatorName);
    console.log("doorstatus open", DoorStatus.Open);
    console.log("Elevator doorstatus", e.doorStatus, e.toJSON());
    expect(e.doorStatus).toBe(DoorStatus.Open);
});

test("closeDoor", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const buildingName = "DataDyne";
    const elevatorName = "2";
    const expectedLogs = [
        "DataDyne elevator 2 door opened",
        "DataDyne elevator 2 door closed"
    ];

    // open elevator #2 door
    await openDoor(buildingName, elevatorName);
    await closeDoor(buildingName, elevatorName);

    // record results and restore console logging
    const consoleLogs = consoleSpy.mock.calls;
    consoleSpy.mockRestore();

    console.log("actual, expected: ", consoleLogs, expectedLogs);

    expect(consoleLogs.length).toBe(2);
    expect(consoleLogs[0][0]).toContain(expectedLogs[0]);
    expect(consoleLogs[1][0]).toContain(expectedLogs[1]);

    const e = await getElevator(buildingName, elevatorName);
    console.log("doorstatus closed", DoorStatus.Closed);
    console.log("Elevator doorstatus", e.doorStatus, e.toJSON());
    expect(e.doorStatus).toBe(DoorStatus.Closed);
});

import { openDoor, closeDoor, getElevator } from "../src/elevatorService";
import { DoorStatus } from "../src/model";
import { setup, teardown, filterLogs } from "./utils";
import { stdout } from "test-console";

// didn't use jest's version of this due to some issues with db init originally.
beforeAll(async () => {
    await setup();
});

afterAll(async () => {
    await teardown();
});
test("openDoor", async () => {
    const buildingName = "DataDyne";
    const elevatorName = "2";

    const startTime = Date.now();
    const output = await stdout.inspectAsync(async () => {
        // open elevator #2 door
        await closeDoor(buildingName, elevatorName);
        await openDoor(buildingName, elevatorName);
    });
    const actualLogs = filterLogs(output, startTime);
    const expectedLogs = [
        "DataDyne elevator 2 door closed",
        "DataDyne elevator 2 door opened"
    ];
    console.log("expected, actual: ", actualLogs, expectedLogs);

    expect(actualLogs).toStrictEqual(expectedLogs);



    const e = await getElevator(buildingName, elevatorName);
    console.log("doorstatus open", DoorStatus.Open);
    console.log("Elevator doorstatus", e.doorStatus, e.toJSON());
    expect(e.doorStatus).toBe(DoorStatus.Open);
});

test("closeDoor", async () => {
    const buildingName = "DataDyne";
    const elevatorName = "2";

    const startTime = Date.now();
    const output = await stdout.inspectAsync(async () => {
        // XXX why so many awaits
        // close elevator #2 door
        await openDoor(buildingName, elevatorName);
        await closeDoor(buildingName, elevatorName);
    });
    const actualLogs = filterLogs(output, startTime);
    const expectedLogs = [
        "DataDyne elevator 2 door opened",
        "DataDyne elevator 2 door closed"
    ];
    console.log("expected, actual: ", actualLogs, expectedLogs);
    expect(actualLogs).toStrictEqual(expectedLogs);


    const e = await getElevator(buildingName, elevatorName);
    console.log("doorstatus closed", DoorStatus.Closed);
    console.log("Elevator doorstatus", e.doorStatus, e.toJSON());
    expect(e.doorStatus).toBe(DoorStatus.Closed);
});

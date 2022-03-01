import { openDoor, closeDoor, getElevator } from "../src/elevatorService";
import { DoorStatus } from "../src/model";
import { setup } from "./setup"; // XXX

beforeAll(async () => {
    await setup();
});

test("openDoor", async () => {
    const buildingName = "DataDyne";
    const elevatorName = "2";
    // open elevator #2 door
    await closeDoor(buildingName, elevatorName);
    await openDoor(buildingName, elevatorName);

    const e = await getElevator(buildingName, elevatorName);
    console.log("doorstatus open", DoorStatus.Open);
    console.log("Elevator", e);
    expect(e.doorStatus).toBe(DoorStatus.Open);
});

test("closeDoor", async () => {
    const buildingName = "DataDyne";
    const elevatorName = "2";
    // close elevator #2 door
    // XXX why so many awaits
    await openDoor(buildingName, elevatorName);
    await closeDoor(buildingName, elevatorName);

    const e = await getElevator(buildingName, elevatorName);
    console.log("doorstatus closed", DoorStatus.Closed);
    console.log("Elevator", e);
    expect((await e).doorStatus).toBe(DoorStatus.Closed);
});

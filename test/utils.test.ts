import { CleanupRecordKeys, cleanupRecords } from "./utils";

test("cleanupRecords", () => {
    const output = cleanupRecords([{ "id": 1, "name": "DataDyne", "createdAt": "2022-03-03T04:16:58.062Z", "updatedAt": "2022-03-03T04:16:58.062Z" }]);
    expect(output).toStrictEqual(
        [{
            id: "",
            name: "DataDyne",
            createdAt: "",
            updatedAt: ""
        }]
    );
    const output2 = cleanupRecords([{ "id": 1, "name": "DataDyne", "createdAt": "2022-03-03T04:16:58.062Z", "updatedAt": "2022-03-03T04:16:58.062Z" }], CleanupRecordKeys.Dates);
    expect(output2).toStrictEqual(
        [{
            id: 1,
            name: "DataDyne",
            createdAt: "",
            updatedAt: ""
        }]
    );
});

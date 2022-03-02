import { cleanupRecords } from "./utils";

test("cleanupRecords", () => {
    const output = cleanupRecords(JSON.parse("[{\"id\":1,\"name\":\"DataDyne\",\"createdAt\":\"2022-03-02T03:51:07.127Z\",\"updatedAt\":\"2022-03-02T03:51:07.127Z\"}]"));
    expect(output).toStrictEqual(
        [{
            id: "",
            name: "DataDyne",
            createdAt: "",
            updatedAt: ""
        }]
    );
});
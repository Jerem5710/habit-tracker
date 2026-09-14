import pkg from "pg";

// Mock pg Pool
jest.mock("pg", () => {
    const mPool = { query: jest.fn() };
    return { Pool: jest.fn(() => mPool) };
});

beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = "test";
    process.env.TEST_DATABASE_URL = "postgres://user:pass@localhost:5432/testdb";
});

describe("db.js", () => {
    beforeEach(() => {
        jest.resetModules(); // clear cached modules
        process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/testdb";
    });

    it("creates a Pool with DATABASE_URL", () => {
        const { Pool } = jest.requireMock("pg");

        // re-import db.js after setting env
        require("../../db.js");

        expect(Pool).toHaveBeenCalledWith({
            connectionString: "postgres://user:pass@localhost:5432/testdb",
        });
    });

    it("query success returns rows", async () => {
        const pool = require("../../db.js").default;
        const mockRows = [{ id: 1, username: "jeremie" }];
        pool.query.mockResolvedValue({ rows: mockRows });

        const result = await pool.query("SELECT * FROM users");
        expect(result.rows).toEqual(mockRows);
    });

    it("query error throws", async () => {
        const pool = require("../../db.js").default;
        pool.query.mockRejectedValue(new Error("DB error"));

        await expect(pool.query("SELECT * FROM users")).rejects.toThrow("DB error");
    });
});

import { registerUser, loginUser } from "../../controllers/authController.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../db.js";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../db.js");

function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
}

describe("authController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "testsecret";
    });

    it("registerUser success", async () => {
        const req = { body: { username: "jeremie", email: "jeremie@example.com", password: "pass123" } };
        const res = mockResponse();

        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashed");
        pool.query.mockResolvedValue({ rows: [{ id: 1, username: "jeremie", email: "jeremie@example.com" }] });

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ username: "jeremie" }));
    });

    it("registerUser DB error", async () => {
        const req = { body: { username: "jeremie", email: "jeremie@example.com", password: "pass123" } };
        const res = mockResponse();

        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashed");
        pool.query.mockRejectedValue(new Error("DB fail"));

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });

    it("loginUser success", async () => {
        const req = { body: { email: "jeremie@example.com", password: "pass123" } };
        const res = mockResponse();

        pool.query.mockResolvedValue({ rows: [{ id: 1, username: "jeremie", email: "jeremie@example.com", password_hash: "hashed" }] });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("token123");

        await loginUser(req, res);

        expect(res.json).toHaveBeenCalledWith({ token: "token123" });
    });

    it("loginUser invalid email", async () => {
        const req = { body: { email: "wrong@example.com", password: "pass123" } };
        const res = mockResponse();

        pool.query.mockResolvedValue({ rows: [] });

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });

    it("loginUser invalid password", async () => {
        const req = { body: { email: "jeremie@example.com", password: "wrongpass" } };
        const res = mockResponse();

        pool.query.mockResolvedValue({ rows: [{ id: 1, username: "jeremie", email: "jeremie@example.com", password_hash: "hashed" }] });
        bcrypt.compare.mockResolvedValue(false);

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });

    it("loginUser DB error", async () => {
        const req = { body: { email: "jeremie@example.com", password: "pass123" } };
        const res = mockResponse();

        pool.query.mockRejectedValue(new Error("DB fail"));

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

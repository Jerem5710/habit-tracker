import { authenticateToken } from "../../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";

function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
}

describe("authenticateToken middleware", () => {
    const secret = "testsecret";
    const userPayload = { id: 1, username: "jeremie" };

    beforeAll(() => {
        process.env.JWT_SECRET = secret;
    });

    it("returns 401 if no token provided", () => {
        const req = { headers: {} };
        const res = mockResponse();
        const next = jest.fn();

        authenticateToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith("Access denied");
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 403 if token is invalid", () => {
        const req = { headers: { authorization: "Bearer invalidtoken" } };
        const res = mockResponse();
        const next = jest.fn();

        authenticateToken(req, res, next);
        // jwt.verify will fail → 403
        setImmediate(() => {
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.send).toHaveBeenCalledWith("Invalid token");
            expect(next).not.toHaveBeenCalled();
        });
    });

    it("calls next() and attaches user if token is valid", done => {
        const token = jwt.sign(userPayload, secret);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = mockResponse();
        const next = jest.fn(() => {
            expect(req.user).toMatchObject(userPayload);
            done();
        });

        authenticateToken(req, res, next);
    });
});

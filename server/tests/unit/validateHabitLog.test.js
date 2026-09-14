import { validateHabitLog } from "../../middleware/validateHabitLog.js";

function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
}

describe("validateHabitLog middleware", () => {
    it("POST valid → calls next()", () => {
        const req = { method: "POST", body: { habitId: 1, dateCompleted: "2026-09-13" } };
        const res = mockResponse();
        const next = jest.fn();

        validateHabitLog(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it("POST missing habitId → 400", () => {
        const req = { method: "POST", body: { dateCompleted: "2026-09-13" } };
        const res = mockResponse();
        const next = jest.fn();

        validateHabitLog(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("habitId is required");
        expect(next).not.toHaveBeenCalled();
    });

    it("POST missing dateCompleted → 400", () => {
        const req = { method: "POST", body: { habitId: 1 } };
        const res = mockResponse();
        const next = jest.fn();

        validateHabitLog(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("dateCompleted is required");
        expect(next).not.toHaveBeenCalled();
    });

    it("PUT valid → calls next()", () => {
        const req = { method: "PUT", body: { dateCompleted: "2026-09-13" } };
        const res = mockResponse();
        const next = jest.fn();

        validateHabitLog(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it("PUT missing dateCompleted → 400", () => {
        const req = { method: "PUT", body: {} };
        const res = mockResponse();
        const next = jest.fn();

        validateHabitLog(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("dateCompleted is required");
        expect(next).not.toHaveBeenCalled();
    });
});

import {
    fetchHabitLogs,
    createHabitLog,
    editHabitLog,
    removeHabitLog,
    undoHabitCompletion
} from "../../controllers/habitLogController.js";

import * as habitLogModel from "../../models/habitLogModel.js";
import { calculateStreaks } from "../../utils/streaks.js";

jest.mock("../../models/habitLogModel.js");
jest.mock("../../utils/streaks.js");

function mockResponse() {
    const res = {};
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
}

describe("habitLogController", () => {
    const userId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("fetchHabitLogs returns grouped logs with streaks", async () => {
        const req = { user: { id: userId } };
        const res = mockResponse();

        habitLogModel.getHabitLogsByUser.mockResolvedValue([
            { habit_id: 1, title: "Drink Water", description: "Stay hydrated", date_completed: "2026-09-13" },
            { habit_id: 1, title: "Drink Water", description: "Stay hydrated", date_completed: "2026-09-12" }
        ]);
        calculateStreaks.mockReturnValue({ currentStreak: 2, longestStreak: 2 });

        await fetchHabitLogs(req, res);

        expect(res.json).toHaveBeenCalledWith([
            expect.objectContaining({
                habitId: "1",
                title: "Drink Water",
                currentStreak: 2,
                longestStreak: 2
            })
        ]);
    });

    it("createHabitLog adds log and returns streaks", async () => {
        const req = { user: { id: userId }, body: { habitId: 1, dateCompleted: "2026-09-13", notes: "done" } };
        const res = mockResponse();

        habitLogModel.addHabitLog.mockResolvedValue({});
        habitLogModel.getHabitLogsByUser.mockResolvedValue([
            { habit_id: 1, title: "Drink Water", description: "Stay hydrated", date_completed: "2026-09-13" }
        ]);
        calculateStreaks.mockReturnValue({ currentStreak: 1, longestStreak: 1 });

        await createHabitLog(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            habitId: 1,
            currentStreak: 1
        }));
    });

    it("editHabitLog returns 400 if dateCompleted missing", async () => {
        const req = { user: { id: userId }, params: { id: 1 }, body: {} };
        const res = mockResponse();

        await editHabitLog(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "dateCompleted is required" });
    });

    it("removeHabitLog deletes log successfully", async () => {
        const req = { user: { id: userId }, params: { id: 1 } };
        const res = mockResponse();

        habitLogModel.deleteHabitLog.mockResolvedValue({ id: 1 });

        await removeHabitLog(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Habit log deleted successfully"
        }));
    });

    it("undoHabitCompletion undoes latest log and recalculates streaks", async () => {
        const req = { user: { id: userId }, body: { habitId: 1 } };
        const res = mockResponse();

        habitLogModel.undoLatestHabitLog.mockResolvedValue({ id: 1 });
        habitLogModel.getHabitLogsByUser.mockResolvedValue([]);
        calculateStreaks.mockReturnValue({ currentStreak: 0, longestStreak: 0 });

        await undoHabitCompletion(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            habitId: 1,
            currentStreak: 0
        }));
    });
});

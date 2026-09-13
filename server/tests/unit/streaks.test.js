import { calculateStreaks } from "../../utils/streaks.js";

function makeDateString(daysAgo = 0) {
    const d = new Date();
    d.setHours(0, 0, 0, 0); // midnight
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

describe("calculateStreaks", () => {
    it("returns 0 streaks for empty logs", () => {
        expect(calculateStreaks([])).toEqual({ currentStreak: 0, longestStreak: 0 });
    });

    it("returns streak=1 for a single log today", () => {
        const logs = [{ date_completed: makeDateString(0) }];
        expect(calculateStreaks(logs)).toEqual({ currentStreak: 1, longestStreak: 1 });
    });

    it("returns streak=2 for two consecutive days", () => {
        const logs = [
            { date_completed: makeDateString(1) }, // yesterday
            { date_completed: makeDateString(0) }  // today
        ];
        expect(calculateStreaks(logs)).toEqual({ currentStreak: 2, longestStreak: 2 });
    });

    it("resets streak if a day is missed", () => {
        const logs = [
            { date_completed: makeDateString(2) }, // two days ago
            { date_completed: makeDateString(0) }  // today
        ];
        expect(calculateStreaks(logs).currentStreak).toBe(1);
    });
});

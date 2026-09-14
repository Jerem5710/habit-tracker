import request from "supertest";
import app from "../../app.js";
import pool from "../../db.js";

describe("Integration: Auth + Habit Logs", () => {
    beforeAll(async () => {
        // Clear test tables (use a test DB!)
        await pool.query("DELETE FROM users");
        await pool.query("DELETE FROM habit_logs");
    });

    let token;
    // let habitId = 1; // assume a habit exists in DB

    it("registers a new user", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ username: "jeremie", email: "jeremie@example.com", password: "pass123" });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
    });

    it("logs in and receives JWT", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "jeremie@example.com", password: "pass123" });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        token = res.body.token;
    });

    it("fails login with wrong password", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "jeremie@example.com", password: "wrongpass" });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error", "Invalid credentials");
    });

    it("fails login with unknown email", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "notfound@example.com", password: "pass123" });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error", "Invalid credentials");
    });

    // Create a habit for this user
    let habitId;

    it("creates a habit", async () => {
        const habitRes = await request(app)
            .post("/habits")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Drink Water",
                description: "8 glasses daily",
                frequency: "daily"
            });
        
        console.log("Habit creation response:", habitRes.body);

        expect(habitRes.status).toBe(201);
        habitId = habitRes.body.id; // capture habitId for later tests
    });

    it("creates a habit log", async () => {
        const res = await request(app)
            .post("/habit-logs")
            .set("Authorization", `Bearer ${token}`)
            .send({ habitId, dateCompleted: "2026-09-13", notes: "done" });
        
        console.log("Habit log creation response:", res.body);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("currentStreak");
    });

    it("fetches habit logs with streaks", async () => {
        const res = await request(app)
            .get("/habit-logs")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty("habitId");
        expect(res.body[0]).toHaveProperty("currentStreak");
    });

    it("undoes the latest habit log", async () => {
        // First create a habit log - this is creating a second log for the same habit
        /*const createRes = await request(app)
            .post("/habit-logs")
            .set("Authorization", `Bearer ${token}`)
            .send({ habitId, dateCompleted: "2026-09-13", notes: "done" });
        
        console.log("Habit log created for undo:", createRes.body);

        expect(createRes.status).toBe(201); */

        // Now undo that habit log
        const undoRes = await request(app)
            .delete("/habit-logs/undo")
            .set("Authorization", `Bearer ${token}`)
            .send({ habitId });
        
        console.log("Undo response:", undoRes.body);

        expect(undoRes.status).toBe(200);
        expect(undoRes.body.logs.length).toBe(0); // no logs left
        expect(undoRes.body).toHaveProperty("currentStreak");
    });

    it("fails to undo when no logs exist", async () => {
        const undoRes = await request(app)
            .delete("/habit-logs/undo")
            .set("Authorization", `Bearer ${token}`)
            .send({ habitId });

        expect(undoRes.status).toBe(404);
        expect(undoRes.body).toHaveProperty("error", "No habit log found to undo");
    });

    afterAll(async () => {
        await pool.end();
    });
});

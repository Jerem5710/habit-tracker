# Habit Tracker (PERN Stack)

A full‑stack habit tracking app built with **Postgres, Express, React, Node.js**.  
Features include authentication, habit creation, streak calculation, undo functionality, and profile picture support.

## 🚀 Features
- User registration & login with JWT authentication
- Profile picture upload/reset
- Habit creation with frequency & description
- Habit logs with streak calculation (current & longest streaks)
- Undo functionality for completed habits
- Toast notifications for feedback

## 🛠 Tech Stack
- **Frontend:** React, React Router, Context API
- **Backend:** Node.js, Express, JWT, Multer
- **Database:** PostgreSQL
- **Testing:** Jest, Supertest

## ⚙️ Setup
1. Clone the repo
2. Install dependencies:
   ```bash
   yarn install

# Create .env and .env.test files
- DATABASE_URL=postgres://postgres:postgres@localhost:5432/habit_tracker
- TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/habit_tracker_test
- JWT_SECRET=your_secret_here

## Start the dev server
1. Start dev
   ```bash
   yarn dev

## Run tests
1. Run test
   ```bash
   yarn test

---

## 📊 Progress Bar Implementation Plan

- **Frontend‑only quick win (minimal changes):**
  - Add a `<ProgressBar>` component below the streak count.
  - Calculate percentage as `(currentStreak / longestStreak) * 100`.
  - Animate the bar filling with green as streak grows.
  - Show a celebratory message when bar reaches 100%.

- **Full goal‑tracking (requires backend changes):**
  - Add a `goal` column to the `habits` table (e.g. target streak length or total completions).
  - Update API responses to include `goal` and `progress`.
  - Frontend progress bar uses `(completedDays / goal) * 100`.
  - When progress hits 100%, display “🎉 Goal completed!”

---

## ⚖️ Recommendation
For now, implement the **simple streak‑based progress bar** (frontend only). It’s quick, requires no backend changes, and gives users immediate feedback. Later, extend the backend with a `goal` column for full goal tracking.

---

###  Run migrations
Make sure your Postgres databases (`habit_tracker` and `habit_tracker_test`) exist.  
Then run the schema file to create tables:
    ```bash
    psql -U postgres -d habit_tracker -f schema.sql
    psql -U postgres -d habit_tracker_test -f schema.sql

---

### Seed the database (optional)
To quickly test the app without registering manually, run the seed file:
    ```bash
    psql -U postgres -d habit_tracker -f seed.sql

### Login with demo user
- You can log in with the following credentials:

Email: demo@example.com
Password: password123

---

## 📄 Reminder about `seed.sql`
- The `password_hash` in `seed.sql` is already set to match `"password123"` using bcrypt.  
- That means you can log in immediately with the demo credentials after seeding.  
- For the test DB, you don’t need to seed — tests wipe and re‑create data automatically.

---

## Resetting the test database
- The test database (habit_tracker_test) is automatically wiped during test runs.
If you ever need to reset it manually (for example, if schema changes break tests), simply re‑run:
    ```bash
    psql -U postgres -d habit_tracker_test -f schema.sql

- This ensures the test DB schema matches the dev DB schema before running yarn test

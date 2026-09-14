-- seed.sql
-- Insert a default user and habit for quick testing

-- Insert a user (password = "password123")
INSERT INTO users (username, email, password_hash, profile_pic_url)
VALUES (
  'demo_user',
  'demo@example.com',
  '$2b$10$N9qo8uLOickgx2ZMRZo5i.Ul8a7cQfHcG5vZ4lYhQ.Ej6x5l9YyGa',
  'https://via.placeholder.com/150'
);

-- Insert a habit for that user
INSERT INTO habits (user_id, title, description, frequency, goal)
VALUES (1, 'Drink Water', '8 glasses daily', 'daily', 7);

-- Insert a habit log (marking one day complete)
INSERT INTO habit_logs (habit_id, date_completed, notes)
VALUES (1, CURRENT_DATE, 'First day done');

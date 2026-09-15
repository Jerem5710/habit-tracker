import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useToast } from "../context/ToastContext.jsx"; // import the custom hook
import PageWrapper from "../components/PageWrapper";
import Modal from "../components/Modal";
import ProgressBar from "../components/ProgressBar";
import LoadingScreen from "../components/LoadingScreen"; // optional loading screen component
// import Toast from "../components/Toast";
import "../styles/Dashboard.css";
import "../styles/Modal.css";
import "../styles/Toast.css";

import habitLogo from "../assets/habit-tracker.png";
import addIcon from "../assets/add.svg";
import editIcon from "../assets/edit.svg";
import deleteIcon from "../assets/delete.svg";
import completeIcon from "../assets/complete.svg";
import logoutIcon from "../assets/logout.svg";
import defaultAvatar from "../assets/profile-pic.svg";
import undoIcon from "../assets/undo.svg";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [habits, setHabits] = useState([]);
    const [newHabit, setNewHabit] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newGoal, setNewGoal] = useState("");
    const [newFrequency, setNewFrequency] = useState("daily"); // default to daily
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [loading, setLoading] = useState(true);
    // const [file, setFile] = useState(null);
    // const [toast, setToast] = useState(null);
    const [formError, setFormError] = useState(null);
    const [editFormError, setEditFormError] = useState(null);
    const showToast = useToast(); // use the custom hook to get showToast function
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserAndHabits() {
            setLoading(true); // Show loading screen while fetching
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    window.location.href = "/login";   // redirect if no token
                    return;
                }
                // Fetch current user from backend
                const userRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (userRes.status !== 200) {
                    window.location.href = "/login";
                    return;
                }
                const currentUser = await userRes.json();
                setUser(currentUser);
                // Decode JWT token directly to get user info
                //const decoded = jwtDecode(token);
                // setUser(decoded);

                // Fetch habits
                /* const habitsRes = await fetch("http://localhost:5000/habits", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (habitsRes.status === 401 || habitsRes.status === 403) {
                    // redirect if token invalid/expired
                    window.location.href = "/login";
                    return;
                }

                const habitsData = await habitsRes.json();
                setHabits(habitsData); */

                // Instead of fetching /habits directly, call your merged fetchHabits

                await fetchHabits();
            } catch (err) {
                console.error("Error fetching data:", err);
                window.location.href = "/login";   // fallback redirect
            } finally {
                setTimeout(() => setLoading(false), 500); // Hide loading screen after fetching
            }
        }
        fetchUserAndHabits();
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");   // clear JWT
        setUser(null);                      // reset user state
        setHabits([]);                      // clear habits
        showToast("Logged out successfully!", "success", 3000);
        navigate("/login");                 // redirect to login
    }

    async function handleUpload(e) {
        e.preventDefault();

        const fileInput = e.target.elements.profilePic; // reference by name
        const selectedFile = fileInput.files[0];

        if (!selectedFile) {
            showToast("Please select a file first", "error");
            return;
        }

        const formData = new FormData();
        console.log("Uploading file:", selectedFile);
        formData.append("profilePic", selectedFile);

        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/profile-pic`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData, // no content-type header; browser sets it automatically for FormData
        });

        const updatedUser = await res.json();
        setUser(updatedUser);
        showToast("Profile picture updated!", "success");
    }

    function handleProfilePicClick() {
        setModalContent({
            title: "Update Profile Picture",
            body: (
                <form onSubmit={handleUpload} className="profile-pic-form">
                    <input
                        type="file"
                        name="profilePic"
                        accept="image/*"
                        // onChange={e => setFile(e.target.files[0])}
                    />
                    <button type="submit">Upload</button>
                    <button
                        type="button"
                        onClick={async () => {
                            const token = localStorage.getItem("token");
                            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/profile-pic`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            const updatedUser = await res.json();
                            setUser(updatedUser);
                            showToast("Profile picture reset to default", "success");
                        }}
                    >
                        Reset to Default
                    </button>
                </form>
            )
        });
        setShowModal(true);
    }

    async function handleAddHabit(e) {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const payload = {
                title: newHabit,
                description: newDescription.trim() !== "" ? newDescription : undefined,
                goal: newGoal ? parseInt(newGoal, 10) : undefined,
                frequency: newFrequency  // include frequency in the payload
            };

            const res = await fetch(`${import.meta.env.VITE_API_URL}/habits`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const habit = await res.json();
            setHabits([...habits, habit]);
            setNewHabit("");
            setNewDescription("");
            setNewGoal("");
            showToast("Habit added successfully!", "success");
        } catch (err) {
            console.error("Error adding habit:", err);
            showToast("Error adding habit", "error");
        }
    }

    // Edit habit
    async function handleEditHabit(id) {
        const habitToEdit = habits.find(h => h.id === id);

        setModalContent({
            title: "Edit Habit",
            body: (
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();

                        const newTitle = e.target.elements.newTitle.value;
                        const newDescription = e.target.elements.newDescription.value;
                        const newGoal = e.target.elements.newGoal.value;
                        const newFrequency = e.target.elements.newFrequency.value;

                        if (newTitle.trim() === "") {
                            setEditFormError("Title is required");
                            return;
                        }
                        setEditFormError(null); // clear error if valid

                        try {
                            const token = localStorage.getItem("token");
                            const payload = {
                                title: newTitle,
                                goal: parseInt(newGoal, 10),
                                frequency: newFrequency // include frequency
                            };
                            if (newDescription.trim() !== "") {
                                payload.description = newDescription;
                            }
                            
                            const res = await fetch(`${import.meta.env.VITE_API_URL}/habits/${id}`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                            });

                            const updatedHabit = await res.json();
                            setHabits(habits.map(h =>
                            h.id === id
                                ? { ...h, ...updatedHabit } // merge updated fields
                                : h
                            ));
                            setShowModal(false);
                            showToast("Habit updated successfully!", "success");
                        } catch (err) {
                            console.error("Error editing habit:", err);
                            showToast("Error editing habit", "error");
                        }
                    }}
                >
                    <input
                        type="text"
                        name="newTitle"
                        defaultValue={habitToEdit?.title}
                        placeholder="New title..."
                        required
                        className="input-error"
                    />
                    <textarea
                        name="newDescription"
                        defaultValue={habitToEdit?.description || ""}
                        placeholder="New description (optional)..."
                    />
                    <input
                        type="number"
                        name="newGoal"
                        defaultValue={habitToEdit?.goal || ""}
                        placeholder="Goal (e.g. 7 days)"
                        min="1"
                        required
                    />
                    <select
                        name="newFrequency"
                        defaultValue={habitToEdit?.frequency || "daily"}
                        required
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select> 
                    {editFormError && <p className="error-message">{editFormError}</p>}
                    <div className="modal-actions">
                        <button type="submit" className="edit-save">Save</button>
                        <button type="button" className="edit-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                </form>
            )
        });
        setShowModal(true);
    }


    // Delete habit
    function handleDeleteHabit(id) {
        setModalContent({
            title: "Delete Habit",
            body: (
                <div>
                    <p>Are you sure you want to delete this habit?</p>
                    <div className="modal-actions">
                        <button
                            className="delete-confirm"
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem("token");
                                await fetch(`${import.meta.env.VITE_API_URL}/habits/${id}`, {
                                    method: "DELETE",
                                    headers: { Authorization: `Bearer ${token}` },
                                });
                                setHabits(habits.filter(h => h.id !== id));
                                setShowModal(false);
                                showToast("Habit deleted successfully!", "success");
                            } catch (err) {
                                console.error("Error deleting habit:", err);
                                showToast("Error deleting habit", "error");
                            }
                        }}
                    >
                        Yes, Delete
                    </button>
                    <button className="delete-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
               </div> 
            )
        });
        setShowModal(true);
    }

    async function fetchHabits() {
        try {
            const token = localStorage.getItem("token");

            const [habitsRes, logsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/habits`, {
                headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${import.meta.env.VITE_API_URL}/habit-logs`, {
                headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            const habitsData = await habitsRes.json();
            console.log("Habits from /habits:", habitsData);
            
            const logsData = await logsRes.json();
            console.log("Logs from /habit-logs:", logsData);

            if (habitsRes.ok && logsRes.ok) {
                const merged = habitsData.map(habit => {
                    const logInfo = logsData.find(l => parseInt(l.habitId) === habit.id);
                    return {
                        id: habit.id,
                        title: habit.title,
                        description: habit.description,
                        frequency: logInfo?.frequency ?? habit.frequency,
                        goal: habit.goal,
                        streak: logInfo?.currentStreak ?? 0,
                        longestStreak: logInfo?.longestStreak ?? 0,
                        completedCount: logInfo?.completedCount ?? 0,
                        logs: logInfo?.logs ?? []
                    };
                });
                console.log("Merged habits:", merged);
                setHabits(merged);
            } else {
                showToast("Failed to fetch habits", "error");
            }
        } catch (err) {
            console.error("Error fetching habits:", err);
            showToast("Error fetching habits", "error");
        }
    }

    // Mark habit as done (log completion)
    async function handleMarkDone(id) {
        try {
            const token = localStorage.getItem("token");

            const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

            const res = await fetch(`${import.meta.env.VITE_API_URL}/habit-logs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ habitId: id, dateCompleted: today }),
            });
            const log = await res.json();
            if (res.ok) {
                showToast("Habit marked as complete!", "success");
                // Instead of local math, refresh habits
                fetchHabits();
            }
        } catch (err) {
            console.error("Error marking habit done:", err);
            showToast("Error marking habit done", "error");
        }
    }

    async function handleUndo(id) {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/habit-logs/undo`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ habitId: id }),
            });

            const data = await res.json();
            if (res.ok) {
                showToast("Habit completion undone!", "success");
                // Use streaks from backend or refresh habits
                fetchHabits();
            } else {
                showToast(data.error || "Failed to undo", "error");
            }
        } catch (err) {
            console.error("Error undoing habit:", err);
            showToast("Error undoing habit", "error");
        }
    }

    return (
        <PageWrapper>
            {loading ? (
                <LoadingScreen message="Loading your dashboard..." />
            ) : user ? (
                <div className="dashboard">
                    <div className="app-logo">
                        <img src={habitLogo} alt="Habit Tracker Logo" className="logo-img" />
                        <h1 className="logo-text">Habit Tracker</h1>
                    </div>
                {/* Logout button */}
                <div className="logout-container">
                        <button className="logout-button" onClick={handleLogout}>
                            <img src={logoutIcon} alt="Logout" className="icon white-icon" />
                            <span>Logout</span>
                    </button>
                    </div>

                    <div className="profile-container">
                        <div className="profile-pic-wrapper">
                    <img
                        src={user?.profile_pic_url
                            ? `${import.meta.env.VITE_API_URL}${user.profile_pic_url}`
                            : defaultAvatar}
                        alt="Profile"
                        className="profile-pic clickable"
                            onClick={handleProfilePicClick}
                    />
                    </div>
                    {/* Welcome message */}
                    <h2>{user ? `Welcome, ${user.username}!` : "Welcome!"}</h2>
                    </div>
                <div className="divider"></div>

            {habits.length === 0 && (
                <p className="empty-message">No habits yet? Create one below:</p>
                )}

                {/* Habit creation form */}    
            <form onSubmit={handleAddHabit} className="habit-form">
                <input
                    type="text"
                    placeholder="New habit..."
                    value={newHabit}
                    onChange={e => setNewHabit(e.target.value)}
                    className={formError ? "input-error" : ""}
                    required
                        />
                        <textarea
                            placeholder="Habit description (optional)..."
                            value={newDescription}
                            onChange={e => setNewDescription(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Goal (e.g. 7 days)"
                            value={newGoal}
                            onChange={e => setNewGoal(e.target.value)}
                            min="1"
                            required
                            />
                            <select
                                value={newFrequency}
                                onChange={e => setNewFrequency(e.target.value)}
                                required
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        {formError && <p className="error-message">{formError}</p>}
                        <button type="submit"><img src={addIcon} alt="Add" className="icon white-icon" /><span>Add Habit</span></button>
            </form>

                {/* Habit list with actions */}
                <ul className="habit-list">
                    {habits.map(habit => (
                        <li key={habit.id} className="habit-item">
                            <span className="habit-name">{habit.title}</span>
                            {habit.description && <p className="habit-description">{habit.description}</p>}
                            <p className="habit-frequency">Frequency: {habit.frequency || "—"}</p>
                            <p className="habit-goal">Goal: {habit.goal || "—"} days</p>
                            <div className="divider"></div>
                            <div className="habit-actions">
                                <button onClick={() => handleEditHabit(habit.id)}><img src={editIcon} alt="Edit" className="icon white-icon" /><span>Edit</span></button>
                                <button onClick={() => handleDeleteHabit(habit.id)}><img src={deleteIcon} alt="Delete" className="icon white-icon" /><span>Delete</span></button>
                                <button onClick={() => handleMarkDone(habit.id)}><img src={completeIcon} alt="Complete" className="icon white-icon" /><span>Mark Done</span></button>
                                <button onClick={() => handleUndo(habit.id)}>
                                    <img src={undoIcon} alt="Undo" className="icon white-icon" />
                                    <span>Undo</span>
                                </button>
                            </div>
                            <span className="habit-streak">Streak: {habit.streak || 0} days</span>

                            {/* Progress bar with label and percentage*/}
                            <div className="progress-section">
                                <p className="progress-label">
                                Progress toward goal:{habit.completedCount} of {habit.goal} days (
                                    {habit.goal /*&& habit.completedCount !== undefined*/
                                    ? `${Math.min(
                                        Math.round((habit.completedCount / habit.goal) * 100),
                                        100
                                    )}%`
                                        : "0%"}
                                )
                            </p>
                            <ProgressBar
                                progress={
                                        habit.goal && typeof habit.completedCount === "number" /*&& habit.completedCount !== undefined*/
                                        ? Math.min((habit.completedCount / habit.goal) * 100, 100)
                                        : 0
                                }
                                />
                            </div>
                        </li>
                    ))}
                </ul> 
            
            </div>
            ) : null}

            {showModal && (
                <Modal show={showModal} title={modalContent?.title} onClose={() => setShowModal(false)}>
                    {modalContent?.body}
                </Modal>
            )}

        </PageWrapper>
    );
}

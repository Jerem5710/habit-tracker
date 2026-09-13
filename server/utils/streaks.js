export function calculateStreaks(logs) {
    if (!logs || logs.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    // Normalize to YYYY-MM-DD and remove duplicates
    const uniqueDates = Array.from(
        new Set(logs.map(log => new Date(log.date_completed).toISOString().split("T")[0]))
    ).sort((a, b) => new Date(a) - new Date(b));

    let longest = 1;
    let current = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);

        const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            current++;
            longest = Math.max(longest, current);
        } else {
            current = 1; // reset streak
        }
    }

    // Check if last log was yesterday or today → current streak valid
    const lastLogDate = new Date(uniqueDates[uniqueDates.length - 1]);
    const today = new Date();
    const diffFromToday = (today - lastLogDate) / (1000 * 60 * 60 * 24);

    // If last log was today → streak valid
    if (diffFromToday === 0) {
        // keep current as is
    } else if (diffFromToday === 1) {
        // yesterday still counts
    } else {
        // missed more than a day → streak broken
        current = 0;
    }

    // Ensure at least 1 if there are logs
    if (uniqueDates.length > 0 && current === 0) {
        current = 1;
    }
    return { currentStreak: current, longestStreak: longest };
}

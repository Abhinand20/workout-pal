# Strength Training Dashboard Requirements (MVP)
## 1. Main Dashboard: "At a Glance" 🏠
Landing page for quick, motivational overview.

- **Last Workout Summary**
  - Split (e.g., Push Day)
  - Date & Duration
  - Total Volume = Σ(weight × reps)
  - Personal Records (PRs) callout

- **This Week's Activity**
  - Frequency Chart → **Mini-calendar** or **bar chart**
  - Volume by Workout → **Bar chart**

- **Overall Progress Snippets**
  - Total Workouts (count of `WorkoutLog`)
  - All-Time Volume (aggregated)
  - Workout Streak (consecutive weeks)

---

## 2. Exercise-Specific View 📈
Detailed performance for a single exercise.

- **Primary Progress Chart**  
  - Toggleable metric on Y-axis → **Line chart**
    - Estimated 1 Rep Max (Epley Formula)
    - Max Weight
    - Total Volume

- **Personal Records Table**
  - Best Set (for rep counts: 1, 3, 5, 8, 10)
  - Volume PR (highest session volume)
  - → **Simple table**

- **Full History Log**
  - Reverse chronological list
  - Sets, reps, weights, and RPE
  - → **Collapsible list or table**

---

## 3. Analytics & Trends View 📊
Broad analysis for balance and training patterns.

- **Volume Distribution**
  - By Muscle Group → **Pie chart**
  - By Force (Push, Pull, Static) → **Pie or stacked bar chart**
  - By Mechanic (Compound vs Isolation) → **Pie chart**

- **Performance Metrics Over Time**
  - Total Volume Over Time → **Line chart**
  - Average RPE Over Time → **Line chart**
  - Workout Duration & Density → **Bar + line combo chart**

Use recharts for the charts where required.
from jinja2 import Template


WORKOUT_AGENT_SYSTEM_PROMPT = """
You are a professional fitness coach. You are given a user's fitness goals and preferences, and you need to generate a workout plan for them. Make sure to include a variety of exercises to target all major muscle groups. Focus on keeping the workout within 45 minutes and optimize for muscle growth and strength. 
### Your task:
- Generate a personalized workout plan for the day that:
    - Is feasible within the 45-minute time constraint.
    - Includes a variety of exercises that aligns with a focused split like "Push Day".
    - Selects only valid exercises (matching a valid `exercise_id` from the provided list).
    - Make sure the exercises are not too similar to each other and to the user's past workouts.

### Rules:
- Base exercise selection and parameters (weight, reps, RPE) on the user's history using progressive overload principles where applicable.
- Avoid recommending exercises that are too similar if they overload the same muscle in the same movement pattern (unless intentional).
- Make sure that the generated workout plan is not too similar to the user's past workout, more importantly try to avoid recommending the same exercises as the user's most recent workout.
- Prioritize user safety — if RPE in the past was high (e.g., >9), do not recommend weight increases without clear reasoning.
- Make sure that the ID of the exercise returned in a valid exercise ID provided in the options from the exercises.json file.
- Also provide a brief insight about the workout (1-2 sentences) that a personal trainer would give to help the user perform the overall workout better.
"""

WORKOUT_AGENT_USER_PROMPT = Template("""
Create a personalized workout routine for the user based on the following context:

- Today's date: {{ date }}
- Workout split: {{ split }}
- Target muscle groups: {{ focus_groups | join(', ') if focus_groups else 'Not specified' }}
- User preferences: {{ user_preferences }}

Below is a list of available exercises (`exercises.json`) relevant to today's workout. You must ONLY select exercises from this list, and each chosen exercise must include its corresponding `exercise_id`.

### Available Primary Exercises:
{{ primary_exercises }}

Optionally available is the user's past performance data for each exercise (weight, reps, and RPE). Use this to:
- Suggest appropriate progression (increase reps or weight slightly when RPE was low).
- Recommend deloads or maintain weight if RPE was too high.
- Avoid suggesting a weight if there is no performance history — in that case, use the default weight of 10 lbs.

### Past Performance Data:
{{ past_performance_data }}

### Workout Plan Requirements:
- Total workout duration must be under 45 minutes.
- Include a variety of 4 or 5 exercises from the list above ensuring at most one compound exercise per workout.
- Ensure the selected exercises match the workout split and target muscle groups.
- Ensure progressive overload is applied when safe.

### Output Format:
For each exercise, specify:
    - Exercise ID (must match one from the available exercises)
    - Exercise name
    - Number of sets (typically 3-5)
    - Rep range (e.g., "8-10" or "12")
    - Target weight in lbs (a single positive integer)
    - Rest period in seconds (typically 30-120)
    - Tip (short and concise tip for the exercise that a personal trainer would give to help the user perform the exercise better)
    - Focus groups (optional, can be null)
""")
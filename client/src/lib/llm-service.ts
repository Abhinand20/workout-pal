import { WorkoutSplit } from '@/types/api';
import { WorkoutRoutine, Exercise, LoggedExercise } from '@/types';
import { 
  ExerciseDB, 
  GenerateWorkoutParams, 
  LLMWorkoutResponse 
} from '@/types/database';

// Google Gemini integration
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { WORKOUT_AGENT_SYSTEM_PROMPT, WORKOUT_USER_PROMPT_BUILDER } from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function generateWorkout(params: GenerateWorkoutParams): Promise<WorkoutRoutine> {
  const {
    userPreferences,
    userWorkoutHistory,
    split,
    stretchingExercises,
    primaryExercises
  } = params;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: WORKOUT_AGENT_SYSTEM_PROMPT,
      generationConfig: {
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            ai_insight: { type: SchemaType.STRING },
            routine: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: {
              id: { type: SchemaType.STRING },
              name: { type: SchemaType.STRING },
              target_sets: { type: SchemaType.NUMBER },
              target_reps: { type: SchemaType.STRING },
              target_weight_lbs: { type: SchemaType.NUMBER },
              rest_period_seconds: { type: SchemaType.NUMBER },
              tip: { type: SchemaType.STRING },
              focus_groups: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            } } }
          },
          required: ["ai_insight", "routine"]
        }
      }
    });

    // Build the prompt
    const prompt = buildWorkoutPrompt(
      userPreferences,
      userWorkoutHistory,
      split,
      stretchingExercises,
      primaryExercises
    );
    console.log("Generating workout with Gemini model for split: ", split);
    console.log("Prompt: ", prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const workoutData = parseWorkoutResponse(text);
    console.log("Workout data: ", workoutData);
    return {
      id: '', // Will be set by the API handler
      date: new Date().toISOString().split('T')[0],
      ai_insight: workoutData.ai_insight,
      routine: workoutData.routine
    };
  } catch (error) {
    console.error('Error generating workout with Gemini:', error);
    throw new Error(`Failed to generate workout: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function inferFocusGroups(split: WorkoutSplit): string[] {
  if (split === WorkoutSplit.FULL_BODY) {
    return ["Full Body"];
  }
  if (split === WorkoutSplit.PUSH) {
    return ["Chest", "Triceps"];
  }
  if (split === WorkoutSplit.PULL) {
    return ["Back", "Biceps", "Forearms"];
  }
  if (split === WorkoutSplit.LEGS) {
    return ["Legs", "Shoulders"];
  }
  return [];
}

function buildWorkoutPrompt(
  userPreferences: string,
  userWorkoutHistory: LoggedExercise[] | null,
  split: WorkoutSplit,
  stretchingExercises: ExerciseDB[],
  primaryExercises: ExerciseDB[]
): string {
  const historyContext = userWorkoutHistory 
    ? `Previous workout history for ${split} split:\n${JSON.stringify(userWorkoutHistory, null, 2)}\n\n`
    : `No previous workout history available for ${split} split.\n\n`;

  return WORKOUT_USER_PROMPT_BUILDER({
    date: new Date().toISOString().split('T')[0],
    split,
    focusGroups: inferFocusGroups(split),
    userPreferences,
    primaryExercises: primaryExercises.map(e => e.name).join(', '),
    pastPerformanceData: historyContext
  });
}

function parseWorkoutResponse(text: string): LLMWorkoutResponse {
  try {
    // Clean the response text
    let cleanText = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsed = JSON.parse(cleanText);
    
    // Validate required fields
    if (!parsed.ai_insight || !parsed.routine || !Array.isArray(parsed.routine)) {
      throw new Error('Invalid workout response structure');
    }

    // Validate each exercise in the routine
    for (const exercise of parsed.routine) {
      if (!exercise.id || !exercise.name || !exercise.target_sets || !exercise.target_reps) {
        throw new Error(`Invalid exercise structure: ${JSON.stringify(exercise)}`);
      }
    }

    return parsed;
  } catch (error) {
    console.error('Error parsing workout response:', error);
    console.error('Raw response:', text);
    
    // Fallback: create a basic workout if parsing fails
    return {
      ai_insight: "Generated a basic workout routine due to parsing issues. Please try regenerating for a more personalized plan.",
      routine: [
        {
          id: "basic_warmup",
          name: "Dynamic Warm-up",
          target_sets: 1,
          target_reps: "5-10",
          target_weight_lbs: null,
          rest_period_seconds: 30,
          tip: "Prepare your body for the workout ahead",
          focus_groups: ["full body"]
        }
      ]
    };
  }
}
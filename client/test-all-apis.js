// Comprehensive test script for all migrated APIs
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 'test-user-123';

async function testAPI(endpoint, options = {}, description = '') {
  console.log(`\n🧪 Testing: ${description || endpoint}`);
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success}`);
    
    if (data.success) {
      console.log(`   ✅ ${description || endpoint} - SUCCESS`);
      return { success: true, data: data.data };
    } else {
      console.log(`   ❌ API Error: ${data.error?.message || 'Unknown error'}`);
      console.log(`   Error Code: ${data.error?.code || 'N/A'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllAPITests() {
  console.log('🚀 Starting comprehensive API migration tests...\n');
  
  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 0: Clear cached workouts to start fresh
  console.log('=' .repeat(60));
  console.log('🧹 CLEARING CACHED WORKOUTS FOR CLEAN TEST');
  console.log('=' .repeat(60));
  
  const clearCacheTest = await testAPI(
    '/api/workout/clear-cache',
    { method: 'DELETE' },
    'Clear cached workout routines'
  );
  testResults.total++;
  if (clearCacheTest.success) {
    testResults.passed++;
    console.log('   ✅ Cache cleared successfully');
  } else {
    testResults.failed++;
    console.log('   ⚠️ Cache clear failed, but continuing with tests...');
  }

  // Test 1: Workout Today API
  console.log('=' .repeat(60));
  console.log('📋 TESTING WORKOUT TODAY API');
  console.log('=' .repeat(60));
  
  const workoutTest = await testAPI(
    `/api/workout/today?user_id=${TEST_USER_ID}&split=PUSH`,
    { method: 'GET' },
    'Fetch today\'s workout routine'
  );
  testResults.total++;
  if (workoutTest.success) {
    testResults.passed++;
    console.log(`   📝 Generated workout ID: ${workoutTest.data.workout?.id}`);
    console.log(`   💪 Exercise count: ${workoutTest.data.workout?.routine?.length}`);
    
    // Test cached workout retrieval
    console.log('\n🔄 Testing cached workout retrieval...');
    const cachedWorkoutTest = await testAPI(
      `/api/workout/today?user_id=${TEST_USER_ID}&split=PUSH`,
      { method: 'GET' },
      'Fetch cached workout routine'
    );
    testResults.total++;
    if (cachedWorkoutTest.success && cachedWorkoutTest.data.workout?.id === workoutTest.data.workout?.id) {
      testResults.passed++;
      console.log('   ✅ Cached workout retrieved successfully with same ID');
    } else {
      testResults.failed++;
      console.log('   ❌ Cached workout test failed');
    }
  } else {
    testResults.failed++;
  }

  // Test 2: Active Workout Session APIs
  console.log('\n' + '=' .repeat(60));
  console.log('🏃 TESTING ACTIVE WORKOUT SESSION APIs');
  console.log('=' .repeat(60));
  
  // Mock active workout session data
  const mockActiveWorkout = {
    workout_id: 'test-workout-123',
    startTime: Date.now(),
    currentSessionStartTime: Date.now(),
    totalActiveDuration_ms: 0,
    isPaused: false,
    routine: {
      id: 'test-routine-123',
      date: '2025-01-27',
      routine: [
        {
          id: 'exercise-1',
          name: 'Push-ups',
          target_sets: 3,
          target_reps: '10-15',
          target_weight_lbs: null,
          rest_period_seconds: 60
        }
      ]
    },
    currentExerciseIndex: 0,
    loggedData: [],
    split: 'PUSH'
  };

  // Create active workout session
  const createSessionTest = await testAPI(
    '/api/workout/active',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        activeWorkoutSession: mockActiveWorkout
      })
    },
    'Create active workout session'
  );
  testResults.total++;
  
  let sessionId = null;
  if (createSessionTest.success) {
    testResults.passed++;
    sessionId = createSessionTest.data.active_workout_session_id;
    console.log(`   🆔 Created session ID: ${sessionId}`);
  } else {
    testResults.failed++;
  }

  if (sessionId) {
    // Get active workout session
    const getSessionTest = await testAPI(
      `/api/workout/active?active_workout_session_id=${sessionId}`,
      { method: 'GET' },
      'Get active workout session'
    );
    testResults.total++;
    testResults[getSessionTest.success ? 'passed' : 'failed']++;

    // Update active workout session
    const updatedWorkout = { ...mockActiveWorkout, totalActiveDuration_ms: 30000 };
    const updateSessionTest = await testAPI(
      '/api/workout/active',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active_workout_session_id: sessionId,
          activeWorkoutSession: updatedWorkout
        })
      },
      'Update active workout session'
    );
    testResults.total++;
    testResults[updateSessionTest.success ? 'passed' : 'failed']++;

    // Delete active workout session
    const deleteSessionTest = await testAPI(
      `/api/workout/active?active_workout_session_id=${sessionId}`,
      { method: 'DELETE' },
      'Delete active workout session'
    );
    testResults.total++;
    testResults[deleteSessionTest.success ? 'passed' : 'failed']++;
  }

  // Test 3: Workout Logging API
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TESTING WORKOUT LOGGING API');
  console.log('=' .repeat(60));
  
  const mockLogData = {
    userId: TEST_USER_ID,
    workoutRoutineId: 'test-routine-123',
    split: 'PUSH',
    startTime: Date.now() - 3600000, // 1 hour ago
    endTime: Date.now(),
    totalDurationSeconds: 3600,
    notes: 'Great workout session!',
    loggedExercises: [
      {
        exercise_id: 'exercise-1',
        name: 'Push-ups',
        sets: [
          {
            set_number: 1,
            weight_lbs: 0,
            reps: 15,
            rpe: 8,
            elapsedTime_ms: 45000,
            status: 'completed'
          },
          {
            set_number: 2,
            weight_lbs: 0,
            reps: 12,
            rpe: 9,
            elapsedTime_ms: 50000,
            status: 'completed'
          }
        ],
        elapsedTime_ms: 300000,
        status: 'completed',
        activeWorkTime_ms: 95000
      }
    ]
  };

  const logWorkoutTest = await testAPI(
    '/api/workout/log',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockLogData)
    },
    'Log workout data'
  );
  testResults.total++;
  if (logWorkoutTest.success) {
    testResults.passed++;
    console.log(`   📋 Logged workout ID: ${logWorkoutTest.data.loggedWorkoutId}`);
  } else {
    testResults.failed++;
  }

  // Test 4: Exercise Editing API
  console.log('\n' + '=' .repeat(60));
  console.log('✏️  TESTING EXERCISE EDITING API');
  console.log('=' .repeat(60));
  
  const editExerciseTest = await testAPI(
    '/api/workout/edit-exercise',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workoutId: 'test-workout-123',
        exerciseIdToReplace: 'exercise-1',
        userPrompt: 'Make this exercise more challenging'
      })
    },
    'Edit exercise in workout'
  );
  testResults.total++;
  if (editExerciseTest.success) {
    testResults.passed++;
    console.log(`   🔧 New exercise: ${editExerciseTest.data.newExercise.name}`);
  } else {
    testResults.failed++;
  }

  // Test Results Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📈 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! API migration successful! 🚀');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    console.log('\n💡 Common issues:');
    console.log('   1. Make sure Next.js dev server is running: npm run dev');
    console.log('   2. Verify GOOGLE_GEMINI_API_KEY is set in .env');
    console.log('   3. Check database connection (DATABASE_URL)');
    console.log('   4. Ensure database tables exist and are accessible');
  }

  return testResults;
}

if (require.main === module) {
  runAllAPITests().catch(console.error);
}

module.exports = { runAllAPITests };
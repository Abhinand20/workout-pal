### [Frontend] Basic functionality remaining work items ordered by priority

- Display total workout time at the end of the workout - create a new component which displays the total workout time and informs the user that the workout is finished
- Implement updating the exercises in the set by adding modals for prompts to LLM
- Strict Auth to restrict access before deploying to production
- Allow modifying set metadata while timer is running/after timer is finished

- (DONE) Implement the "Finish Workout" button to save the workout and end the session
- (DONE) Calculate and store total workout time in the workout state
- (DONE) Concretely define the APIs for the back end retrieve and store the workout data

### Nice to have features

- Add the workout history page
- Support for selecting the split of the workout
- Support creating and storing user preferences (e.g. workout split, think about other preferences)
- Make the pages more pretty and user friendly
- Add support for sequencing the exercises in the workout
- Make UI for warmup and stretching exercises better.


### [Backend] Basic functionality remaining work items ordered by priority

- (BASIC DONE) Concretely define the APIs and Database schema for the workout data
- Implement the API endpoints for generating the workout data, storing the workout data, retrieving the workout history and editing/updating the generated workout routine

### [Backend] Brainstorming

- Each exercise log will also be structured properly to see historical trends
- Need to update the frontend to cleanly display exercise info
- Energy/time-aware scaling: quick mode or low-energy day variant
- Support multiple training phases (e.g. strength block vs cut)
- Sync wearable data (like HR, steps, sleep)
- (OBSOLETE) Create a vector database of set exercises (rich info such as images, instructions etc.) and set it as a tool for the LLM to use to generate the workout routine

### [Deployment]

- Containerize the backend and deploy it to the cloud
- Deploy the frontend to Vercel


### TODOs:

- (DONE) Fix inconsistencies in the BE/FE data model (lbs vs kg)
- (DONE) Cleanup data before storing it in the database (eg. skip PENDING sets)
- Pre-fill the set metadata for the user
- Update backend logic to query historical workouts data.

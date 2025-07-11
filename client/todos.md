### [Frontend] Basic functionality remaining work items ordered by priority

- (DONE) Strict Auth to restrict access before deploying to production
- (DONE) Multiple API calls are made to the backend for the same split. Is it because of dev runs? Fix this later.
- Display total workout time at the end of the workout - create a new component which displays the total workout time and informs the user that the workout is finished
- Implement updating the exercises in the set by adding modals for prompts to LLM

- (DONE) Implement the "Finish Workout" button to save the workout and end the session
- (DONE) Calculate and store total workout time in the workout state
- (DONE) Concretely define the APIs for the back end retrieve and store the workout data
- (DONE) Allow modifying set metadata while timer is running/after timer is finished

### Refactoring to enable multiple users and move towards MVP production app

- (DONE) Move from a SPA to page-based routing 
- (DONE) Add a landing page to prompt users to sign up/login
- (DONE) Move away from local storage to storing user data in the backend database (implement APIs, update fetching logic etc.)

### Nice to have features

- Add the workout history page
- Support creating and storing user preferences (e.g. workout split, think about other preferences)
- Make the pages more pretty and user friendly
- Add support for sequencing the exercises in the workout


### [Backend] Basic functionality remaining work items ordered by priority

- (DONE) Concretely define the APIs and Database schema for the workout data
- (DONE) Implement the API endpoints for generating the workout data, storing the workout data, retrieving the workout history and editing/updating the generated workout routine

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


### TODOs 07-10-2025:

[x] Update backend logic to query historical workouts data for workout generation.

[ ] Lock down the app to only allow my user to use it.

[ ] Deploy the app and start using it!!

[ ] Add support for basic historical analytics.

[ ] Add support for updating individual exercises in the workout.

[ ] Vercel does not support sqlite. Need to migrate to a different database for auth. Currently, the app is relying on vercel's auth to authenticate users.

[ ] Backend database is working but if the VM is restarted, the database is lost. Might work for MVP but need a hosted/persistent database for production, move to a hosted postgres database (supabase? neon?) for a better experience.
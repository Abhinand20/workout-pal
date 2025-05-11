### [Frontend] Basic functionality remaining work items ordered by priority

- Calculate and store total workout time in the workout state
- Display total workout time at the end of the workout
- Implement the "Finish Workout" button to save the workout and end the session
- Implement updating the exercises in the set by adding modals for prompts to LLM
- Concretely define the APIs for the back end retrieve and store the workout data
- Strict Auth to restrict access before deploying to production

### Nice to have features

- Make the pages more pretty and user friendly
- Add the workout history page
- Add support for sequencing the exercises in the workout
- Include warmup and stretching exercises?
- Support for selecting the split of the workout


### [Backend] Basic functionality remaining work items ordered by priority

- Concretely define the APIs and Database schema for the workout data
- Implement the API endpoints for generating the workout data, storing the workout data, retrieving the workout history and editing/updating the generated workout routine

### [Backend] Brainstorming

- Create a vector database of set exercises (rich info such as images, instructions etc.) and set it as a tool for the LLM to use to generate the workout routine
- Each exercise log will also be structured properly to see historical trends
- Need to update the frontend to cleanly display exercise info

### [Deployment]

- Containerize the backend and deploy it to the cloud
- Deploy the frontend to Vercel
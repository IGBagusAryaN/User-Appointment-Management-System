### Technical Questions
Answer the following questions in markdown format inside the repository (answers.md):
1. Timezone Conflicts: How would you handle timezone conflicts between participants
in an appointment?

2. Database Optimization: How can you optimize database queries to efficiently fetch
user-specific appointments?

3. Additional Features: If this application were to become a real product, what
additional features would you implement? Why?

4. Session Management: How would you manage user sessions securely while keeping
them lightweight (e.g., avoiding large JWT payloads)?

### Answers
1. I handle timezone conflicts between participants by displaying an alert or toast notification whenever any participant falls outside standard working hours.
For example, a toast message saying "The following users have times outside working hours (08:00–17:00)" is shown. This helps the appointment creator adjust the time to better match the availability of all participants.

2. To optimize fetching user-specific appointment data, I apply filtering directly at the database level using the userId. For example, in the getCurrentUser function, I use findUnique with a condition like where: { id: userId } to ensure only the relevant user data is retrieved, avoiding unnecessary data processing.
Additionally, I use select to retrieve only the necessary fields such as id, name, and username, which helps reduce the response size and speeds up the data fetching process.

3. There are 4 things i want to add:
   - Secure Authentication Feature
     A login system using email and password ensures that only registered users can access the platform, enhancing security and preventing unauthorized access.
   - Meeting Room Feature (Online/Offline)
     A meeting room feature similar to Google Meet or Zoom is available. Users can choose whether the meeting is online or offline, with the interface adapting accordingly. This provides flexibility for creators to schedule meetings based on their preferences and needs.
   - Real-Time Notifications
     A notification system alerts users about meeting invitations and sends reminders shortly before a meeting begins. This feature is essential to help participants prepare and decide whether to join the meeting on time.
   - Appointment History
     Creators can view a history of their previous appointments. This feature is important as creators may need to refer back to past meetings at any time for reference or documentation purposes.

4. I store only minimal information in the JWT—typically just the user ID and username—and sign it using a secret key. To keep the payload lightweight, I avoid embedding sensitive data or excessive metadata in the token. Any additional user-related information is retrieved from the database based on the user ID contained in the token.
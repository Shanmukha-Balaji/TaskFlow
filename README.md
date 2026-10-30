# TaskFlow — To-Do List Manager with Priority Scheduling

## Included
- Responsive dashboard
- Create, edit, delete, complete tasks
- High / Medium / Low priority; order by priority then deadline
- All, Due today, Upcoming, Completed filters
- Browser Local Storage for tasks
- Optional push reminders using Express, Web Push and a Service Worker

## Requirements
Install Node.js 18+ and npm.

## Run
1. Extract the ZIP.
2. Open a terminal in `TaskFlow_Project`.
3. Run `npm install`
4. Run `npm start`
5. Open `http://localhost:3000`
6. Click **Enable reminders** and allow browser notifications.
7. Add a task with a future deadline.

The server creates VAPID keys on first start. Keep the server running and online for scheduled reminders.

## Important limitations
- Local Storage is limited to the current browser profile/device; it does not sync to other devices.
- Push reminders can arrive while the page is closed if the user subscribed, browser/OS support push, the server is running, and the device is available. A powered-off or offline device cannot receive a notification at that moment.
- This is an educational demo, not production-ready. It uses a JSON file and an in-process scheduler; production should use a database, durable job queue, authentication, HTTPS, and user-specific subscriptions.
- This demo sends reminders to every subscription on this server. Do not deploy for multiple users without per-user account/subscription ownership.
- Deleting a task does not currently cancel a server reminder; add cancellation/synchronization before production use.
- Login/authentication is not implemented.
- Do not store passwords or sensitive information in Local Storage.

## Structure
- `server.js`: Express server and push reminder scheduler
- `public/index.html`: interface
- `public/styles.css`: design
- `public/app.js`: task management, Local Storage, subscription
- `public/sw.js`: push notification handler
- `public/manifest.json`: PWA metadata

## Scheduling
High=3, Medium=2, Low=1. This starter sorts an array by descending priority, then earliest deadline. It does not implement a heap.

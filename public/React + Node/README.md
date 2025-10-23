# 🚀 21-Day React + Node (TypeScript) Roadmap

Welcome to your full-stack learning project!  
This folder already contains a working React frontend (client) and Express backend (server).  
Your goal: learn one clear concept per day until you can build and explain full-stack apps confidently.

---

## 🗓️ WEEK 1 – React Fundamentals (Frontend Only)

### ✅ Day 1 – Setup & Hello World
- [ ] Run the app:  
  ```bash
  cd client && npm install && npm run dev
  ```
* [ ] Open [http://localhost:5173](http://localhost:5173)
* [ ] Explore `App.tsx` and `Button.tsx`. Try changing text to "Hello Parsa".

### ✅ Day 2 – Components

* [ ] Create a new file `src/components/Greeting.tsx`
* [ ] Export a component that says `Hello, {name}`
* [ ] Import and render it in `App.tsx`.

### ✅ Day 3 – Props

* [ ] Pass a `name` prop to Greeting.
* [ ] Type it using an interface:

  ```ts
  interface GreetingProps { name: string }
  ```

### ✅ Day 4 – State

* [ ] Add a counter using `useState`.
* [ ] Increment on button click.

### ✅ Day 5 – Conditional Rendering

* [ ] If count > 5, show "High Score!" else show the counter.

### ✅ Day 6 – Lists & Map

* [ ] Render an array of items with `.map()`.

### ✅ Day 7 – Mini Todo App

* [ ] Build a todo list with add/remove using only `useState`.

---

## ⚙️ WEEK 2 – Node + Express Basics

### ✅ Day 8 – Server Setup

* [ ] Run the backend:

  ```bash
  cd server && npm install && npm run dev
  ```
* [ ] Open `src/server.ts` → confirm "Server running on port 5000."

### ✅ Day 9 – Create Routes

* [ ] Visit [http://localhost:5000/api/notes](http://localhost:5000/api/notes) → should return JSON list.
* [ ] Test POST & DELETE using Thunder Client or Postman.

### ✅ Day 10 – Types

* [ ] Open `src/types/Note.ts` → edit or extend your Note interface.

### ✅ Day 11 – Middleware

* [ ] Understand `express.json()` and CORS setup in `server.ts`.

### ✅ Day 12 – Error Handling

* [ ] Add a route that returns a 404 for unknown paths.

### ✅ Day 13 – CRUD Practice

* [ ] Extend `notes.ts` with PUT (edit note).

### ✅ Day 14 – Review

* [ ] Run full server + client together and confirm data flow works.

---

## 🧩 WEEK 3 – Full-Stack Integration

### ✅ Day 15 – Fetch from Backend

* [ ] In `App.tsx`, use `useEffect` to fetch notes from API.

### ✅ Day 16 – POST Data

* [ ] Add input and "Add" button that sends a POST request.

### ✅ Day 17 – DELETE Data

* [ ] Add a delete button that removes a note.

### ✅ Day 18 – Handle Loading/Error

* [ ] Add simple loading spinner or message.

### ✅ Day 19 – Styling

* [ ] Install Tailwind or add basic CSS styling.

### ✅ Day 20 – Deploy

* [ ] Deploy frontend → [Vercel.com](https://vercel.com)
* [ ] Deploy backend → [Render.com](https://render.com)

### ✅ Day 21 – Interview Simulation

* [ ] Practice explaining your project:
  "React sends request → Node receives → responds with JSON → React updates UI."

---

## 💡 Extra Challenges

* Add timestamps to notes.
* Connect MongoDB or Supabase later.
* Add authentication with JWTs.
* Add OpenAI API integration for "AI Notes."

---

🎯 **Goal:** By the end, you can confidently say:

> "I built and deployed a full-stack TypeScript app using React and Node."

Happy coding! 💪

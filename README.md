# Task Manager

A calendar-based task management app for teams. Built with React, TypeScript, and Webpack — no backend required. All data is persisted in the browser's localStorage.

## Features

- **Calendar views** — switch between Month, Week, and Day views
- **Task management** — create, edit, and delete tasks with a title, description, status, due date, and assignees
- **Recurring tasks** — set daily, weekly, or monthly recurrence with optional end dates; edit a single occurrence or all future events independently
- **Team members** — add and manage team members with color-coded avatars
- **Search** — find tasks by name and jump directly to them on the calendar

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (bundled with Node.js)

## Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd Task-Manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

   The app will be available at `http://localhost:8080`.

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start the dev server with hot reload |
| `npm run build` | Build a production bundle into `dist/` |

## Project Structure

```
src/
├── App.tsx                     # Root component and layout
├── index.tsx                   # Entry point
├── context/
│   ├── AppContext.tsx           # Global state (tasks & team members) with localStorage persistence
│   └── types.ts                # Shared TypeScript types
├── components/
│   ├── Calendar/               # Month, Week, Day views + task chips
│   ├── Tasks/                  # Task modal, recurrence editor, assignee selector
│   ├── Team/                   # Team panel and member rows
│   └── Shared/                 # Reusable UI (modal, search bar, color picker)
└── utils/
    ├── dateUtils.ts            # Calendar grid helpers
    └── recurrenceUtils.ts      # Recurring task expansion logic
```

## Usage

### Adding a task
Click **+ Add Task** in the top-right corner, or click any day cell on the calendar. Fill in the title, optional description, status, due date, and assignees.

### Recurring tasks
When creating or editing a task, expand the **Recurrence** section to set a frequency (daily, weekly, monthly), an interval, and an optional end date. When editing a recurring task you'll be prompted to update **this event only** or **this and all future events**.

### Managing team members
The **Team** panel on the left lists all members. Click **Add Member** to create one. Each member gets a color used to identify them across task chips on the calendar.

### Search
Use the search bar in the header to find tasks by title. Clicking a result jumps to that date in the calendar and opens the task.

## Tech Stack

- **React 18** + **TypeScript**
- **Webpack 5** + **Babel** (transpilation and bundling)
- **date-fns** (date math and formatting)
- **CSS Modules** (scoped component styles)
- **localStorage** (client-side persistence, no backend needed)

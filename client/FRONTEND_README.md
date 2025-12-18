# Smart Student Task Manager - Frontend

Modern, AI-powered task management application built with React + Vite and Tailwind CSS.

## 🚀 Tech Stack

- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Routing:** React Router DOM
- **Notifications:** React Hot Toast
- **Date Handling:** date-fns

## 📁 Project Structure

```
client/src/
├── components/
│   ├── Layout.jsx           # Main layout with navigation
│   ├── MagicInputModal.jsx  # AI-powered task creation modal
│   └── TaskCard.jsx         # Individual task card component
├── pages/
│   ├── Dashboard.jsx        # Dashboard with charts & stats
│   └── Tasks.jsx            # Task list with filters
├── context/
│   └── TaskContext.jsx      # Global state management
├── services/
│   └── api.js              # Axios instance & API calls
├── App.jsx                 # Main app with routing
└── index.css              # Global styles
```

## 🎨 Design System

### Color Palette
- **Primary:** Violet/Purple (`violet-600`)
- **Background:** Dark slate (`slate-950`, `slate-900`)
- **Cards:** `slate-800` with `slate-700` borders

### Priority Colors
- 🔴 **Do First:** Rose (`rose-500`) - Urgent & Important
- 🟡 **Schedule:** Amber (`amber-500`) - Important, Not Urgent
- 🔵 **Delegate:** Blue (`blue-500`) - Urgent, Not Important
- ⚪ **Eliminate:** Gray (`gray-500`) - Neither

## ✨ Key Features

### 1. **Magic AI Input**
- Smart text analysis for task creation
- Two modes: AI-powered & Manual
- Auto-extracts title, subject, deadline, and priority
- Editable AI suggestions

### 2. **Dashboard**
- Summary cards (Total, Pending, Urgent tasks)
- Weekly task load bar chart
- Priority distribution pie chart
- Real-time updates

### 3. **Task Management**
- Filter by Date or Priority
- Group tasks (Today, Tomorrow, Overdue, Upcoming)
- Mark as complete/incomplete
- Delete with confirmation
- Show/hide completed tasks

### 4. **Notifications**
- Success/error toast notifications
- Test notification button

## 🔌 API Integration

Backend: `http://localhost:3000`

### Endpoints Used:
- `GET /api/dashboard` - Dashboard stats
- `GET /api/tasks?user_id=1` - Fetch all tasks
- `POST /api/tasks/analyze` - AI text analysis
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/test-notify` - Test notifications

## 🏃‍♂️ Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 🎯 User Flow

1. **View Dashboard** → See stats and charts
2. **Click + Button** → Open Magic Input Modal
3. **Choose Tab:**
   - **Smart AI:** Paste text → Analyze → Review → Confirm
   - **Manual:** Fill form directly → Create
4. **Manage Tasks** → Navigate to Tasks page
5. **Filter & Organize** → By Date or Priority
6. **Complete/Delete** → Check off or remove tasks

## 🔥 Hot Features

- **Dark Mode:** Default modern dark theme
- **Responsive:** Mobile-first design
- **Real-time:** Auto-refresh on CRUD operations
- **Smooth UX:** Loading states, animations, confirmations
- **Error Handling:** Toast notifications for all actions

## 📦 Dependencies

```json
{
  "axios": "latest",
  "lucide-react": "latest",
  "recharts": "latest",
  "react-router-dom": "latest",
  "react-hot-toast": "latest",
  "date-fns": "latest",
  "@tailwindcss/vite": "latest"
}
```

## 🎓 Built for Students

Designed specifically for student workload management with:
- Academic deadline tracking
- Subject organization
- Priority-based task management (Eisenhower Matrix)
- Smart AI text parsing for assignments

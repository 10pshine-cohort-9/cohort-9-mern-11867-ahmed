# 📝 NotesApp — Cohort 9 MERN Assignment

> **Author:** Ahmed Jamil &nbsp;|&nbsp; **Cohort:** 9 — MERN (NodeJS + ReactJS) &nbsp;|&nbsp; **ID:** 11867

A full-stack **Notes Management Web Application** built with the MERN stack (MongoDB, Express.js, React, Node.js). Users can register, log in, and manage personal notes with a rich-text editor — all secured with JWT authentication.

[![SonarCloud](https://sonarcloud.io/images/project_badges/sonarcloud-white.svg)](https://sonarcloud.io/summary/new_code?id=AhmedJ561_cohort-9-mern-11867-ahmed)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [API Reference](#-api-reference)
  - [Auth Endpoints](#auth-endpoints)
  - [Notes Endpoints](#notes-endpoints)
- [Frontend Pages & Components](#-frontend-pages--components)
- [Testing](#-testing)
- [Code Quality](#-code-quality)
- [Git Branching Strategy](#-git-branching-strategy)

---

## ✨ Features

- 🔐 **User Authentication** — Register & login with hashed passwords (bcryptjs) and JWT tokens (24h expiry)
- 🔒 **Change Password** — Secure password update with validation (min 8 chars, uppercase, lowercase, number, special char)
- 📒 **Notes CRUD** — Create, read, update, and delete personal notes, scoped per user
- ✍️ **Rich Text Editor** — Quill.js-powered editor with DOMPurify sanitization
- 👤 **Profile Page** — View account info and manage password
- 🛡️ **Security** — NoSQL injection prevention, `X-Powered-By` header disabled, CORS configured
- 📊 **Logging** — Structured HTTP request logging with Pino
- 🧪 **Tests** — Unit & integration tests for both Backend (Mocha/Chai) and Frontend (Jest/Testing Library)
- 📈 **SonarCloud** — Continuous code quality and coverage analysis

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express.js | ^5.2.1 | Web framework |
| MongoDB | Atlas / Local | Database |
| Mongoose | ^9.9.1 | ODM |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT auth |
| pino / pino-http | ^10 / ^11 | Logging |
| cors | ^2.8.6 | Cross-origin requests |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2.8 | UI library |
| Vite | ^8.2.0 | Build tool & dev server |
| React Router DOM | ^7.18.2 | Client-side routing |
| Axios | ^1.19.0 | HTTP client |
| Quill.js | ^2.0.3 | Rich text editor |
| DOMPurify | ^3.4.14 | XSS sanitization |
| react-icons | ^5.7.0 | Icon library |
| Tailwind CSS | ^4.3.3 | Utility-first styling |

### Dev & Quality
| Tool | Purpose |
|---|---|
| Mocha + Chai | Backend unit testing |
| c8 | Backend code coverage |
| Jest + Testing Library | Frontend unit testing |
| oxlint | Frontend linting |
| SonarCloud | Static analysis & coverage reporting |

---

## 📁 Project Structure

```
cohort-9-mern-11867-ahmed/
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── noteController.js     # CRUD logic for notes
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification
│   │   │   └── errorMiddleware.js   # Global error handler
│   │   ├── models/
│   │   │   ├── User.js              # User schema (username, password)
│   │   │   └── Note.js             # Note schema (title, content, userId)
│   │   ├── routes/
│   │   │   ├── authRoute.js        # /api/auth/* — register, login, me, change-password
│   │   │   └── noteRoute.js        # /api/notes/* — full CRUD (protected)
│   │   ├── utils/
│   │   │   └── logger.js           # Pino logger instance
│   │   ├── db.js                   # MongoDB connection
│   │   └── server.js               # Express app entry point
│   ├── test/                       # Mocha/Chai backend tests
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthLayout.jsx      # Auth route guard wrapper
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── NoteEditor.jsx      # Quill rich-text note editor
│   │   │   └── NoteViewer.jsx      # Read-only note display
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Signup.jsx          # Registration page
│   │   │   ├── Dashboard.jsx       # Main notes dashboard
│   │   │   └── Profile.jsx         # User profile & password change
│   │   ├── utils/                  # Shared helpers / axios instance
│   │   ├── App.jsx                 # Root router
│   │   └── main.jsx                # React entry point
│   ├── tests/                      # Jest/Testing Library frontend tests
│   └── package.json
│
├── sonar-project.properties        # SonarCloud configuration
├── package.json                    # Root scripts (sonar scan)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9+
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) URI
- **Git**

### Environment Variables

#### `Backend/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/notesapp
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGIN=http://localhost:5173
```

#### `Frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

> ⚠️ Never commit `.env` files. They are already listed in `.gitignore`.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AhmedJ561/cohort-9-mern-11867-ahmed.git
cd cohort-9-mern-11867-ahmed

# 2. Install Backend dependencies
cd Backend
npm install

# 3. Install Frontend dependencies
cd ../Frontend
npm install
```

### Running the App

#### Start Backend (port 5000)

```bash
cd Backend
npm run dev
```

#### Start Frontend (port 5173)

```bash
cd Frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Reference

Base URL: `http://localhost:5000`

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT token |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `PUT` | `/api/auth/change-password` | ✅ | Change user password |

#### POST `/api/auth/register`

```json
// Request body
{ "username": "ahmed", "password": "Secret@123" }

// Response 201
{ "token": "<jwt_token>" }
```

#### POST `/api/auth/login`

```json
// Request body
{ "username": "ahmed", "password": "Secret@123" }

// Response 200
{ "token": "<jwt_token>" }
```

#### GET `/api/auth/me`

```
Authorization: Bearer <token>

// Response 200
{ "_id": "...", "username": "ahmed", "createdAt": "...", "updatedAt": "..." }
```

#### PUT `/api/auth/change-password`

```json
// Authorization: Bearer <token>
// Request body
{ "currentPassword": "Secret@123", "newPassword": "NewPass@456" }

// Response 200
{ "message": "Password updated successfully" }
```

Password validation rules: min **8 characters**, at least one **uppercase**, **lowercase**, **digit**, and **special character**.

---

### Notes Endpoints

> All notes endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/notes` | Create a new note |
| `GET` | `/api/notes` | Get all notes for the logged-in user |
| `GET` | `/api/notes/:id` | Get a single note by ID |
| `PUT` | `/api/notes/:id` | Update a note |
| `DELETE` | `/api/notes/:id` | Delete a note |

#### POST `/api/notes`

```json
// Request body
{ "title": "My First Note", "content": "<p>Hello World</p>" }

// Response 201 — returns the saved note object
```

#### GET `/api/notes`

```json
// Response 200 — array of notes sorted by newest first
[
  { "_id": "...", "title": "My First Note", "content": "...", "userId": "...", "createdAt": "...", "updatedAt": "..." }
]
```

---

## 🖥️ Frontend Pages & Components

### Pages

| Page | Route | Description |
|---|---|---|
| **Login** | `/` | Username/password login form |
| **Signup** | `/signup` | New user registration form |
| **Dashboard** | `/dashboard` | View, create, edit, and delete notes |
| **Profile** | `/profile` | Account info and change password |

### Components

| Component | Description |
|---|---|
| `AuthLayout` | Route guard — redirects unauthenticated users to login |
| `Navbar` | Top navigation with links and logout |
| `NoteEditor` | Quill.js rich-text editor for creating/editing notes |
| `NoteViewer` | Safely renders saved HTML note content via DOMPurify |

### Routing

```
/           → Login (public)
/signup     → Signup (public)
/dashboard  → Dashboard (protected via AuthLayout)
/profile    → Profile (protected via AuthLayout)
*           → Redirect to /
```

---

## 🧪 Testing

### Backend Tests (Mocha + Chai + c8)

```bash
cd Backend
npm test                  # Run all tests
```

Tests are located in `Backend/test/` and cover controllers and route logic.

### Frontend Tests (Jest + React Testing Library)

```bash
cd Frontend
npm test                  # Run all tests
npm run test:coverage     # Run with coverage report
```

Tests are located in `Frontend/tests/` covering pages and components.

### Coverage Reports

Coverage data is output to:
- `Backend/coverage/lcov.info`
- `Frontend/coverage/lcov.info`

These are automatically picked up by SonarCloud for quality gate analysis.

---

## 📊 Code Quality

This project uses **SonarCloud** for continuous static analysis.

- **Project Key:** `AhmedJ561_cohort-9-mern-11867-ahmed`
- **Organization:** `ahmedj561`
- **Scanned Sources:** `Frontend/src`, `Backend/src`
- **Tests Directories:** `Frontend/tests`, `Backend/test`

To run a local scan:

```bash
# From project root
npm run scan
```

> Requires `SONAR_TOKEN` to be set in your environment or `.env` file.

---

## 🌿 Git Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `develop` | Integration branch — all features merge here |
| `feature/*` | Individual feature branches (e.g., `feature/detail-readme`) |

### Workflow

```bash
# Start a new feature
git checkout develop
git checkout -b feature/your-feature-name

# Work, commit, then push
git push origin feature/your-feature-name

# Open a Pull Request → develop
```

---

## 📄 License

This project is part of the **10Pearls Cohort 9 MERN Training Program** and is intended for educational purposes.

---

<p align="center">Made with ❤️ by Ahmed Jamil — Cohort 9</p>

# CP Arena — Competitive Programming Aggregator

A unified competitive programming aggregator and practice platform that brings together contests and problems from **Codeforces**, **LeetCode**, **CodeChef**, and **AtCoder** into a single, stunning dashboard.

![Phase](https://img.shields.io/badge/Phase-1%20%7C%20Contest%20Calendar-cyan)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black)
![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203-green)
![Database](https://img.shields.io/badge/DB-MySQL%208.0-blue)

## ✨ Features (Phase 1)

- **Universal Contest Calendar** — Aggregated upcoming, live, and past contests from all 4 platforms
- **Platform Filters** — Toggle which platforms to show with smooth animations
- **Live Countdown Timers** — Real-time countdown to contest start with urgent styling
- **Google Calendar Integration** — One-click add to your Google Calendar
- **Premium Dark UI** — Glassmorphism design with Framer Motion animations

## 🏗️ Architecture

```
CP-Aggregator/
├── frontend/          # Next.js 15 + Tailwind v4 + Framer Motion
├── backend/           # Spring Boot 3 + JPA + MySQL
├── docker-compose.yml # MySQL container
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **Java 17+** and **Maven**
- **Docker** (for MySQL) or MySQL 8.0 installed natively

### 1. Start the Database

```bash
docker compose up -d
```

Or if you have MySQL installed natively, create the database:

```sql
CREATE DATABASE cp_aggregator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api`.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/contests` | List all contests (optional: `?platforms=CODEFORCES,LEETCODE&phases=BEFORE`) |
| `GET` | `/api/contests/upcoming` | Upcoming contests only |
| `GET` | `/api/contests/live` | Currently active contests |
| `GET` | `/api/contests/{id}` | Single contest details |
| `POST` | `/api/contests/refresh` | Trigger manual data refresh |

## 🎨 Design

- **Theme**: Premium dark mode with glassmorphism
- **Colors**: Deep void backgrounds with cyan/blue/purple accent gradients
- **Animations**: Hardware-accelerated via Framer Motion
- **Typography**: Inter (Google Fonts)
- **Platform Accents**: Codeforces (Blue), LeetCode (Orange), CodeChef (Brown), AtCoder (Green)

## 🗺️ Roadmap

- [x] **Phase 1**: Contest Calendar
- [ ] **Phase 2**: Problem Discovery & Filtering Matrix
- [ ] **Phase 3**: Multi-Platform Profile Linking
- [ ] **Phase 4**: Practice Analyzer & Stats
- [ ] **Phase 5**: Leaderboards & Peer Battles

## 📄 License

University project — 3rd year, 2026.

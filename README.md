<div align="center">
  <img src="https://raw.githubusercontent.com/CyberKun/CP-Aggregator/main/frontend/public/logo.png" alt="CP Times Logo" width="120" />
  <h1>🚀 CP Times</h1>
  <p><strong>Your Ultimate Competitive Programming Command Center</strong></p>
  <p>
    <a href="https://cp-times.vercel.app">View Demo</a>
    ·
    <a href="https://github.com/CyberKun/CP-Aggregator/issues">Report Bug</a>
    ·
    <a href="https://github.com/CyberKun/CP-Aggregator/issues">Request Feature</a>
  </p>
</div>

---

> Stop juggling five different browser tabs just to figure out when the next Codeforces round starts or to find a decent LeetCode problem. **CP Times** brings everything together in one beautifully designed, unified dashboard.

CP Times aggregates contests, problems, and user statistics from the world's most popular competitive programming platforms: **Codeforces**, **LeetCode**, **CodeChef**, and **AtCoder**. 

## 🌟 Why We Built This

Let's be real: as competitive programmers, we absolutely love the thrill of solving hard problems. What we *don't* love is constantly context-switching between different websites, checking calendars across different time zones, and manually tracking our progress across various platforms.

We built **CP Times** to serve as the ultimate home base for coders. Packed with a stunning, glassmorphic dark-mode UI and buttery-smooth animations, tracking your competitive programming journey isn't a chore anymore—it's actually enjoyable.

## ✨ Features That Kick Ass

* 🗓️ **Universal Contest Calendar**: Never miss a rated round again! View upcoming and live contests from all major platforms in a single, unified timeline that automatically adjusts to your local time zone.
* ⚔️ **Practice Arena**: Dive into our massive, aggregated problem database. Whether you're hunting for an easy LeetCode string problem or a 2000-rated Codeforces graph challenge, you can filter thousands of problems by platform, difficulty, and tags in milliseconds.
* 📊 **Developer Identity**: Link your handles from Codeforces, LeetCode, CodeChef, and AtCoder. We aggregate your global stats, total solved problems, and recent submissions into one slick developer profile.
* 😎 **Custom Avatars**: Drop in your favorite image to customize your profile! Our frontend auto-compresses and resizes your images directly in your browser, ensuring lightning-fast uploads.
* ⚡ **Real-Time Data Sync**: We leverage powerful cron jobs and GraphQL API integrations behind the scenes to ensure contest schedules, problem tags, and your personal submission histories are always up-to-date.

## 🛠️ The Tech Stack

We recently migrated from a legacy Java backend to a lightning-fast, modern full-stack TypeScript architecture designed for speed and scalability.

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
* **Styling**: Tailwind CSS v4 + Framer Motion (for those gorgeous micro-animations)
* **Database**: PostgreSQL (hosted on [Neon](https://neon.tech/))
* **ORM**: Prisma
* **Authentication**: Custom JWT-based auth with bcrypt
* **Deployment**: Automatically deployed via Vercel

## 🚀 Getting Started Locally

Want to hack on CP Times or run your own instance? It's incredibly easy to spin up.

### Prerequisites
* Node.js 18+
* A PostgreSQL database connection string (Neon, Supabase, or local)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/CyberKun/CP-Aggregator.git
   cd CP-Aggregator/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the `frontend` directory and add your credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/cptimes"
   JWT_SECRET="your-super-secret-key-change-in-production"
   ```

4. **Sync the Database Schema**
   Push the Prisma schema to your database and generate the client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Fire it up!**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) and start coding!

---

## 🤝 Contributing

Found a bug? Want to add support for HackerRank, TopCoder, or USACO? PRs are incredibly welcome! Feel free to open an issue or submit a pull request. Let's build the best CP tool together.

## 📄 License

Built with ❤️ for a university project. 

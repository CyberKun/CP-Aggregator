# 🚀 CP Times

> **One platform to track them all.** A sleek, unified competitive programming aggregator built by developers, for developers. 

Stop juggling between five different browser tabs just to see upcoming contests or find practice problems. **CP Times** brings together contests, problems, and user stats from **Codeforces**, **LeetCode**, **CodeChef**, and **AtCoder** into a single, beautifully designed dashboard.

---

## 🌟 Why build this?

As competitive programmers, we love solving problems. But we *hate* having to check multiple sites to see when the next contest starts, or tracking our stats across different platforms. 

We built **CP Times** to be the ultimate home base for coders. It features a stunning, glassmorphic dark-mode UI with smooth animations that makes tracking your competitive programming journey actually enjoyable.

## ✨ Features That Kick Ass

- **🗓 Universal Contest Calendar**: Never miss a rated round again. View upcoming and live contests from all major platforms in one unified timeline. Add them directly to your Google Calendar with one click!
- **⚔️ Practice Arena**: Filter thousands of problems by platform, difficulty, and tags. Whether you want an easy LeetCode string problem or a 2000-rated Codeforces graph challenge, find it in seconds.
- **📊 Developer Identity (Profiles)**: Link your handles from different platforms to aggregate your total solved problems, global ranking, and see your performance stats in one unified developer profile.
- **😎 Custom Avatars**: Drop in your favorite image to customize your profile. (We auto-compress and resize it in your browser so it's lightning fast!).
- **🏆 Global Leaderboard**: See how you stack up against other users on the platform.

## 🛠 Tech Stack

We pivoted from a clunky Java backend to a sleek, modern full-stack TypeScript architecture.

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion (for those buttery smooth animations)
- **Database**: PostgreSQL (hosted on [Neon](https://neon.tech/))
- **ORM**: Prisma
- **Authentication**: JWT-based custom auth with bcrypt
- **Deployment**: Vercel

## 🚀 Getting Started Locally

Want to hack on CP Times? It's incredibly easy to spin up.

### Prerequisites
- Node.js 18+
- A PostgreSQL database string (Neon, Supabase, or local)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/CyberKun/CP-Aggregator.git
   cd CP-Aggregator/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set up your Environment Variables**
   Create a `.env` file in the `frontend` directory and add your database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/cptimes"
   JWT_SECRET="your-super-secret-key-change-in-production"
   ```

4. **Sync the Database**
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

Found a bug? Want to add support for HackerRank or TopCoder? PRs are incredibly welcome! Feel free to open an issue or submit a pull request. Let's build the best CP tool together.

## 📄 License

Built with ❤️ for a university project. 

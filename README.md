# SplitItUp Expense Sharing Application

A production-ready expense sharing web application built with Next.js, Prisma, and Vercel Postgres.

## Features

- 🔐 Authentication with NextAuth (Credentials-based)
- 👥 Group management (create, join, manage members)
- 💰 Transaction management (equal & custom splits)
- 📊 Balance calculations with debt simplification
- 💳 Settlement tracking
- 🎨 Premium UI/UX with gradients and animations
- 📱 Fully responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Vercel Postgres
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Animations**: Framer Motion
- **State**: React Context + Server Actions

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Vercel Postgres)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your database URL and NextAuth secret.

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

- **User**: User accounts with username and password
- **Group**: Expense groups
- **GroupMember**: Group membership with roles (ADMIN/MEMBER)
- **Transaction**: Expense transactions
- **TransactionSplit**: Custom splits for transactions
- **Settlement**: Payment settlements between users

## Project Structure

```
/app
  /(auth)          # Authentication pages
  /(protected)     # Protected routes
  /api             # API routes
  /components      # React components
  /lib             # Utilities and helpers
/prisma            # Prisma schema and migrations
```

## Deployment

This app is configured for Vercel deployment. Connect your GitHub repository to Vercel and configure your environment variables.

## License

MIT


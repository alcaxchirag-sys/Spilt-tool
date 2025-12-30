# Deployment Guide

## Prerequisites

1. Node.js 18+ installed
2. A Vercel account
3. A Vercel Postgres database (or any PostgreSQL database)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd splititup-expense-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/splititup_db?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Vercel Deployment

### Step 1: Push to GitHub

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a GitHub repository and push:
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Create Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Create Database → Postgres
3. Create a new Postgres database
4. Copy the connection string (you'll need it in the next step)

### Step 3: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build`
   - **Install Command**: `npm install`
   - **Output Directory**: `.next` (default)

5. **Add Environment Variables**:
   - `DATABASE_URL`: Your Vercel Postgres connection string
   - `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET`: Generate a random string (you can use `openssl rand -base64 32`)
   - `NODE_ENV`: `production`

6. Click "Deploy"

### Step 4: Run Database Migrations

After deployment, you need to run the database migrations:

1. Go to your Vercel project dashboard
2. Navigate to the "Deployments" tab
3. Click on the latest deployment
4. Go to the "Functions" tab and find a way to run commands, OR

Alternatively, run migrations locally with production database:

```bash
DATABASE_URL="your-production-database-url" npx prisma db push
```

Or use Vercel CLI:

```bash
npm i -g vercel
vercel env pull
npx prisma db push
```

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Test user signup/login
- [ ] Test group creation
- [ ] Test transaction creation
- [ ] Test balance calculations
- [ ] Test settlement recording
- [ ] Verify mobile responsiveness

## Troubleshooting

### Database Connection Issues

- Ensure `DATABASE_URL` is correctly set in Vercel environment variables
- Check that your Vercel Postgres database is active
- Verify the connection string format

### Build Failures

- Ensure all dependencies are in `package.json`
- Check that Prisma is generating correctly: `npx prisma generate`
- Review build logs in Vercel dashboard

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your deployment URL
- Ensure cookies are enabled in browser

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Your app's URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Random 32+ character string |
| `NODE_ENV` | Environment mode | `production` or `development` |


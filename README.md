# LocJob

**Local oppurtunties. Real experience**

LocJob is a job-seeking platform for young people in South Africa. It lets users find part-time work, freelance gigs, and casual jobs.
Job seekers can search, save, and apply, while local employers can post job listings.

The web-based application is built with Next.js 16, Auth0, and Supabase.



## Contents

1. [What is does](#what-is-does)
2. [Tech stack](#tech-stack)
3. [Getting started](#getting-started)
4. [Setting up Supabase](#setting-up-supabase)
5. [Signing in](#signing-in)
6. [Pages](#pages)
7. [Project layout](#project-layout)
8. [UI](#ui)
9. [Issues](#issues)
10. [Deploying](#deploying)



## What it does

**For job seekers**

Search for jobs using keywords (job title, company, or category) and location (city, suburb, or province).
- Apply filters based on the job types: Part-Time, Full-Time, Contract, Freelance, or Casual/Gig.
- Open up the job detail page and then apply using your cover letter.
- Save jobs by using the heart icon and return later.
- Add a CV (PDF, DOC, DOCX, or TXT) from the homepage. This is stored in Supabase Storage and is the first step towards creating an application profile.
- View some suggested jobs after uploading your CV.

**For employers**
 
- Post a job using a job title, company, location, description, pay amount, pay frequency (daily, weekly, or monthly), and job type.
- The newly posted jobs will be visible in the list immediately.
- Use the employer view option in the dashboard for a summary.

**Good to know**
 
- In case there are no available jobs in the database, the app uses built-in sample jobs to make sure the site is never empty.
- Light and dark themes are used based on the visitor’s system preference.
- Vercel Analytics is enabled only in production.


## Tech stack

- **Next.js** and **React** with TypeScript
- **Tailwind CSS** for the UI
- **Auth0** and **Supabase** for signing into the system
- **Supabase** for the database and storage
- **pnpm** forpackage management


## Getting started

### What you'll need
 
- Node.js 22 or newer (the Supabase client requires it)
- pnpm (the exact version is pinned in `package.json`)
- An Auth0 account with a **Regular Web Application**
- A Supabase project

### 1. Install
 
```bash
pnpm install
```
 
### 2. Add your environment variables
 
Create a file called `.env.local` in the project root:
 
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
# If you don't have a publishable key, the legacy anon key works as a fallback:
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 
# Auth0
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_SECRET=a-long-random-string        # try: openssl rand -hex 32
APP_BASE_URL=http://localhost:3000
```
 
Two optional ones:
 
```bash
# Takes priority over APP_BASE_URL. v0 sets this automatically in previews.
V0_RUNTIME_URL=
 
# Overrides where Supabase's confirmation email sends people after sign-up.
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=
```
 
### 3. Configure Auth0
 
In your Auth0 application settings, add:
 
- **Allowed Callback URLs:** `http://localhost:3000/auth/callback`
- **Allowed Logout URLs:** `http://localhost:3000`
> **A note on cookies:** the Auth0 transaction cookie is set to `sameSite: 'none'` and `secure: true` so that sign-in works inside the v0 preview. If sign-in acts up on plain `http://localhost`, you can relax those settings in `lib/auth0.ts`.
 
### 4. Start the app
 
```bash
pnpm dev
```
 
Open [http://localhost:3000](http://localhost:3000).
 
### Scripts
 
| Command | What it does |
| --- | --- |
| `pnpm dev` | Starts the dev server |
| `pnpm build` | Builds for production |
| `pnpm start` | Runs the production build |
 
 
## Setting up Supabase
 
### Tables
 
**`jobs`**
 
| Column | Notes |
| --- | --- |
| `id` | Primary key |
| `employer_id` | The user who posted it |
| `title`, `company`, `location`, `description` | Text |
| `requirements` | Text (the app saves an empty string for now) |
| `payment_amount` | Number |
| `payment_frequency` | `Per Day`, `Per Week` or `Per Month` |
| `work_type` | `Part-Time`, `Full-Time`, `Contract`, `Freelance` or `Casual/Gig` |
| `category` | Text |
| `status` | The app only lists rows where this is `published` |
| `created_at` | Used to sort newest first |
 
**`profiles`**
 
| Column | Notes |
| --- | --- |
| `id` | Matches the Supabase auth user id |
| `role` | `employee` or `employer` |
 
**`saved_jobs`**: `job_id` and `employee_id`.
 
**`applications`**: `job_id`, `employee_id` and `cover_note`. Add a unique constraint on (`job_id`, `employee_id`). The app uses the resulting duplicate error to tell people "You have already applied for this job."
 
### Storage
 
Create a bucket called **`cv-uploads`**. CVs are saved under `cv/<timestamp>-<filename>`. If the bucket is missing, the app tells the user their CV was selected but storage isn't set up yet.
 
### Row Level Security
 
Turn RLS on and write policies along these lines:
 
- Anyone can read jobs where `status = 'published'`.
- Only users whose profile role is `employer` can insert jobs, and only with their own `employer_id`.
- Employees can read, add, and remove their own `saved_jobs`.
- Employees can add and read their own `applications`.
- Users can read their own `profiles` row.
- Authenticated users can upload to `cv-uploads`.
The employer posting flow also expects the profile role to be set during registration. The sign-up form passes `full_name`, `role` and `phone` as user metadata, so a database trigger that creates a `profiles` row from that metadata is a handy way to do it.
 
 
## How signing in works
 
There are two sign-in systems in this project.
 
**Auth0** handles:
 
- The `/login` and `/signup` pages, which simply send people to Auth0.
- Protecting `/dashboard` and `/profile` (see `proxy.ts`).
- The Sign in / Sign out buttons and profile icon in the home page header.
**Supabase Auth** handles:
 
- The email and password form at `/auth` (sign in, register, forgot password).
- Knowing who's logged in on the jobs page, so saving, applying and posting depend on it.
- The greeting name on the dashboard.
### Route protection
 
`proxy.ts` runs on every request except static files and images.
 
- `/auth/*` is passed straight through to Auth0.
- `/dashboard`, `/profile` and anything beneath them need an Auth0 session. If you're signed out, you're redirected to `/auth/login?returnTo=<where you were going>`.
- Everything else is public.
To protect another page, add it to the path check in `proxy.ts`.
 
### Sign-in rules on the Supabase form
 
- Passwords need at least 8 characters.
- Registration asks for full name, email, account type (Employee or Employer), an optional phone number and a password you confirm.
- After sign-in, employers are sent to `/employer/dashboard` and everyone else to `/dashboard`.
  
 
## Pages and routes
 
| Route | What's there |
| --- | --- |
| `/` | Home page: search bar, featured jobs, CV upload, "how it works" and a trust section |
| `/jobs` | Browse, filter, save and apply. Employers can post a job here too |
| `/jobs/[id]` | A single job. The ids `demo-garden`, `demo-retail`, `demo-social` and `demo-event` are built-in demos; any other id is looked up in the `jobs` table |
| `/dashboard` | Candidate and employer views (sign-in required) |
| `/profile` | Candidate profile form (sign-in required) |
| `/login` | Sends people to Auth0 to sign in |
| `/signup` | Sends people to Auth0 to create an account |
| `/auth` | Supabase email and password sign-in and registration |
| `/auth/login`, `/auth/logout` | Provided by the Auth0 middleware |
| `/auth/callback` | Auth0's callback. A Supabase callback route also lives here (see [Known issues](#known-issues)) |
 
 
## Project layout
 
```
proxy.ts                  Auth0 middleware and route protection
next.config.mjs           Next.js config
components.json           shadcn/ui config
lib/
  auth0.ts                Auth0 client setup
  utils.ts                cn() helper for combining class names
  supabase/
    client.ts             Supabase client for the browser
    server.ts             Supabase client for server components and route handlers
components/
  ui/                     shadcn/ui components (button, and any you add)
app/
  layout.tsx              Root layout: metadata, Auth0 provider, analytics
  globals.css             Tailwind setup and light/dark theme colours
  page.tsx                Home page
  jobs/                   Job list and job details
  dashboard/              Dashboard
  profile/                Profile
  login/, signup/         Auth0 entry pages
  auth/                   Supabase sign-in page and callback route
```
 
## Working on the UI
 
Add new shadcn components with:
 
```bash
pnpm dlx shadcn@latest add <component>
```
 
Settings live in `components.json`: neutral base colour, CSS variables, Lucide icons. Import aliases are `@/components`, `@/components/ui`, `@/lib` and `@/hooks`.
 
Most of the app's pages use hard-coded brand colours (navy `#0d3b66` and green `#20a36a`) directly in their classes, rather than the theme variables in `globals.css`. If you want a proper dark mode or an easy rebrand, moving those colours into the theme is a good first cleanup.
 
 
## Known issues
 
None of these are showstoppers, but you'll want to deal with them before launch.
 
**1. Two sign-in systems that don't know about each other.**
Someone who signs in through Auth0 won't be recognised by the jobs page, so they can't save, apply or post. The reverse also applies: someone who signs in through the Supabase form can't open `/dashboard` or `/profile`, because those check for an Auth0 session. The simplest fix is to pick one system. Otherwise you'll need to connect the two.
 
**2. Two things want `/auth/callback`.**
Auth0 uses it for its sign-in callback, and the Supabase code-exchange route is at the same path. Move one of them (for example, the Supabase one to `/supabase/callback`) and update the redirect URLs to match.
 
**3. Some screens are placeholders.**
- The application list and the employer stats on the dashboard are sample data.
- "Save profile" on `/profile` only holds the data in the browser; nothing is saved.
- `/employer/dashboard` doesn't exist yet, even though employers are sent there after signing in.
- "Upload job" on the jobs page only shows the chosen file name.
- The employer dashboard's "Post a new job" link points to `/jobs#post-a-job`, but nothing on that page uses that anchor, so it won't open the form.
**4. Password reset isn't finished.**
"Forgot password?" sends an email, but the link goes to `/auth?mode=reset`, which the page doesn't handle yet.
 
**5. "Apply now" on a job's own page** sends people to `/login?next=...`, but the login page doesn't use the `next` value, so they won't return to the job after signing in.
 
**6. CV "auto-fill" is very light.**
It only guesses a name from the file name. The CV's contents aren't read.
 
**7. Type errors won't stop a build.**
`next.config.mjs` has `ignoreBuildErrors: true`. Turn it off before going to production so mistakes get caught.
 
 
## Deploying
 
[Vercel](https://vercel.com) is the easiest option.
 
1. Push the project to Git and import it into Vercel.
2. Add all the environment variables from above in the project settings.
3. Set `APP_BASE_URL` to your live domain.
4. In Auth0, add your live callback (`https://your-domain/auth/callback`) and logout URLs.
5. In Supabase, add your live domain to the allowed redirect URLs for authentication.

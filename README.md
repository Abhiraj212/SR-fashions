# SR Fashions Studio

Mobile-first tailoring and boutique management app for Seema Boutique.

## Stack
- Vanilla HTML, CSS and JavaScript (ES modules)
- Supabase Auth + PostgreSQL + Row Level Security
- GitHub Pages static deployment
- No local NPM, Node.js or build step is required

## Supabase project
- Project: SR Fashions
- Region: ap-south-1 (Mumbai)
- Project ref: hlugcrisfdaruaiaqxhs
- Browser config uses the Supabase **publishable** key. This key is designed to be public. Never add a secret key, service_role key, database password, or personal access token to this repository.

## First owner account setup
1. Open the Supabase dashboard for this project: https://supabase.com/dashboard/project/hlugcrisfdaruaiaqxhs
2. Go to Authentication > Users and create the owner's account. Use an email you control and set the password privately in the dashboard.
3. Copy the new user's UUID from the Users screen.
4. In SQL Editor, run the following statement after replacing the placeholder UUID:
   `update public.profiles set role = 'owner', active = true where id = 'PASTE-USER-UUID-HERE';`
5. Sign in at the deployed Studio URL.
6. For staff, create each account in Authentication > Users, then run:
   `update public.profiles set role = 'staff', active = true where id = 'PASTE-STAFF-UUID-HERE';`
7. Do not enable public self-registration. Accounts should be created by the owner.

## Database
The schema is in `supabase/schema.sql`. It creates profiles, customers, measurements, orders, order items, order status history, payments, staff profiles, assignments, staff payments, expenses and business settings. RLS is enabled on all public tables.

## Deployment
GitHub Actions deploys the static root folder to GitHub Pages on pushes to `main`. In repository Settings > Pages, set Build and deployment source to **GitHub Actions** if it is not already set.

## Current implementation
- Secure email/password sign-in (no public signup UI)
- Owner/admin workspace and read-only staff workspace
- Customer directory and creation
- Dated garment measurements
- Orders and status tracking
- Payment and expense entry for owner/admin
- Staff account listing
- Responsive mobile layout and installable PWA shell

## Important
This is the initial working setup. Before entering real customer records, complete owner account setup, test staff access with a separate staff account, and review the Supabase security advisor. Never store customer data in demo/localStorage. Back up business data regularly.

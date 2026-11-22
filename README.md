# SR Fashions Studio

Mobile-first tailoring and boutique management app for Seema Boutique.

## Workspaces
- **Admin Studio:** `/admin.html` for owner/admin accounts. Includes customers, measurements, orders, payments, expenses, staff list and settings.
- **Staff Workspace:** `/staff.html` for staff accounts. Shows assigned jobs only, with no financial totals or admin controls.
- Root `/` is the sign-in entry. After authentication, the app routes users according to their active database role.

## Stack
- Vanilla HTML, CSS and JavaScript (ES modules)
- Supabase Auth + PostgreSQL + Row Level Security
- GitHub Pages static deployment
- No local NPM, Node.js or build step is required

## Supabase project
- Project: SR Fashions
- Region: ap-south-1 (Mumbai)
- Project ref: hlugcrisfdaruaiaqxhs
- Browser config uses the Supabase **publishable** key. It is designed to be public. Never add a secret key, service_role key, database password, or personal access token to this repository.

## First owner account setup
1. Open the Supabase dashboard: https://supabase.com/dashboard/project/hlugcrisfdaruaiaqxhs
2. Go to Authentication > Users and create the owner's account. Set the password privately in the dashboard.
3. Copy the new user's UUID.
4. In SQL Editor, run: `update public.profiles set role = 'owner', active = true where id = 'PASTE-USER-UUID-HERE';`
5. Sign in at the deployed app. It will route to Admin Studio.
6. Create staff accounts in Authentication > Users, then set their role: `update public.profiles set role = 'staff', active = true where id = 'PASTE-STAFF-UUID-HERE';`
7. Do not enable public self-registration. Accounts should be created by the owner.

## Security model
- Every public business table has Row Level Security enabled.
- Admin/owner can manage business records.
- Staff can read only orders assigned to their own profile, and customer/measurement records connected to those assigned orders.
- Staff cannot read payments, expenses, staff accounts or business settings.
- Staff access is read-only in this version. Assignment and order status changes are admin-controlled.
- Role is read from the protected `profiles` table. URL routing is only a user-experience boundary; database RLS is the actual security boundary.
- Never put Supabase secret/service_role keys in browser code.

## Database
The schema is in `supabase/schema.sql`. The staff-scope migration is applied to the live project and restricts staff reads to assigned orders.

## Deployment
GitHub Actions deploys static files to GitHub Pages on pushes to `main`. In repository Settings > Pages, use GitHub Actions as the deployment source.

## Test checklist
1. Create an owner account and confirm it opens Admin Studio.
2. Create a separate staff account and assign a test order to that staff profile.
3. Confirm the staff account sees only that assigned order and its related customer/measurement records.
4. Confirm staff cannot access payments, expenses, staff list, or business settings.
5. Try opening `/admin.html` while signed in as staff. It must redirect to `/staff.html`.
6. Confirm owner/admin can assign and unassign staff from the Orders page.

Do not enter real customer records until the owner and staff access tests pass. Back up business data regularly.

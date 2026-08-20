Frontend (gym-os-admin)
Every time you make a UI/logic change:


# 1. Develop & test locally
npm run dev                    # verify it works against localhost:3333

# 2. Commit your work
git add -A && git commit -m "..." && git push origin main

# 3. Build for production (reads .env.production automatically — NOT .env)
npm run build

# 4. Upload to S3
aws s3 sync dist/ s3://www.krikalone.com --delete

# 5. Hard-refresh the site (Cmd+Shift+R) and verify
Steps 3-5 are the only ones needed on deploy day if you didn't touch .env.production — that file rarely changes (only when the API URL itself changes).

Backend (gym-os-api)
Every time you make an API change:


# 1. Develop & test locally
node ace serve --hmr
npx tsc --noEmit               # catch type errors before deploying

# 2. If you added/changed a migration, test it locally first
node ace migration:run --schema-generate

# 3. Commit your work
git add -A && git commit -m "..." && git push origin main
Then on the EC2 SSH session, this exact sequence every time (this is now your standard deploy — same one that's already fixed the .env symlink and CORS issues you hit):


cd ~/gym-os-api
git pull origin main
npm ci                                          # only needed if package.json changed — safe to always run

# Only if you added a new migration this time:
node ace migration:run --schema-generate

# Only if you added a new seeder you actually want to run in prod
# (be careful — seeders can insert duplicate/test data into a live DB,
# only run ones you've written to be safe to re-run, e.g. upserts):
node ace db:seed --files "database/seeders/your_new_seeder.ts"

# Always required, every deploy:
node ace build
ln -sf ~/gym-os-api/.env build/.env             # symlink gets wiped by every build — always redo this
cd build && npm ci --omit="dev" && cd ..
pm2 restart gym-os-api

# Verify it actually came back up:
sleep 2
pm2 logs gym-os-api --lines 10 --nostream
curl -s -o /dev/null -w "%{http_code}\n" https://api.krikalone.com/api/v1/diet-plans -H "Authorization: Bearer <a real token>"
Notes on the two flagged steps:

Migrations: only run migration:run when you actually added a new migration file — running it with nothing pending is harmless (it just says "Already up to date"), so it's safe to include every time as a habit.
Seeders: your two existing ones (admin_user_seeder.ts, user_seeder.ts) are one-time setup seeders, not meant to be re-run in production — don't include db:seed in your routine deploy unless you're specifically adding a new seeder for a new one-time task (e.g. seeding a new lookup table). Never re-run an old seeder against prod without checking it's idempotent (safe to run twice) first.

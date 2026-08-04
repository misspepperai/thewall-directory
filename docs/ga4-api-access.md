# Giving Claude GA4 access — service account setup (~5 min)

## Why not just add me as a user

Adding a user in GA4 means adding a Google account email. I don't have one — I'm not a
person with a Google identity, so there's nothing to invite. The mechanism that works is a
**service account**: a non-human Google identity with its own key file that scripts
authenticate as.

## What this unlocks

Once it's in place I can, from the command line:

- **Create all 14 custom dimensions automatically** — Task A of the GA4 setup doc, done by
  script instead of 14 manual forms. This is the time-sensitive one GA4 won't backfill.
- **Query Realtime directly** — settle whether events are arriving, without you relaying
  screenshots.
- **Read data filters** — find an Active internal-traffic filter silently excluding your own
  events, which is my leading theory for why Realtime looks empty.
- **Read data streams** — confirm the stream's Measurement ID matches `G-7EVW8MX8Z9`.
- **List key events** — see what's marked as a conversion.

## Setup

### 1. Create the service account

1. <https://console.cloud.google.com> → pick or create a project (any project works)
2. **APIs & Services → Library** → enable both:
   - **Google Analytics Admin API**
   - **Google Analytics Data API**
3. **IAM & Admin → Service Accounts → + Create service account**
   - Name: `thewall-claude` → **Create and continue** → skip the optional role steps → **Done**
4. Click the new service account → **Keys** tab → **Add key → Create new key → JSON** → Create.
   A `.json` file downloads.
5. Copy its **email** — it looks like
   `thewall-claude@yourproject.iam.gserviceaccount.com`

### 2. Grant it access to the GA4 property

1. GA4 → **Admin** → **Property access management** (under *Property*)
2. **+** → **Add users** → paste the service account email
3. Role: **Editor**
   (Editor is required to create custom dimensions. Viewer works if you only want me to read.)
4. Uncheck "Notify new users by email" — it's not a real inbox
5. **Add**

### 3. Put the key where the script expects it

Save the downloaded JSON to exactly:

```
/home/dan/directory-thewall/.secrets/ga4-service-account.json
```

`.secrets/` is already in `.gitignore`, so it cannot be committed.

### 4. Get the Property ID

GA4 → **Admin** → **Property details**. It's the **numeric** ID (e.g. `498273615`) shown top
right — **not** the `G-7EVW8MX8Z9` Measurement ID.

Tell me that number, or run things yourself with it inline.

## Then

```bash
cd /home/dan/directory-thewall

# verify auth and discover the property id
node ga4-admin.mjs whoami

# the diagnosis we're currently stuck on
GA4_PROPERTY_ID=<id> node ga4-admin.mjs diagnose

# Task A, automated
GA4_PROPERTY_ID=<id> node ga4-admin.mjs create-dims
```

## Security notes

- **The JSON key is a live secret.** Anyone holding it has Editor access to the GA4 property
  until it's revoked. It is gitignored; keep it out of Drive, Slack and email.
- **Revoke any time:** Google Cloud → Service Accounts → Keys → delete the key, and/or GA4 →
  Property access management → remove the user. Both take effect immediately.
- **Scope is one property.** The service account sees only the GA4 properties you explicitly
  add it to — not your other 25 GSC properties, not your Google account, nothing else.
- **Downgrade later:** if you'd rather I only read, set the role to Viewer. Everything except
  `create-dims` still works.

# The Breakthrough Room™: next deployment steps

**Stage: private integration testing, not a public launch.** All five approved room images and game pages are preserved. Your public Kajabi page should continue pointing at the already-tested version until the integration passes end-to-end tests.

## 1. Keep the current site safe

Your game is hosted at `https://tangerine-shortbread-f0bea2.netlify.app/` and embedded at `https://kingdomfitlife.com/breakthroughroom`. Do **not** replace this production deployment with the staging kit from Netlify Drop. The current public game is not connected to real results email.

## 2. Connect a Git repository to Netlify

The included `netlify/functions/submit-results.mjs` requires Netlify Functions and an npm dependency (`@netlify/blobs`). A repository-based Netlify deploy is the recommended route. Create a **private** GitHub repository (or another Netlify-supported Git provider) and place all files from this directory at the repository root. In Netlify, choose **Add new project → Import an existing project**, connect the repository, and use a **new staging site**, leaving the current site alone. The included `netlify.toml` specifies the publish directory and functions folder.

No API key belongs in the repository, game code, or chat.

## 3. Configure email provider privately

Verify a domain you control with the transactional email provider (Resend is used in the sample backend). Set these environment variables inside the **staging site's Netlify UI**:

- `ENABLE_RESULTS=false` for initial deployment
- `RESEND_API_KEY` = your secret key (set only inside Netlify)
- `FROM_EMAIL` = an address on your verified domain, such as `blueprint@kingdomfitlife.com`, **only after verification**
- `COACH_EMAIL=thrive@kingdomfitlife.com`
- `GAME_ORIGIN` = the exact HTTPS origin of the new staging Netlify site, e.g. `https://example.netlify.app`

Visit `https://YOUR-STAGING-SITE/.netlify/functions/status`. If it returns JSON including `"configured":false`, backend emails are correctly disabled. Do **not** switch to true yet.

## 4. Test only with your own address

When sending domain is verified and the backend has been secured (see next section), set `ENABLE_RESULTS=true`, redeploy if necessary, and complete all five rooms with your own test email. Confirm both a participant Blueprint and the notification to `thrive@kingdomfitlife.com`, and ensure results unlock **only after** a successful server response. Test missing answers, failed mail, duplicate clicks, and multiple browser/device sizes.

## 5. Required work before public intake

The staging endpoint is **not production-hardened**: it needs rate limiting or bot protection, idempotency against duplicate emails, deletion/retention controls and privacy notice, tighter server-side verification, and proper handling when one email succeeds and the other fails. Also, it currently does **not** create Kajabi contacts. The existing Kajabi Form ID `2149757217` was tested on Kajabi separately, but must be integrated through a supported Kajabi connection/API or another verified workflow rather than assuming the embed script proves success.

The assessment contains sensitive personal reflections. Obtain an explicit privacy notice and avoid sending detailed personal disclosures in the coach alert.

## 6. Roll out only after verified end-to-end test

After security work and confirmed Kajabi sync, deploy the same tested code to the main Netlify site and leave the Kajabi iframe pointing to that site. Remove the test-edition banner only after the game truly collects and delivers leads.

### What you can do next

Create a private Git repository and link it to a **new staging site** in Netlify. Then tell me whether the staging site shows the Grand Foyer and whether its `/\.netlify/functions/status` endpoint loads. Do not share API keys.

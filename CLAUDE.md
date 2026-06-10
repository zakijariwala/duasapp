# CLAUDE.md — Community Empowerment Hub

This file is the authoritative working agreement for any Claude Code agent building or maintaining this project. Read it before touching anything.

---

## What this project is

A community resources hub for the Shia Khoja community of Mumbai. One place to find free, trustworthy guidance for practical life (jobs, taxes, GST, insurance, documents) and faith/community life (prayer, jamaat services, welfare).

**Spec:** `docs/PROJECT_SPEC.md`  
**Decisions log:** `docs/decisions.md`

---

## Non-negotiable rules

1. **Sandbox first.** All Airtable work starts in the sandbox base. Never write to the production base without explicit owner sign-off after Phase 2.
2. **Never fabricate factual content.** Any factual claim touching money, law, tax, or health must cite a whitelisted authoritative source (see `docs/decisions.md`). No invented tax figures, premiums, thresholds, or deadlines — ever. If a URL can't be verified, the record stays `Status = In Review` with a note.
3. **Propose, don't publish.** Agents (scripts, this agent) never set `Status = Published` except via the T0 auto-apply path (clean URL redirects only). Everything else goes to the `Proposals` table for human approval.
4. **Secrets only in `.env` / Actions secrets.** Never commit credentials. Always ship `.env.example` with placeholder values.
5. **Confirm before any create/modify/delete in owner's accounts.** Never delete data without explicit per-action approval.
6. **Log every deviation** from the spec in `docs/decisions.md`.
7. **For Claude/Anthropic specifics** (model IDs, API params), verify against https://docs.claude.com — never rely on training memory.

---

## Autonomy tiers (who can change what)

| Tier | What | Approval |
|------|------|----------|
| T0 | Pure URL redirects, formatting fixes | Auto-applied; logged as Proposal for audit |
| T1 | New Now entries, directory entries, explainer drafts, translation drafts | One-tap human approve |
| T2 | Any change touching numbers affecting money, law, tax, or health | Human must open the cited Evidence URL before approving |
| T3 | Community equivalents, welfare contacts, marja rulings, faith-specific guidance | Human-only; agents flag staleness only, never draft |

---

## Platform decisions (from `docs/decisions.md`)

| Decision | Value |
|----------|-------|
| System of record | Airtable (sandbox → production after Phase 2) |
| Languages | English (primary) + Gujarati summaries (fields seeded empty) |
| Runner | GitHub Actions (zakijariwala/duasapp, `/scripts`, `.github/workflows`) |
| Public face | Cloudflare Pages (static site reading Airtable API) |
| Digest email | jariwalazaki@gmail.com |
| Editor name | TBD — owner to provide before Phase 2 publish |
| Phase 4 (agentic) | Deferred — no API key yet |

---

## Repository layout

```
/
├── CLAUDE.md                  ← this file
├── .env.example               ← env var template (never commit .env)
├── docs/
│   ├── PROJECT_SPEC.md        ← full build spec (authoritative)
│   └── decisions.md           ← all owner decisions & deviations
├── scripts/
│   ├── seed_airtable.py       ← Phase 2: load seed content
│   ├── link_checker.py        ← Phase 3: check published URLs
│   ├── staleness_scan.py      ← Phase 3: flag overdue reviews
│   ├── digest.py              ← Phase 3: weekly email digest
│   └── (phase4/...)           ← Phase 4: agentic layer (deferred)
├── site/                      ← Phase 5: Cloudflare Pages static site
│   ├── index.html
│   ├── style.css
│   └── app.js
└── .github/
    └── workflows/
        └── weekly.yml         ← Phase 3: scheduled cron job
```

---

## Phases & gates

| Phase | What | Done when |
|-------|------|-----------|
| 0 | Discovery — ask questions, record decisions, generate CLAUDE.md | Owner confirms `docs/decisions.md` ✓ |
| 1 | Schema — Airtable sandbox: 4 tables, all fields, views, Suggestions form | Owner can open base and see views + form |
| 2 | Seed content — ~50–70 records via API, Status = In Review | ≥40 records Published after owner's first pass |
| 3 | Plumbing — link checker, staleness scan, weekly digest via Actions | Owner receives a real dry-run digest |
| 4 | Agentic layer — annual updater (T2), Now scanner (T1), translation drafter | Proposals appear with evidence; nothing self-publishes outside T0 |
| 5 | Face & reach — Cloudflare Pages site, QR generator, monthly digest | QR resolves on phone; owner approves sample digest |

**Always pause at phase gates and wait for owner go-ahead before proceeding.**

---

## Content templates (quick reference)

- **Directory Entry:** what it is (1–2 lines) · who it's for · URL/address/phone · cost · language · last checked
- **Explainer:** what is it · why it matters · who needs it · how to do it (steps) · cost & time · official links · common mistakes & scams · last updated (FY stamp for tax/scheme content)
- **Community Equivalent:** T3 human-only — contact person/process, eligibility, link to external counterpart
- **Update (Now):** 2–4 sentences · link · tags · explicit expiry/review date

---

## Scripts must be

- Idempotent (safe to re-run)
- Runnable unattended (no interactive prompts)
- Rate-limited and retry-polite against Airtable and any external APIs
- Stamping `Last checked` and recomputing `Review due` on every applied change

---

## Commit conventions

Small commits with clear messages. Format: `type(scope): description`  
Examples: `feat(schema): add Proposals table`, `fix(seed): correct ITR explainer source URL`, `chore(docs): update decisions after Phase 1 sign-off`

# Community Empowerment Hub — Build Spec & Agent Brief

**Audience of this document:** a coding agent (Claude Code) starting with zero prior context.
**Owner:** [YOUR NAME], member of the Shia Khoja community, Mumbai.

## How to use this file

Option A — open Claude Code in an empty project folder and paste this entire document as your first message.
Option B — save it as `docs/PROJECT_SPEC.md` in a new repo and tell Claude Code: *“Read docs/PROJECT_SPEC.md fully, then begin at Phase 0.”*

**Agent, your order of operations:** (1) read this whole spec, (2) ask the Phase 0 questions in §11 and wait for answers, (3) record decisions in `docs/decisions.md`, (4) generate a `CLAUDE.md` capturing the conventions in §10, (5) proceed phase by phase, pausing at each phase gate for the owner’s go-ahead. Do not create, modify, or delete anything in the owner’s Airtable/Notion/Google accounts without explicit confirmation.

-----

## 1. Mission & background

Build a **community resources hub** for the Shia Khoja community of Mumbai: one place where anyone — student, parent, senior, homemaker, professional, business owner — can find free, trustworthy resources and plain-language guidance for **both** practical life (jobs, certifications, taxes, GST, PF, insurance, business registration, documents, scams) **and** faith/community life (prayer resources, jamaat services, welfare).

Context that shapes every design decision:

- **Audience is mixed:** ages 8 to 80, varying digital literacy, heavy WhatsApp usage. Many elders will only ever meet this hub through a WhatsApp link or a QR code at the imambargah.
- **Bilingual ambition:** English first; Gujarati (and possibly Urdu) summaries to follow. Schema must support translations from day one even if content arrives later.
- **The differentiator:** every external resource is, where possible, **paired with the community’s own equivalent** (e.g., MUDRA loans ↔ jamaat qard-e-hasan scheme; national scholarships ↔ community education fund). No generic website can replicate this pairing.
- **The failure mode to design against:** staleness through neglect. The hub must largely maintain itself, with **~15 minutes/week** of human approval, not hours of hunting.

## 2. Design principles (non-negotiable)

1. **Stable core, living edge.** Evergreen knowledge (what insurance is, how to read a payslip) is physically separated from fast-churning content (AI tools, hiring trends, scheme changes), which lives in a dated **“Now”** layer expected to churn.
1. **Propose, don’t publish.** Automated agents never write directly to published content (one narrow exception, §7 Tier 0). They write to a review queue; a named human approves.
1. **No source, no publish.** Any factual claim touching money, law, tax, or health must carry a citation to a **whitelisted authoritative source** (gov.in portals, regulators, official scheme pages). An LLM’s confident memory is not a source.
1. **Every entry carries a freshness contract:** a velocity tier, a last-checked date, and a review-due date. “Last checked” is visible to readers.
1. **Navigable three ways:** by category, by audience tag (“show me mine”), and by intent (“I want to file my taxes”).
1. **AI-drafted content is labeled,** and a named human editor stands behind everything published.
1. **Claude Code is the builder, not the runtime.** The live system must run unattended: scheduled scripts + REST APIs + the Anthropic API. Nothing in production may depend on an interactive Claude Code session being open.

## 3. Information architecture

### 3.1 Categories (organized by what people are trying to *do*)

|#|Category                                |Sub-areas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|-|----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|1|**Learn**                               |School & exam prep; free certifications & courses; languages & communication; libraries & study spaces; scholarships & education aid; tutoring & mentorship                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|2|**Earn**                                |Job portals; internships; resume & interview prep; career guidance; government job & exam notifications                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|3|**Build** (business)                    |Registration & licences (Udyam/MSME, Shop & Establishment, FSSAI, IEC; proprietorship vs LLP vs Pvt Ltd); funding (MUDRA, Startup India, community qard-e-hasan); GST & bookkeeping basics; marketing basics (Google Business Profile); trademark basics; community business directory & networking                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|4|**Grow** (money, documents & life admin)|Money basics (budgeting, emergency fund, FD/RD, SIP/mutual funds, demat, CIBIL); taxes & compliance (PAN, ITR, GST, TDS, Form 16/26AS/AIS, Maharashtra professional tax, advance tax); salary & retirement (PF/EPF/UAN, ESIC, gratuity, NPS, payslip literacy, Atal Pension Yojana); insurance (health, term life, motor, personal accident; PMJJBY/PMSBY/Ayushman Bharat); IDs & documents (Aadhaar, PAN, passport, DL, voter ID, ration card, certificates, DigiLocker); wills, nomination & succession; digital skills & scam/fraud awareness; property, rent & legal (rent agreements, stamp duty, RERA, consumer rights, FIR & cybercrime reporting, RTI); family finance (Sukanya Samriddhi, education planning, senior-citizen benefits)|
|5|**Support**                             |Health (community clinics/dispensaries, camps, blood donation, mental health, elderly & disability care, medical financial aid); welfare (matrimonial, bereavement support, ration help, widows & orphans, counselling, legal aid)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|6|**Faith**                               |Quran & tafsir; du’a resources; majalis & lecture archives; namaz timetables & qibla; Islamic calendar; masjid/imambargah locations & timings; marja rulings; Islamic education (madrasah/tarbiyah, Arabic & Quran classes, hifz); children’s Islamic content; khums/zakat guidance                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|7|**Community**                           |Events calendar; announcements; community business directory; sports & recreation; women’s/seniors’/youth groups; volunteering                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|8|**Now** (the living edge)               |AI tools & how to use them (resumes, study, small-business marketing); resume & interview trends; in-demand skills & hiring trends; new/changed government schemes; scholarship & exam deadlines; community opportunities. **Every entry is dated and expected to expire.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

### 3.2 Audience tags (multi-select on every entry)

Student · Youth & Children · Parent · Homemaker · Professional · Business Owner · Senior · Everyone

### 3.3 Intent entry points (“I want to…”)

file my taxes · get a GST number · check/withdraw my PF · find a job · write a resume · get an internship · start a business · get a business loan · learn a skill / get certified · get a scholarship · get insured · fix my documents (Aadhaar/PAN/passport) · plan my savings · make a will / set nominations · report a scam or cybercrime · find prayer times · get health help · get welfare support

(Implement as a multi-select field; the public interface surfaces these as quick filters.)

## 4. Content types & templates

Every record is exactly one of four types:

1. **Directory Entry** — a link out. Template: *what it is (1–2 lines) · who it’s for · how to access (URL/address/phone) · cost · language · last checked.*
1. **Explainer** — a plain-language guide stored in the record body (markdown). Template: *what is it · why it matters / do I need it · who needs it · how to do it (steps) · cost & time · official links · common mistakes & scams to avoid · last updated (with FY stamp for tax/scheme content).*
1. **Community Equivalent** — the jamaat’s own offering, linked to its external counterpart. Includes contact person/process and eligibility. **Human-only content** (§7 Tier 3).
1. **Update** — a short dated post in **Now**: 2–4 sentences, link, tags, an explicit expiry/review date.

## 5. Platform choice & data model

### 5.1 Recommendation: Airtable as the system of record

Default to **Airtable** unless the owner overrides in Phase 0: structured fields, multi-select filtering, saved views, native forms (for community suggestions), automations, and a solid REST API for the maintenance scripts. Notion is better at long prose but worse at structured filtering and queue mechanics; it can be added later as a prettier public face that mirrors Airtable. Check current Airtable free-plan record limits during Phase 0 and note them in `docs/decisions.md`; design to stay within them initially.

Build everything first in a **sandbox base**; clone to production only after Phase 2 sign-off.

### 5.2 Tables

**`Resources`** (the heart of the hub)

|Field                    |Type                |Notes                                                      |
|-------------------------|--------------------|-----------------------------------------------------------|
|Title                    |text                |required                                                   |
|Type                     |single select       |Directory Entry / Explainer / Community Equivalent / Update|
|Category                 |single select       |the 8 categories in §3.1                                   |
|Subcategory              |single select       |seed from §3.1; extend as needed                           |
|Audience                 |multi-select        |§3.2                                                       |
|Intent                   |multi-select        |§3.3                                                       |
|Summary (EN)             |long text           |1–2 lines, plain language                                  |
|Who it’s for             |text                |one line                                                   |
|URL                      |url                 |primary access link                                        |
|Access details           |long text           |address / phone / process, if offline                      |
|Cost                     |single select       |Free / Free with paid option / Govt fee / Paid             |
|Language                 |multi-select        |English / Gujarati / Urdu / Hindi                          |
|Velocity                 |single select       |Evergreen / Annual / Live                                  |
|Last checked             |date                |visible to readers                                         |
|Review due               |date                |set by script per §6 cadence                               |
|Source URL               |url                 |authoritative basis for any factual claims                 |
|Status                   |single select       |Draft / In Review / Published / Flagged / Archived         |
|AI-drafted               |checkbox            |label carried to the public face                           |
|Editor                   |text/collaborator   |named human who approved                                   |
|Paired equivalent        |link → Resources    |external ↔ community pairing                               |
|Body                     |long text (markdown)|Explainer content                                          |
|Title (GU) / Summary (GU)|text                |Gujarati backfill                                          |
|Notes                    |long text           |internal                                                   |

**`Proposals`** (the review queue — agents write here, humans decide)

|Field                  |Type            |Notes                                                                |
|-----------------------|----------------|---------------------------------------------------------------------|
|Resource               |link → Resources|empty when proposing a brand-new entry                               |
|Proposal type          |single select   |New entry / Update / Dead link / Stale review / Archive / Translation|
|Autonomy tier          |single select   |T0 / T1 / T2 / T3 (§7)                                               |
|Proposed change        |long text       |full draft or precise description of the diff                        |
|Evidence URL           |url             |**mandatory for T2**                                                 |
|Agent rationale        |long text       |why this is being proposed                                           |
|Decision               |single select   |Pending / Approved / Rejected                                        |
|Decided by / Decided on|text / date     |                                                                     |
|Applied                |checkbox        |set by script after writing to `Resources`                           |

**`Suggestions`** (community submissions via Airtable form): Resource name · Link · What it is · Who it helps · Your name · Contact (optional) · Status (New / Triaged / Promoted / Declined). Weekly triage promotes good ones into `Proposals`.

**`Source Whitelist`**: Domain · Scope · Notes. Seed: incometax.gov.in, gst.gov.in, epfindia.gov.in, esic.gov.in, pib.gov.in, rbi.org.in, irdai.gov.in, mudra.org.in, startupindia.gov.in, udyamregistration.gov.in, scholarships.gov.in, ncs.gov.in, nptel.ac.in, swayam.gov.in, uidai.gov.in, digilocker.gov.in, passportindia.gov.in, cybercrime.gov.in, consumerhelpline.gov.in, jansuraksha.gov.in, pmjay.gov.in, mahagst.gov.in, maharashtra.gov.in, al-islam.org, duas.org, world-federation.org. (Owner extends in Phase 0, especially jamaat-specific domains.)

### 5.3 Views

- **Public:** Published by Category (grouped) · **Now Feed** (Type = Update, Published, newest first) · per-audience filtered views or interface filters · “Recently updated” (sorted by Last checked desc — this strip is what proves the hub is alive).
- **Ops:** Review Queue (Proposals, Decision = Pending, grouped by tier) · Overdue (Review due < today, Published) · Flagged links · Suggestions inbox.

## 6. Freshness engine (velocity tiers → cadences)

|Velocity     |Examples                                                      |Review cadence                                                      |Mechanism                                                          |
|-------------|--------------------------------------------------------------|--------------------------------------------------------------------|-------------------------------------------------------------------|
|**Evergreen**|what insurance is, payslip literacy, du’a resources           |12 months                                                           |staleness scan flags; human skims                                  |
|**Annual**   |tax slabs, GST thresholds, scheme premiums, scholarship cycles|every Feb–Apr after the Union Budget; stamp “Updated for FY 20XX–XX”|agent drafts updates from whitelisted sources (T2)                 |
|**Live**     |everything in **Now**                                         |30-day expiry/review                                                |agent proposes archive at expiry; Now scanner proposes replacements|

`Review due` = `Last checked` + cadence (script-maintained).

## 7. Agentic maintenance loop

### 7.1 Autonomy tiers — match autonomy to stakes

- **T0 — Auto-apply (logged, no approval):** pure link redirects (URL moved, content identical) and formatting fixes. The *only* tier allowed to touch Published records directly; every T0 action is logged as an auto-approved Proposal for audit.
- **T1 — One-tap approve:** new Now entries, new directory entries, drafted explainers, Gujarati translation drafts. Low stakes, high churn.
- **T2 — Verify against source:** **any change touching numbers affecting money, law, tax, or health.** Draft must cite a whitelisted Evidence URL; the human opens the source before approving. Never silent.
- **T3 — Human-only:** community equivalents, welfare contacts, marja rulings / faith-specific guidance, endorsements. Agents may flag staleness here but never draft content.

### 7.2 The weekly job (scheduled, unattended)

1. **Link check** every Published URL (follow redirects). Dead → flag + Proposal (Dead link); clean redirect → T0 auto-fix + log.
1. **Staleness scan:** `Review due` passed → create a Stale-review Proposal.
1. **Annual updater:** for overdue Annual items, fetch the whitelisted source page(s), use the Anthropic API to extract current values, draft the update **with citation** → T2 Proposal.
1. **Now scanner:** fetch a curated feed list (PIB, income-tax portal news, scheme portals, NPTEL announcements; owner curates the list), summarize candidates → T1 Proposals with expiry dates.
1. **Suggestions triage assist:** summarize new community submissions for the weekly digest.
1. **Digest:** one summary (counts + top pending items + direct links to the Review Queue) → email in Phase 3; WhatsApp delivery is a later, separately-decided add-on (provider/cost question for the owner).
1. **Monthly:** propose archiving expired Now items. **Quarterly:** generate a human spot-check sample (~10 random Published records) — something must still notice if the agent itself breaks.

### 7.3 Runtime & safeguards

- Runner: **GitHub Actions scheduled workflows** (free tier, cron) executing Python scripts; alternative: local cron. Secrets (Airtable PAT, Anthropic API key) live in repo/Actions secrets and `.env` locally — never in code.
- LLM calls go through the **Anthropic API** from scripts. Pick a current model and verify the model ID against <https://docs.claude.com> at build time; record the choice and a monthly budget cap in `docs/decisions.md`. Add basic spend guards (max items drafted per run).
- Hard rules in code: no Proposal of T2 without Evidence URL on the whitelist; agents never set Status = Published (except T0 path); idempotent runs; rate-limit and retry politely; every applied change stamps `Last checked` and recomputes `Review due`.

## 8. Build phases & acceptance criteria

**Phase 0 — Discovery (no writes anywhere).** Ask §11, record answers in `docs/decisions.md`, generate `CLAUDE.md`.
*Done when:* owner confirms decisions file.

**Phase 1 — Schema.** Create the sandbox base: 4 tables, all fields, views, the Suggestions form. Smoke-test a record round-trip via API.
*Done when:* owner can open the base and see working views + form.

**Phase 2 — Seed content.** Load §9 starter entries (~50–70 records) via API: Status = In Review, AI-drafted = true, Velocity set, Source URL where factual. **Verify each URL by fetching where network access allows; anything unverifiable stays In Review with a note.** Never invent scheme figures, thresholds, or premiums — explainer drafts describe *process and concepts* and link out for current numbers, or wait for the T2 pipeline.
*Done when:* the owner/editor has done a first human pass and ≥40 records are Published.

**Phase 3 — Plumbing.** Repo with `/scripts`, `/docs`, `.env.example`, `CLAUDE.md`; link checker; staleness scan; weekly email digest via Actions cron.
*Done when:* owner receives a real dry-run digest.

**Phase 4 — Agentic layer.** Annual updater (T2 with citations), Now scanner (T1), translation drafter (T1), monthly/quarterly jobs.
*Done when:* Proposals appear with evidence and nothing publishes itself outside T0.

**Phase 5 — Face & reach.** Public shared view/interface; QR-code generator script pointing at it; monthly WhatsApp-ready digest (clean text + optional PDF export). Optional later: a simple static site or Notion mirror reading from Airtable.
*Done when:* QR resolves on a phone and the owner approves a sample community digest.

## 9. Seed content (starter set — verify every URL before publishing)

**Learn:** Khan Academy (khanacademy.org) · Coursera (coursera.org — audit free; financial aid for certificates) · edX (edx.org) · freeCodeCamp (freecodecamp.org) · Harvard CS50 (cs50.harvard.edu/x) · MIT OpenCourseWare (ocw.mit.edu) · NPTEL (nptel.ac.in) · SWAYAM (swayam.gov.in) · Google Career Certificates (grow.google/certificates) · HubSpot Academy (academy.hubspot.com) · Google Skillshop (skillshop.withgoogle.com) · Meta Blueprint (facebook.com/business/learn) · National Scholarship Portal (scholarships.gov.in) · Skill India Digital (skillindiadigital.gov.in)
**Earn:** National Career Service (ncs.gov.in) · Internshala (internshala.com) · Naukri (naukri.com) · LinkedIn (linkedin.com) · Indeed (indeed.co.in)
**Build:** Udyam registration (udyamregistration.gov.in) · Startup India (startupindia.gov.in) · MUDRA (mudra.org.in) · FSSAI/FoSCoS (foscos.fssai.gov.in) · IEC via DGFT (dgft.gov.in) · Google Business Profile (google.com/business)
**Grow:** Income Tax portal (incometax.gov.in) · GST portal (gst.gov.in) · EPF/UAN (epfindia.gov.in; passbook.epfindia.gov.in) · ESIC (esic.gov.in) · eNPS (enps.nsdl.com) · DigiLocker (digilocker.gov.in) · UIDAI (uidai.gov.in) · Passport Seva (passportindia.gov.in) · CIBIL free score (cibil.com) · Jansuraksha — PMJJBY/PMSBY (jansuraksha.gov.in) · Ayushman Bharat (pmjay.gov.in) · National Consumer Helpline (consumerhelpline.gov.in) · Cybercrime reporting (cybercrime.gov.in) · RTI portal (rtionline.gov.in) · Maharashtra GST/professional tax (mahagst.gov.in)
**Faith (generic seeds; jamaat-specific items are T3, supplied by owner):** Al-Islam.org · Duas.org · The World Federation of KSIMC (world-federation.org)

**Explainer backlog (draft as Type = Explainer, In Review):** What is GST & who needs a GSTIN · How to file your first ITR · What is PF/EPF & how to check your balance · What is ESIC · Reading your payslip (CTC vs in-hand) · Why insurance exists & the 4 types that matter · Term life vs investment-linked policies · What is a credit score & how to check it free · Wills, nomination & succession basics · Spotting UPI & phone scams (elder-friendly) · Proprietorship vs LLP vs Pvt Ltd · Rent agreements & stamp duty in Maharashtra · NPS vs APY · DigiLocker in 5 minutes · How to report cybercrime online

**Now-layer starter topics (Type = Update, dated):** using free AI assistants to draft an ATS-friendly resume · AI for study notes & exam prep · AI for small-business marketing copy · current in-demand skills snapshot · this quarter’s scholarship & exam deadlines · post-Budget scheme changes summary

## 10. Working agreements for the coding agent (→ also distill into `CLAUDE.md`)

1. Sandbox first; production only after Phase 2 sign-off. Confirm before any create/modify/delete in the owner’s accounts; never delete data without explicit per-action approval.
1. Secrets only in `.env` / Actions secrets; ship `.env.example`; never commit credentials.
1. **Never fabricate factual content.** Every factual seed needs a fetched, working Source URL or it stays In Review. No invented tax figures, premiums, thresholds, or deadlines — ever.
1. Propose-don’t-publish applies to *you* during the build: seed everything as In Review for the human editor.
1. Small commits with clear messages; scripts must be idempotent and runnable unattended (you are the builder, not the runtime).
1. This spec is authoritative; log every deviation or owner decision in `docs/decisions.md`.
1. For anything Claude/Anthropic-specific (model IDs, API parameters, Claude Code configuration), verify against <https://docs.claude.com> rather than memory.

## 11. Phase 0 — questions to ask the owner before touching anything

1. **Platform:** Airtable (recommended, §5.1) or Notion? Any existing workspace to use?
1. **Credentials:** I’ll guide you through creating an Airtable Personal Access Token (scoped to one base) and provide where to paste it locally. Do you also have an Anthropic API key for the Phase 4 agent layer, and what monthly spend cap should I enforce?
1. **People:** Who is the named editor (appears on published content)? Any committee members and their categories? Where should the weekly digest go (email address(es) to start)?
1. **Jamaat specifics (T3 content I cannot write):** which jamaat/organization should be referenced, which marja(s) to follow for Faith content, and the official community offerings to pair (qard-e-hasan scheme, education fund, dispensary/clinic, matrimonial bureau — names + contact process).
1. **Languages:** English-only v1, or seed Gujarati summaries immediately?
1. **Runner:** GitHub account available for Actions cron, or prefer local cron on a machine you control?
1. **Distribution:** confirm the public face for v1 (Airtable shared view/interface) and where QR codes will physically go; WhatsApp digest delivery is a later decision — note preferences now.
1. **Whitelist additions:** any domains to add to §5.2’s Source Whitelist (jamaat sites, trusted local sources)?

— end of spec —
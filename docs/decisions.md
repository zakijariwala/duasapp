# Phase 0 Decisions

Recorded: 2026-06-10  
Agent: Claude Code (claude-sonnet-4-6)  
Owner: jariwalazaki@gmail.com

---

## Platform

**Decision:** Airtable  
**Rationale:** Spec default. Structured fields, multi-select filtering, native forms, REST API, and free-tier record limits are sufficient for v1.  
**Action:** Build everything in a sandbox base first; clone to production only after Phase 2 sign-off.  
**Note:** Check Airtable free-plan record limit at base creation time and record here. As of spec writing, free plan allows 1,000 records/base; confirm this is sufficient for seed content (~50–70 records) with ample room to grow.

---

## Languages

**Decision:** English + Gujarati summaries from v1  
**Rationale:** Schema includes `Title (GU)` and `Summary (GU)` fields from day one. English content is primary; Gujarati fields are seeded empty and filled over time. This avoids a painful schema migration later.

---

## Runner

**Decision:** GitHub Actions (scheduled workflows)  
**Repository:** zakijariwala/duasapp  
**Rationale:** Free-tier cron, secrets management via repo secrets, and the repo is already available. Scripts live in `/scripts`; workflows live in `.github/workflows`.  
**Secrets required:** `AIRTABLE_PAT`, `AIRTABLE_BASE_ID` (Phase 1+); `ANTHROPIC_API_KEY` (Phase 4, deferred).

---

## Public face (v1)

**Decision:** Cloudflare Pages (static site)  
**Rationale:** Owner preference. A lightweight static HTML/JS site hosted on Cloudflare Pages, reading from the Airtable API. Free hosting, fast CDN, easy custom domain. QR codes will point to the Cloudflare Pages URL.  
**Note:** The spec's default was an Airtable shared interface; Cloudflare Pages gives more design control at no extra cost. The static site is still built on top of Airtable as the system of record — no change to the data model.

---

## Editor

**Decision:** TBD — owner to provide full name before Phase 2 seed content is published  
**Digest email:** jariwalazaki@gmail.com  
**Action:** Add editor name to this file once confirmed. The `Editor` field on all seed records will be left as "TBD" until then.

---

## Jamaat / T3 content

**Decision:** All T3 fields (Community Equivalents, Faith content, welfare contacts, marja rulings) left as placeholders.  
**Rationale:** T3 content is human-only; agent cannot draft it. Owner will fill in:
- Jamaat / organization name
- Marja(s) followed for Faith content
- Community offerings: qard-e-hasan scheme, education fund, dispensary/clinic, matrimonial bureau (names + contact process)

These records will be created with Status = Draft and a note: "T3 — owner must complete."

---

## Anthropic API / Phase 4

**Decision:** Phase 4 (agentic maintenance layer) is deferred.  
**Rationale:** No API key provided yet. Phases 1–3 (schema, seed content, plumbing/link-checker) will be built first.  
**When ready:** Provide `ANTHROPIC_API_KEY` as a GitHub Actions secret. Revisit model choice and monthly spend cap at that time. Spec guidance: verify model ID against https://docs.claude.com at build time; default cap suggestion is $10–$25/month for a low-volume hub.

---

## Source whitelist

**Decision:** Use the 25 default domains from §5.2 of the spec.  
**Domains:**
```
incometax.gov.in
gst.gov.in
epfindia.gov.in
esic.gov.in
pib.gov.in
rbi.org.in
irdai.gov.in
mudra.org.in
startupindia.gov.in
udyamregistration.gov.in
scholarships.gov.in
ncs.gov.in
nptel.ac.in
swayam.gov.in
uidai.gov.in
digilocker.gov.in
passportindia.gov.in
cybercrime.gov.in
consumerhelpline.gov.in
jansuraksha.gov.in
pmjay.gov.in
mahagst.gov.in
maharashtra.gov.in
al-islam.org
duas.org
world-federation.org
```
**Note:** Owner should add jamaat-specific domains and any trusted local Mumbai sources when T3 content is ready.

---

## Deviations from spec

| Date | Deviation | Reason |
|------|-----------|--------|
| 2026-06-10 | Public face changed from Airtable shared interface to Cloudflare Pages | Owner preference |

---

*Update this file with every owner decision or deviation from the spec throughout the project lifecycle.*

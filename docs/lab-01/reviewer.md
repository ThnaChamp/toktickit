# Lab 1 Peer Review Record

## My Information

| Field | Detail |
|-------|--------|
| **Name** | [Thanatip Nitinantakul] |
| **Student ID** | [67070501023] |
| **GitHub Username** | [@ThnaChamp](https://github.com/ThnaChamp) |

---

## Peer Reviewer (Primary)

| Field | Detail |
|-------|--------|
| **Reviewer Name** | [Natthawat Primsirikunawut] |
| **Reviewer Student ID** | [67070501027] |
| **Reviewer GitHub Username** | [N0TAW00D](https://github.com/N0TAW00D) |

---

## Peer Reviewer (Second)

| Field | Detail |
|-------|--------|
| **Reviewer Name** | [Kittithat Disthanakornkun] |
| **Reviewer Student ID** | [67070501004] |
| **Reviewer GitHub Username** | [JeffMerry](https://github.com/JeffMerry) |

---

## Pull Requests Reviewed

> My partner reviewed the following PRs that I submitted.

### PR 1 — feature/1-project-foundation → lab1-staging

| Field | Detail |
|-------|--------|
| **PR Link** | https://github.com/ThnaChamp/toktickit/pull/5 |
| **Reviewer** | [Natthawat Primsirikunawut] |
| **Review Comment** | "[You have done a great setup. NIT you haven't put env.example up here.]" |
| **My Response** | Added `.env.example` to the repository. |
| **Outcome** | Approved and merged |   

---

### PR 2 — feature/2-health-check → lab1-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/6](https://github.com/ThnaChamp/toktickit/pull/6) |
| **Reviewer** | Kittithat Disthanakornkun ([@JeffMerry](https://github.com/JeffMerry)) |
| **Review Comment** | "[Everything is fine. A debug console.log has been generated to check port usage.]" |
| **My Response** | No changes required. PR was approved and merged. |
| **Outcome** | Approved and merged |

---

### PR 3 — feature/3-category-seed → lab1-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/7](https://github.com/ThnaChamp/toktickit/pull/7) |
| **Reviewer** | Natthawat Primsirikunawut ([@N0TAW00D](https://github.com/N0TAW00D)) |
| **Review Comment** | "[All things was great.]" |
| **My Response** | No changes required. PR was approved and merged. |
| **Outcome** | Approved and merged |

---

### PR 4 — feature/4-category-list → lab1-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/8](https://github.com/ThnaChamp/toktickit/pull/8) |
| **Reviewer** | Natthawat Primsirikunawut ([@N0TAW00D](https://github.com/N0TAW00D)) |
| **Review Comment** | "[Can you also attach the test result of those testing into the repos pls?]" |
| **My Response** | Added test result screenshots under `docs/lab-01/screenshots/` and embedded them in `docs/lab-01/tests.md`. |
| **Outcome** | Approved and merged |

---

## Pull Requests I Reviewed for My Partner

> I reviewed the following PRs submitted by my partner.

### PR A — [feature/3-category-seed] → lab1-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/7](https://github.com/JeffMerry/toktickit/pull/7) |
| **My Review Comment** | "[Could you clarify which command you used to apply the schema.prisma to the database? I'm asking because using 'npx prisma migrate dev' normally generates a migration history folder.]" |
| **Partner's Response** | "[In the early development and testing phase, the npx prisma db push command was used to directly create tables in PostgreSQL using the schema.prisma file for quick initial system testing. To ensure compatibility, the npx prisma migrate dev command was needed to create a prisma/migrations/ folder along with a migration.sql file for correct execution on other systems.]" |
| **Outcome** | Approved and merged |

---

### PR B — [partner's feature branch] → lab1-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/partner-repo/pull/XX](https://github.com/partner-repo/pull/XX) |
| **My Review Comment** | "[Paste the actual comment you left on your partner's PR]" |
| **Partner's Response** | "[Describe how your partner responded to your review]" |
| **Outcome** | Approved and merged |

# Lab 2 Peer Review Record

## My Information

| Field | Detail |
|-------|--------|
| **Name** | Thanatip Nitinantakul |
| **Student ID** | 67070501023 |
| **GitHub Username** | [ThnaChamp](https://github.com/ThnaChamp) |

---

## Peer Reviewer (Primary)

| Field | Detail |
|-------|--------|
| **Reviewer Name** | Kittithat Disthanakornkun |
| **Reviewer Student ID** | 67070501004 |
| **Reviewer GitHub Username** | [JeffMerry](https://github.com/JeffMerry) |

---

## Pull Requests Reviewed

> My partner reviewed the following PRs that I submitted.

### PR 1 — feature/1-specifications → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/18](https://github.com/ThnaChamp/toktickit/pull/18) |
| **Reviewer** | Kittithat Disthanakornkun ([@JeffMerry](https://github.com/JeffMerry)) |
| **Review Comment** | "Complete .md information is ready to work on the next step." |
| **My Response** | Thank for review Kittithat. |
| **Outcome** | Approved and merged |

---

### PR 2 — feature/2-requester-context → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/19](https://github.com/ThnaChamp/toktickit/pull/19) |
| **Reviewer** | Kittithat Disthanakornkun ([@JeffMerry](https://github.com/JeffMerry)) |
| **Review Comment** | "In schema.prisma under the Attachment model, since onDelete is not explicitly specified in the relation, Prisma/PostgreSQL defaults to onDelete: Restrict (as seen in the generated SQL file: ON DELETE RESTRICT).<br><br>The issue: If a ticket is deleted (prisma.ticket.delete(...)) while it still has related attachments, the database will throw a foreign key constraint error and block the deletion to prevent orphaned records.<br><br>Therefore, to prevent this issue, should we set it to onDelete: Cascade? What are your thoughts on this?" |
| **My Response** | Thanks for pointing this out but I decided to keep Restrict for now because:<br>1. **No ticket deletion in Lab 2:** We don't have a DELETE /api/tickets endpoint in this sprint, so this won't trigger any errors.<br>2. **Soft delete pattern:** Attachments use soft delete (removedAt) to keep audit history. Keeping Restrict acts as a safety guard against accidental hard deletes. |
| **Outcome** | Approved and merged |

---

### PR 3 — feature/3-create-ticket → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/20](https://github.com/ThnaChamp/toktickit/pull/20) |
| **Reviewer** | Kittithat Disthanakornkun ([@JeffMerry](https://github.com/JeffMerry)) |
| **Review Comment** | "Everything is perfect; detailed tests have been written for various scenarios." |
| **My Response** | Thank for review Kittithat, you can merge now. |
| **Outcome** | Approved and merged |

---

### PR 4 — feature/4-my-ticket → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/21](https://github.com/ThnaChamp/toktickit/pull/21) |
| **Reviewer** | Kittithat Disthanakornkun ([@JeffMerry](https://github.com/JeffMerry)) |
| **Review Comment** | "GET /api/tickets — orderBy is missing a secondary sort (BR-23)<br>Currently orderBy only sorts by a single field chosen by the user, but the spec (BR-23) requires a secondary sort of ticketNumber DESC at all times.<br><br>This matters because createdAt comes from @default(now()), which can genuinely produce duplicate values when multiple tickets are created at (or near) the same instant - e.g. a batch seed script or concurrent requests under load. When the sort key has tied values and there's no tiebreaker, PostgreSQL does not guarantee a stable order across separate queries.<br><br>As a result, pagination can become unstable: records with a tied createdAt may show up on two different pages, or be skipped entirely and never appear on either page. This is a hard bug to catch because it only surfaces when a tie actually occurs.<br><br>Could we add ticketNumber as a secondary sort in the orderBy array?" |
| **My Response** | Thank you for pointing out the problem. I've updated the orderBy logic to use an array where ticketNumber: 'desc' is always appended as the secondary sort (tie-breaker) whenever the primary sort isn't already. |
| **Outcome** | Approved and merged |

---

### PR 5 — feature/5-ticket-detail-attachments → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/22](https://github.com/ThnaChamp/toktickit/pull/22) |
| **Reviewer** | Kittithat Disthanakornkun ([@JeffMerry](https://github.com/JeffMerry)) |
| **Review Comment** | "Everything is in good. Test results have been fully updated." |
| **My Response** | Thank for review Kittithat, you can merge now. |
| **Outcome** | Approved and merged |

---

### PR 6 — feature/6-e2e-testing → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/24](https://github.com/ThnaChamp/toktickit/pull/24) |
| **Reviewer** | Kittithat Disthanakornkun ([@JeffMerry](https://github.com/JeffMerry)) |
| **Review Comment** | "After reviewing the screenshots in artifacts/lab-02/screenshots/, they don't appear to match what's specified in ui-spec.md. Could you please double-check this?" |
| **My Response** | You're right, I'll fix it right away. Updated all screenshot captures using automated Playwright test suite to strictly match the 15 required states in Section 12 of ui-spec.md, and deleted legacy screenshots. |
| **Outcome** | Approved and merged |

---

## Pull Requests I Reviewed for My Partner

> I reviewed the following PRs submitted by my partner Kittithat Disthanakornkun ([@JeffMerry](https://github.com/JeffMerry)).

### PR A — feature/5-lab2-spec-docs → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/11](https://github.com/JeffMerry/toktickit/pull/11) (Commit `c51a73a`) |
| **My Review Comment** | "Everything is complete, great job Kittithat" |
| **Partner's Response** | Changes approved and merged into lab2-staging. |
| **Outcome** | Approved and merged |

---

### PR B — feature/6-lab2-requester-context → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/17](https://github.com/JeffMerry/toktickit/pull/17) (Commit `bd4369f`) |
| **My Review Comment (1)** | "I noticed that createdAt and updatedAt are included in the schema.prisma for the Category and RelatedSystem models, but they aren't mentioned in the specification.md.<br>Could you please explain the reasoning behind adding them?" |
| **Partner's Response (1)** | "Thanks for the sharp catch and review!<br>The addition of createdAt and updatedAt to Category and RelatedSystem was a deliberate database design choice based on the following reasons:<br>1. **Database Auditability & Best Practices:** In production-ready application design, master/reference data models (like Categories and Systems) should maintain timestamp metadata to trace when a record was initially created or last modified for audit purposes.<br>2. **Schema Consistency:** Having standard audit fields across all relational models maintains a uniform Prisma schema pattern throughout the project.<br><br>I have updated docs/lab-02/specification.md to include createdAt and updatedAt for both Category and RelatedSystem models to ensure 100% consistency between our specification and database schema.<br>Thanks again for pointing this out! The PR is ready for approval now." |
| **My Review Comment (2)** | "Thank you for the explanation, now everything is great." |
| **Partner's Response (2)** | "Thank you for the review; everything is ready to merge." |
| **Outcome** | Approved and merged |

---

### PR C — feature/7-lab2-create-ticket-workflow → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/12](https://github.com/JeffMerry/toktickit/pull/12) (Commit `ca306ae`) |
| **My Review Comment** | "Everything is complete and matches the specifications." |
| **Partner's Response** | Changes approved and merged into lab2-staging. |
| **Outcome** | Approved and merged |

---

### PR D — feature/8-lab2-my-tickets-list → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/13](https://github.com/JeffMerry/toktickit/pull/13) (Commit `8a97ab7`) |
| **My Review Comment (1)** | "Everything is set for the UI implementation and testing, but don't forget to update the tests in your tests.md file as well." |
| **Partner's Response (1)** | "Ok i commit update test.md with actual automated test file already." |
| **My Review Comment (2)** | "Great job Kittithat." |
| **Partner's Response (2)** | Changes approved and merged into lab2-staging. |
| **Outcome** | Approved and merged |

---

### PR E — feature/9-lab2-ticket-detail → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/14](https://github.com/JeffMerry/toktickit/pull/14) (Commit `e23d053`) |
| **My Review Comment** | "Everything in this issue is done, Good job." |
| **Partner's Response** | Changes approved and merged into lab2-staging. |
| **Outcome** | Approved and merged |

---

### PR F — feature/10-lab2-e2e-testing → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/15](https://github.com/JeffMerry/toktickit/pull/15) (Commit `3d5c199`) |
| **My Review Comment** | "Everything is done, great job Kittithat. See you again at next lab session." |
| **Partner's Response** | Changes approved and merged into lab2-staging. |
| **Outcome** | Approved and merged |



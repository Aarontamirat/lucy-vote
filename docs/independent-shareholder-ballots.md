# Independent shareholder ballots

Each shareholder owns one ballot per meeting, whether they attend directly or through a representative. The representative handles the paper cards and follows each shareholder's instructions. Representation does not transfer shares or combine choices.

| Card owner | Shareholder ID entered | Weight per selected nominee | Choices |
| --- | --- | --- | --- |
| Yonas, represented by Mekdes | Yonas's shareholder ID | Yonas's attendance snapshot shares | Yonas's instructions |
| Liya, represented by Mekdes | Liya's shareholder ID | Liya's attendance snapshot shares | Liya's instructions |
| Mekdes, also registered attending as a shareholder | Mekdes's shareholder ID | Mekdes's own attendance snapshot shares | Mekdes's instructions |

An external representative has no personal ballot. A shareholder representative's own attendance must be registered independently; representing somebody else does not establish eligibility for their own card.

1. Register each shareholder's direct or represented attendance.
2. Give the representative a separate paper card for each represented shareholder, plus their own card when eligible.
3. Complete and sign each card according to the organization's procedure.
4. In **Record votes**, enter the **Shareholder ID on voting card**. Confirm the displayed shareholder name, representation and own share weight.
5. Copy that card's nominee choices, record them, and confirm **Recorded** before processing the next card.

Choice limits and previously recorded nominees are independent for each shareholder. Retrying a recorded choice does not duplicate it. A Super Admin reversal changes only the specified shareholder's choices. Remove attendance only after that shareholder's recorded choices have been reversed. Another card handled by the same representative does not prevent check-in or removal of an unvoted shareholder.

Reports retain shareholder ballot ownership and show the representative separately. Attendance-type filters distinguish directly attending shareholders, represented shareholders and older combined ballots. Searching a representative's name or ID finds the represented shareholders' cards. Excel exports include the same ownership and representation information. Public projections continue to expose aggregate figures only.

## Existing combined records

Older combined votes remain preserved. They cannot establish the different instructions on individual shareholder cards. The system blocks affected new entries, attendance changes and meeting closure until the combined choices are corrected.

While voting is open, a Super Admin opens **Record votes** using an affected shareholder ID or the historical representative ID, reviews **Correct older combined ballots**, and reverses every listed choice with a reason. Then enter the original shareholder cards separately. Closed historical meeting records remain read-only.

## Verification

`npm test` includes shareholder ballot ownership, independent choices and snapshots, representative-ID rejection, isolated reversals, legacy correction and closure protection. `npm run test:rbac` uses a temporary MySQL database and real browser sessions. Its shareholder-card scenarios additionally cover:

- Two represented holders choosing different nominees and a third independent own ballot.
- External delegates, missing own attendance, absent and zero-share holders.
- Registry changes after attendance, cumulative limits, concurrent conflicting submissions and harmless retries.
- Additional check-in after other cards have voted, attendance removal and correction without changing other cards.
- Direct/represented report filters, representative searches, Excel exports, shareholder ballot counts and public aggregate privacy.
- Legacy records stored under representative IDs or combined shareholder IDs, explicit browser reversal, and closure protection.
- Independent grouped limits, a shareholder representative who is themselves represented, and closed meeting protection.

The English PowerPoint, PDF manual and examples in `docs/training/` teach this policy.

# English Contact Form 7 — integration review (not deployed)

Source: live-home-2026-11-28.review-en.html at d3b5bb48. The review still embeds shortcode a71dc3a (Polish form). Do not replace with a guessed ID. Clone the actual form on staging, retain all field names, types, required flags, validation, mail recipients, attachment tags, consent and anti-spam settings. Translate labels, placeholders, options where safe (preserve machine values), submit button and CF7 messages. Verify privacy policy wording and target before publication.

## Verified frontend field contract and proposed labels

| Field | en-GB label |
|---|---|
| your-email | Email address |
| project-details | Tell us about your project |
| place-type | Type of location |
| project-photo | Site photo 1 |
| project-photo-2 | Site photo 2 |
| project-photo-3 | Site photo 3 |
| project-link | Project link |
| project-render | Project preview |
| lead-source | Internal attribution; preserve unchanged |

Other fields must be taken from the actual CF7 configuration, not inferred.

## Proposed CF7 messages (review)
- Submit: Send enquiry
- Success: Thank you for your enquiry. Your message has been sent.
- Mail failure: Your message could not be sent. Please try again later.
- Validation: One or more fields contain errors. Please check and try again.
- Required field: Please fill in this field.
- Invalid email: Please enter a valid email address.
- Consent: Please accept the required consent before sending your enquiry.
- Spam: Your message could not be sent. Please try again later.
- File too large: The selected file is too large.
- Unsupported file: This file type is not supported.
- Upload failure: The file could not be uploaded. Please try again.

## Acceptance gates
1. Obtain source form definition including mail, messages and additional settings; verify the exact field contract.
2. Create English staging form; obtain real shortcode ID and associate language. Keep PL form unchanged.
3. Replace shortcode only in EN review after ID is known.
4. Test empty submission, invalid email, consent and successful delivery to controlled test recipient.
5. Test Studio project details, link and render; verify three photo inputs, current 5 MB limit and 2560 px compression behavior against actual configuration.
6. Verify mobile drag/drop fallback, accessible errors, confirmation and exactly one GA4 lead event.
7. Verify mail attachments and attribution, no changes to prices, recipient routing or privacy policy without approval.

Blockers: actual form configuration and EN form ID not yet verified; no runtime tests or production changes made. This file is a review specification, not a runnable CF7 form.

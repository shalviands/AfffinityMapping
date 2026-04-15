# DPDP Compliance

The **Digital Personal Data Protection (DPDP) Act 2023** regulates how stakeholder data must be natively managed within INCUBX. Adherence to these strict requirements mitigates fines reaching up to ₹250 crore. Full baseline compliance is enforced before May 13, 2027.

## Key Mechanisms in Platform
- **Data Residency**: As specified in our Firebase protocol docs, all platform implementations rely specifically on the `asia-south1` (Mumbai) datacenter configurations to localize logic and raw metrics strictly within Indian jurisdiction.
- **Explicit Consent**: Integrated natively inside `/session/new`. Founders must enforce specific validations guaranteeing user acceptance before transcript recordings begin.
- **Data Retention & Expiry**: Raw files (including Bhashini cache inputs and File upload containers) undergo automatic chronological trimming after 90 days. Aggregated derived transcripts stay resident up to 1 calendar year unless formally deleted early.
- **Data Deletion Rights**: Complete cascading erasure cascades are bound natively into session lifecycle requests.
- **Breach Declarations**: Operational structures must ensure that GCP / Firebase Security Event protocols are aligned to dispatch warnings immediately matching the 72-hour operational SLA guidelines.
- **Anonymisation Pipelines**: Before structural exports generate payloads to the parent App LMS components or standard PDF renders, speaker identities are decoupled algorithmically, rendering raw identities obscure.

*NOTE*: All workflows remain structurally experimental until legally vouched.

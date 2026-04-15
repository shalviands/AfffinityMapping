# Firebase & Server Configuration

INCUBX Affinity Mapping utilizes Firebase for real-time collaboration, persisting whiteboard setups, managing access, and interacting with LMS webhooks.

## Region Configuration [CRITICAL]
When establishing the initial Database and FireStore bindings via the Firebase portal:
You **MUST** set your region specifically to `asia-south1 (Mumbai)`. This enforces data residency adherence for upcoming DPDP Compliance requirements. This constraint cannot be mutated retroactively on a configured project layer!

## Deployment Setup
1. Instantiate a new Web App in the console.
2. Initialize Cloud Firestore, Realtime Database, and Storage nodes.
3. Migrate configurations to your local `.env`.
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID`
   - etc.

## Firestore Information Architecture

```
/sessions/{sessionId}
  - schema (session metadata, status, createdBy)
/sessions/{sessionId}/board
  - clusters, lastEditedBy, version
/sessions/{sessionId}/comments/{commentId}
  - targeted commentary elements
/sessions/{sessionId}/history/{actionId}
  - transactional operation deltas
/projects/{projectId}/patterns
  - recursive thematic vector/cluster aggregates
```

### Note on Firestore Strategy
To reduce high volume reads/writes, cluster configurations are compressed logically into a single `board` document payload array. This mitigates massive `per-card` transactional fees. Changes leverage debounced saves `(≈300ms)`. Realtime database bindings are strictly preserved for presence pointers (e.g., cursor visualization).

## Security Rules
Paste the following foundational configuration into the Firestore Security Rule console. Modulate according to explicit roles pre-production:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## LMS Webhooks
Ensure the integration configuration variables `VITE_LMS_WEBHOOK_URL` natively maps backward toward the parent application to fire updates sequentially across milestone completion or cohort metrics.

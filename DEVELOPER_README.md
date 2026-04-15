# INCUBX Affinity Tool - Developer Documentation

Welcome to the **INCUBX Affinity Mapping Tool** repository. This is an advanced, client-side heavy React interface tailored for qualitative data synthesis, relying on `@dnd-kit` for drag-and-drop operations, `Zustand` for state tracking, and raw `Tailwind CSS` for styling constraints.

## 🚀 Quick Start (Local Development)

The application leverages **Vite** for HMR and blazing-fast bundling.

```bash
# 1. Install Dependencies
npm install

# 2. Launch Local Development Server
npm run dev

# 3. Build for Production
npm run build
```
Once the dev server is alive, visit `http://localhost:5173/` in your browser.

---

## 🏗️ Technical Architecture

### 1. File Structure
- `src/screens/`: Contains the 11 major UI layouts (from `SessionCreate` to `PriorityMatrix`).
- `src/components/`: Reserved for generic, non-domain specific UI bits (buttons, containers).
- `src/store/`: The heartbeat of the application. Houses lightweight `Zustand` state managers.
- `src/services/`: Integration wrappers. Bhashini Audio processing (`bhashini/`) and AI Synthesis integration (`ai/`).
- `src/data/`: Static payloads and mock databases (`sampleData.js`) used for hydrating local development models without hitting cloud endpoints.

### 2. State Management (`Zustand`)
We rely on multiple compartmentalized stores to avert bloated re-renders:
- `useBoardStore.js`: Contains board logic (`moveCard`, `addCluster`, `undo`, `resolveConflict`). Modifying board data globally passes through here for immediate UI hydration.
- `useSessionStore.js`: Manages the pre-processing forms, transient card arrays mid-review, and `transcript` metadata.

### 3. Drag and Drop Engine
The mapping canvas utilizes headless **`@dnd-kit/core`**. The main logic relies inside `src/screens/Board/index.jsx` which calculates cross-array (`arrayMove`) collision detection to shuffle React nodes across the `Cluster.jsx` arrays.

---

## 🔌 API & Cloud Integrations (Action Required)

The visual frontend is complete. However, the system is designed to interface with 3 specific pipelines. Prior to deployment, you must wire these up:

### A. Firebase Firestore Backend
Currently, `Board/index.jsx` hydrates using `sampleData.js`. 
- **Goal:** Replace `useEffect` hydration in `Board/index.jsx` with active `onSnapshot` Firebase listeners. 
- Refer to `FIREBASE_SETUP.md` for specific DPDP Compliance Rules regarding Region constraints.

### B. Language AI (Bhashini)
`src/services/bhashini/` contains JS service files (`transcribe.service.js`, etc.).
- **Goal:** Route the file outputs from `FileUpload.jsx` directly to Bhashini APIs. A valid Node.js Bhashini proxy server should be developed to secure access tokens.

### C. Synthesis LLM 
`src/services/ai/index.js` handles prompt dispatching.
- **Goal:** Bind your OpenAI or Anthropic tokens so `buildExtractionPrompt()` successfully executes live JSON extraction upon the transcripts.

---

## 🛠️ Styling and Modifications
- **Tailwind Config:** The core palette heavily leverages default Tailwind colors, notably the `brand` palette explicitly mapped in `tailwind.config.js`. Avoid using generic primary colors; always leverage the named tokens for consistency.
- **Animations:** Custom transitions (`fadeSlideIn`) are defined in the config file. Keep visual interactions buttery by utilizing generic CSS transitions instead of heavy Framer-Motion imports when possible.

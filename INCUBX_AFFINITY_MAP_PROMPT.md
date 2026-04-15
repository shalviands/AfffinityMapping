# INCUBX Affinity Mapping Tool — Full Build Prompt
### Platform: Antigravity No-Code AI App Builder
### Stack: React + Tailwind CSS
### Design: Vibrant, colorful, energetic — production-ready

---

## 0. HOW TO USE THIS PROMPT

Paste the entire contents of this file into Antigravity as your build instruction. Every section is a directive — not a suggestion. Build every screen, every component, every file listed. Do not skip or stub anything. This is a production-ready build.

---

## 1. PROJECT OVERVIEW

Build **INCUBX Affinity Mapping Tool** — an AI-powered qualitative research synthesis tool embedded inside the INCUBX incubation platform. It is used by startup founders doing stakeholder interviews. It:

1. Accepts audio recordings, file uploads, or pasted transcripts
2. Transcribes and translates multilingual Indian audio (Hindi/Telugu/regional + English code-switching) using Bhashini
3. Uses AI to extract atomic insight cards, cluster them by theme, detect sentiment, flag contradictions, count frequency, and write startup-context-aware synthesis per cluster
4. Presents results as a fully interactive drag-and-drop affinity board
5. Supports real-time team collaboration (Firebase)
6. Integrates with INCUBX LMS for milestone tracking
7. Exports as PDF, CSV, and structured Research Summary (Lean Canvas / JTBD / HMW formats)

---

## 2. FILE & FOLDER STRUCTURE

Generate every file listed below. No exceptions.

```
/
├── README.md
├── BHASHINI_SETUP.md
├── AI_PROVIDERS_SETUP.md
├── FIREBASE_SETUP.md
├── DPDP_COMPLIANCE.md
├── DESIGN_SYSTEM.md
├── package.json
├── tailwind.config.js
├── .env.example
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── config/
│   │   ├── ai.config.js          # model-agnostic AI provider config
│   │   ├── firebase.config.js    # Firebase india-region config
│   │   └── bhashini.config.js    # Bhashini API config
│   ├── services/
│   │   ├── ai/
│   │   │   ├── index.js          # provider router
│   │   │   ├── claude.service.js
│   │   │   ├── gemini.service.js
│   │   │   └── prompts.js        # all AI prompts in one file
│   │   ├── bhashini/
│   │   │   ├── transcribe.service.js
│   │   │   ├── translate.service.js
│   │   │   └── diarize.service.js
│   │   ├── firebase/
│   │   │   ├── board.service.js  # real-time board sync
│   │   │   ├── session.service.js
│   │   │   └── lms.service.js    # LMS trigger service
│   │   └── export/
│   │       ├── pdf.service.js
│   │       ├── csv.service.js
│   │       └── summary.service.js
│   ├── store/
│   │   ├── useSessionStore.js    # Zustand store for session
│   │   ├── useBoardStore.js      # Zustand store for board state
│   │   └── useUIStore.js         # Zustand store for UI state
│   ├── hooks/
│   │   ├── useAI.js
│   │   ├── useBhashini.js
│   │   ├── useBoard.js
│   │   ├── useDragDrop.js
│   │   └── useFirebase.js
│   ├── screens/
│   │   ├── SessionCreate/
│   │   │   ├── index.jsx
│   │   │   ├── ConsentLayer.jsx
│   │   │   ├── ResearchQuestion.jsx
│   │   │   └── InputModeSelector.jsx
│   │   ├── Input/
│   │   │   ├── index.jsx
│   │   │   ├── LiveRecorder.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   └── TextPaste.jsx
│   │   ├── Processing/
│   │   │   ├── index.jsx
│   │   │   ├── SplitView.jsx
│   │   │   ├── TranscriptPanel.jsx
│   │   │   └── CardsPanel.jsx
│   │   ├── CardReview/
│   │   │   ├── index.jsx
│   │   │   ├── CardReviewItem.jsx
│   │   │   └── SplitCardModal.jsx
│   │   ├── Board/
│   │   │   ├── index.jsx
│   │   │   ├── BoardHeader.jsx
│   │   │   ├── Cluster.jsx
│   │   │   ├── InsightCard.jsx
│   │   │   ├── ConflictPanel.jsx
│   │   │   ├── AddCardForm.jsx
│   │   │   ├── SubGroup.jsx
│   │   │   └── GuidedSidebar.jsx
│   │   ├── PriorityMatrix/
│   │   │   ├── index.jsx
│   │   │   └── MatrixPlot.jsx
│   │   ├── MentorView/
│   │   │   ├── index.jsx
│   │   │   └── CommentThread.jsx
│   │   ├── CrossBoard/
│   │   │   ├── index.jsx
│   │   │   └── PatternHeatmap.jsx
│   │   └── Export/
│   │       ├── index.jsx
│   │       ├── FormatPicker.jsx
│   │       └── PreviewPanel.jsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── SentimentDot.jsx
│   │   │   ├── SentimentBar.jsx
│   │   │   ├── FreqBadge.jsx
│   │   │   ├── ConfidenceRing.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── layout/
│   │   │   ├── AppShell.jsx
│   │   │   ├── TopBar.jsx
│   │   │   └── Sidebar.jsx
│   │   └── shared/
│   │       ├── ResearchQuestionBanner.jsx
│   │       ├── UndoBar.jsx
│   │       └── ProviderBadge.jsx
│   └── utils/
│       ├── cardUtils.js
│       ├── clusterUtils.js
│       ├── sentimentUtils.js
│       ├── exportUtils.js
│       └── langDetect.js
```

---

## 3. DESIGN SYSTEM

Reference: `DESIGN_SYSTEM.md`

### 3.1 Philosophy
Vibrant, colorful, energetic — but never chaotic. Every color choice carries meaning. The board feels alive. Cards feel physical. Clusters feel distinct. The UI communicates confidence and forward momentum appropriate for startup founders doing serious research work.

### 3.2 Color Palette

```js
// tailwind.config.js — extend colors with this
colors: {
  brand: {
    50:  '#f0f4ff',
    100: '#e0eaff',
    200: '#c0d1ff',
    400: '#7c96ff',
    500: '#4f6ef7',   // primary action
    600: '#3a55e0',
    800: '#1e2f8a',
    900: '#111a5c',
  },
  // Cluster accent colors — each cluster gets one
  cluster: {
    violet:  { bg: '#f5f3ff', border: '#8b5cf6', text: '#4c1d95', dot: '#7c3aed' },
    teal:    { bg: '#f0fdf9', border: '#14b8a6', text: '#134e4a', dot: '#0d9488' },
    coral:   { bg: '#fff7ed', border: '#fb923c', text: '#7c2d12', dot: '#ea580c' },
    rose:    { bg: '#fff1f2', border: '#fb7185', text: '#881337', dot: '#e11d48' },
    amber:   { bg: '#fffbeb', border: '#fbbf24', text: '#78350f', dot: '#d97706' },
    sky:     { bg: '#f0f9ff', border: '#38bdf8', text: '#0c4a6e', dot: '#0284c7' },
    lime:    { bg: '#f7fee7', border: '#84cc16', text: '#365314', dot: '#65a30d' },
    pink:    { bg: '#fdf4ff', border: '#e879f9', text: '#701a75', dot: '#c026d3' },
  },
  // Sentiment colors
  positive: '#16a34a',
  negative: '#dc2626',
  neutral:  '#94a3b8',
  // Surface
  canvas:   '#f0f2f7',
}
```

### 3.3 Typography
- Font: `Inter` (Google Fonts) — load via CDN in index.html
- Display headings (screen titles): `text-2xl font-bold tracking-tight`
- Cluster headers: `text-sm font-semibold`
- Card text: `text-xs leading-relaxed`
- Synthesis: `text-xs italic text-gray-500`
- Labels/badges: `text-[10px] font-medium uppercase tracking-wide`

### 3.4 Key UI Patterns

**Cluster columns**
- Rounded corners: `rounded-2xl`
- Colored left border: `border-l-4` in the cluster's accent color
- Column header has a subtle gradient background using the cluster color at 10% opacity
- Card count badge: filled pill in cluster accent color

**Insight cards**
- `rounded-xl shadow-sm` — slight lift
- On hover: `shadow-md translate-y-[-1px]` — physical lift feeling
- Sentiment dot: 8px circle, top-right corner of card
- Dashed border for low-confidence cards
- Frequency badge: `bg-violet-100 text-violet-700 rounded-full text-[10px] px-2`

**Buttons**
- Primary: `bg-brand-500 text-white rounded-xl px-5 py-2.5 font-medium hover:bg-brand-600 active:scale-95 transition-all`
- Ghost: `border border-gray-200 rounded-xl px-4 py-2 text-gray-600 hover:bg-gray-50`
- Danger: `bg-red-50 text-red-600 border border-red-200 rounded-xl`

**Animations**
- Card drag: `opacity-40 scale-95 rotate-1` while dragging
- Drop zone: `border-2 border-brand-400 border-dashed bg-brand-50` on drag-over
- Processing cards appearing: `animate-fadeSlideIn` — custom keyframe, cards fade in from bottom 8px up
- Board load: stagger cluster columns with 80ms delay each

**Custom Tailwind animation (add to config)**
```js
keyframes: {
  fadeSlideIn: {
    '0%': { opacity: '0', transform: 'translateY(8px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  }
},
animation: {
  fadeSlideIn: 'fadeSlideIn 0.25s ease forwards',
  slowPulse: 'pulse 2s ease-in-out infinite',
}
```

---

## 4. SCREENS — FULL SPECIFICATION

Build every screen. Each screen below specifies layout, components, interactions, and data.

---

### SCREEN 1: Session Creation (`/session/new`)

**Purpose:** Founder starts a new affinity mapping session.

**Layout:** Centered single-column form, max-width 560px, white card on canvas background. Split into 4 steps with a pill progress indicator at top.

**Step 1 — Session details**
Fields (all `rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-400`):
- Session name (text, required) — placeholder: "Round 2 — Priya Sharma"
- Stakeholder name (text, required)
- Stakeholder role/occupation (text)
- Interview date (date picker)
- Interview method (select: In-person / Video call / Phone call)
- Startup sector (select: Fintech, Agritech, Edtech, Healthtech, Logistics, SaaS, Other)
- Startup stage (select: Idea, MVP, Early traction, Growth)
- Round number (auto-incremented, editable number)

**Step 2 — Research question**
- Large textarea, prominently styled, placeholder: `"What stops first-time users from completing their UPI transaction?"`
- Below it: 3 example questions as clickable grey pills that auto-fill the textarea
- Red asterisk — this field is mandatory. Validate before proceeding.
- Show an info callout: `"This question stays pinned on your board throughout the session to keep analysis focused."`

**Step 3 — Consent**
- Two checkboxes, both mandatory before proceeding:
  1. "I confirm this stakeholder verbally consented to being recorded"
  2. "I confirm this stakeholder is aware their responses will be analysed by AI"
- Optional: "Send consent link to stakeholder" — text input for phone/email, sends a WhatsApp/email link (stub the send function, log to console)
- Consent timestamp stored in session object on confirmation

**Step 4 — Mode selection**
Three large cards side by side (or stacked on mobile):
- **Record live** — microphone icon, teal accent — "Record the interview directly in INCUBX"
- **Upload file** — upload icon, violet accent — "Upload an audio or video file (mp3, mp4, wav)"
- **Paste text** — text icon, amber accent — "Paste a transcript or notes directly"

Below mode cards: **Sorting mode toggle**
- "AI-First" (default for first 3 sessions) — AI clusters cards, team reviews
- "Human-First" — all cards land unclustered, team sorts manually

Below that: **Guided Mode toggle** — on by default for first 3 sessions, off after

"Start session" CTA button — full width, brand-500, only active when all required fields filled and both consent boxes checked.

---

### SCREEN 2A: Input — Live Recording (`/session/:id/record`)

**Layout:** Full screen. Dark canvas (#0f172a). Centered recording UI.

**Components:**
- Large animated recording indicator — pulsing red circle with sound wave SVG animation
- Live transcript panel below — scrolling text area showing Bhashini transcription in real time as it comes in. Transcript text in white on dark background. Speaker labels appear as colored pills: `Speaker 1` (teal), `Speaker 2` (violet)
- Timer top-right showing HH:MM:SS
- Language detection badge — live updating — shows "Hindi detected", "English detected", "Code-switching" as Bhashini processes
- "Stop recording" button — large, bottom center, red — triggers AI processing pipeline
- "Pause" button — smaller, grey — pauses recording, allows resume
- Overlapping speech flag — if diarisation detects overlap, yellow banner appears: "Overlapping speech detected — tap to review"
- On Stop: transition to Processing screen

**Bhashini integration:**
- `bhashini.config.js` contains `BHASHINI_API_KEY`, `BHASHINI_PIPELINE_ID`, `BHASHINI_USER_ID` — all placeholder strings with clear comments
- `diarize.service.js` — calls pyannote.audio equivalent; for v1 use Bhashini's VAD endpoint
- `transcribe.service.js` — calls Bhashini ASR per speaker turn with language tag
- `translate.service.js` — translates regional segments to English
- Fallback: if Bhashini confidence < 0.7, call Whisper API; show `ProviderBadge` component indicating which engine handled each segment

---

### SCREEN 2B: Input — File Upload (`/session/:id/upload`)

**Layout:** Centered, white card.

**Components:**
- Large drag-and-drop zone — `border-2 border-dashed border-gray-300 rounded-2xl` — accepts mp3, mp4, wav, m4a
- On file drop: show file name, duration, size — green checkmark
- Multiple files can be added to same session — show file list as horizontal scrollable chips
- "Add another file" — adds to queue
- Language hint select (optional): "What language is primarily spoken?" — helps Bhashini pre-configure
- "Process recordings" button — triggers Bhashini pipeline then AI pipeline

---

### SCREEN 2C: Input — Paste Text (`/session/:id/paste`)

**Layout:** Two-column. Left: instructions + speaker format guide. Right: large textarea.

**Components:**
- Textarea — full height, monospaced font, placeholder with example format:
  ```
  Speaker 1: Main problem is the OTP never comes on time...
  Speaker 2: Yes, and the error message is useless...
  ```
- Format hint: "Label speakers as 'Speaker 1:' and 'Speaker 2:' for attribution"
- Language detection runs on paste — shows detected language badge
- "Process text" button triggers AI pipeline (no Bhashini for text input)

---

### SCREEN 3: Processing — Split View (`/session/:id/processing`)

**Layout:** Full screen split. Left 45%: transcript. Right 55%: cards forming.

**Left panel — Transcript**
- Title: "Transcript" with language badge
- Scrolling transcript text — highlights the sentence currently being processed in brand-400
- Speaker turns rendered with colored speaker badges
- Segments flagged as "overlapping" highlighted in yellow
- Processing engine badge at top: "Bhashini" or "Whisper" — teal pill

**Right panel — Cards forming**
- Title: "Insight cards" with a live counter: "42 cards extracted"
- Cards appear one by one with `animate-fadeSlideIn` as AI extracts them
- Each new card shows: sentiment dot, card text, cluster assignment label
- Cards group themselves into cluster buckets in real time — show cluster name as a section divider above each group
- At bottom: progress bar "Clustering... 67%"

**Center divider:** thin vertical line with animated gradient (brand-400 to teal) pulsing while processing

**When complete:** "Processing complete — 47 cards across 5 clusters" banner at top. CTA: "Review cards" — leads to Card Review screen.

---

### SCREEN 4: Card Review (`/session/:id/review`)

**Layout:** Full page. Research question pinned at top as banner. Below: flat list of all cards.

**Top banner:** Brand-500 background. White text. Shows research question. Card count: "47 cards extracted — review before clustering begins"

**Card list:**
- Each card is a horizontal row: sentiment dot | card text | source quote (collapsed, expand on click) | action buttons
- Action buttons per card:
  - Edit (pencil icon) — inline edit of card text
  - Split (scissors icon) — opens SplitCardModal showing the card split into 2 editable cards
  - Mark irrelevant (eye-off icon) — greys out card, removes from processing
  - Delete (trash icon) — removes card entirely
- Cards are paginated — 20 per page — with page controls at bottom
- "Mark all as reviewed" bulk action at top
- "Confirm cards" button — full width brand-500 at bottom — only active when all cards are either confirmed, edited, split, or marked irrelevant. Triggers clustering pass.

**SplitCardModal:**
- Two side-by-side textareas pre-populated with the original text split at the midpoint
- Founder edits each half independently
- "Save split" — replaces original card with 2 new cards

---

### SCREEN 5: Board (`/session/:id/board`) — PRIMARY SCREEN

**Layout:** Full viewport. Top bar + horizontal scrolling board below.

#### 5.1 Top Bar
- Left: INCUBX logo (small) / session breadcrumb / stakeholder name
- Center: Research question — pinned, always visible — in a pill — italic text — truncated with tooltip on hover showing full question
- Right controls:
  - "Speaker" toggle — shows/hides speaker attribution on cards
  - "Guided mode" toggle
  - Round indicator pill: "Round 2 of 5"
  - Card cap indicator: "134 / 300 cards"
  - "Prioritise" button — opens Priority Matrix
  - "Export" button — opens Export screen
  - Avatar cluster showing team members active on board

#### 5.2 Board Canvas
- Background: `bg-[#f0f2f7]` (canvas color)
- Horizontally scrollable — no vertical scroll on the board itself
- Columns displayed left to right

#### 5.3 Unclustered Column (always first)
- Background: `bg-indigo-50 border border-indigo-200`
- Header: "Unclustered" — `text-indigo-700 font-semibold`
- Sub-label: count of unclustered cards
- No sentiment bar, no synthesis
- Cards here have a dashed border

#### 5.4 Cluster Columns
Each cluster column:

**Header (sticky at top of column):**
- Cluster accent color left border (4px) from the `cluster` palette — assigned randomly at creation, editable
- Cluster name — if unconfirmed: greyed italic placeholder "Click to name..." — click to enter inline edit mode — confirm with Enter or blur
- Card count badge — filled, accent color
- "Conflict" badge (yellow) — appears if conflict detected — click opens Conflict Panel
- "Unnamed" badge (indigo) — appears until name is confirmed
- Sentiment breakdown bar — 3-segment bar: red / grey / green proportional to card distribution
- "AI synthesis" expand toggle — click to show/collapse the 2-3 line synthesis paragraph

**AI Synthesis text:**
- Italic, `text-xs text-gray-500`
- Startup-context-aware — references the sector, stage, round number, research question
- Example: "Users consistently struggle with PIN creation during first-time setup. Across 3 of 5 sessions this theme has appeared — it is a validated friction point. For a Fintech MVP at Idea stage, addressing this in onboarding directly impacts your activation metric."

**Cards list (scrollable within column):**
Each card:
- `rounded-xl bg-white shadow-sm border border-gray-100`
- On hover: `shadow-md -translate-y-px transition-all`
- Top-right: sentiment dot (8px circle — green/red/grey)
- Card text: `text-xs leading-relaxed text-gray-800`
- Bottom row:
  - Frequency badge (if >1): `bg-violet-100 text-violet-700 rounded-full px-2 text-[10px]` — shows ×3
  - Confidence indicator: dashed border for uncertain cards — `uncertain` label `text-[10px] italic text-gray-400`
  - Speaker label (if attribution on): `text-[10px] text-gray-400 ml-auto`
  - Delete button: x icon, appears on hover only
- Hover state: source quote appears as a tooltip above the card — dark background, white italic text

**Drag and drop:**
- Card is draggable across all columns
- While dragging: `opacity-40 scale-95 rotate-1`
- Drop target column: `border-2 border-dashed border-brand-400 bg-brand-50`
- On drop: card animates into new position with `animate-fadeSlideIn`
- Cards can be duplicated to another cluster: right-click context menu with "Duplicate to another cluster" option — opens a mini cluster picker modal

**Column footer:**
- "+ add card" button — opens inline AddCardForm
- AddCardForm: textarea for text + sentiment dropdown + "Add" button

**Sub-groups (within a cluster):**
- Right-click any card → "Create sub-group" — groups this card under a new named sub-group header
- Sub-group header: thin divider line + small label — editable
- Cards can be dragged between sub-groups
- Sub-groups collapsed/expanded by clicking header

**Column actions (via ... menu on column header):**
- Rename cluster
- Split cluster into two
- Merge with another cluster (opens picker)
- Change accent color (color picker from the 8 cluster colors)
- Delete cluster (moves cards to Unclustered)

#### 5.5 New Cluster Button
- After all cluster columns: a `+` button — dashed border column placeholder — click to add new cluster

#### 5.6 Conflict Panel (inline below top bar when open)
- Opens when "conflict" badge is clicked
- Shows: cluster name, two columns side by side (positive signals / negative signals)
- 4 resolution buttons: "Keep both — note tension" / "Mark one primary" / "Flag for follow-up" / "Not a real conflict"
- Dismiss X

#### 5.7 Undo Bar
- Appears at bottom of screen for 5 seconds after any destructive action
- "Card moved to Payments — Undo" — timed progress bar on the bar itself
- Tracks last 20 actions in `useBoardStore`

#### 5.8 Guided Mode Sidebar (when enabled)
- Right side panel — 220px wide — slides in
- Shows contextual "What to do now" prompt based on board state
- States and prompts:
  - Unclustered cards > 0: "You have N unsorted cards. Drag them into clusters or create a new one."
  - Unnamed clusters exist: "Name your clusters — 3-5 words describing the common theme."
  - Conflicts unresolved: "You have N conflicts. Click the yellow badge to understand what's contradicting."
  - Priority matrix not done: "Board is complete — prioritise your clusters now."
  - All done: "Board complete. Export your findings or share with your mentor."
- Below prompt: "What is affinity mapping?" — collapsed accordion with a 3-sentence explanation

---

### SCREEN 6: Priority Matrix (`/session/:id/priority`)

**Layout:** Full screen. Title bar + 2x2 matrix filling viewport.

**Matrix:**
- X axis: Frequency (normalized — % of total cards, not raw count)
- Y axis: Intensity (% of negative-sentiment cards in cluster, not average)
- Both axes labeled clearly
- Quadrant labels:
  - Top-right: "Act first" — `bg-red-50 text-red-700`
  - Top-left: "High urgency — low signal" — `bg-amber-50`
  - Bottom-right: "Monitor — common but mild" — `bg-blue-50`
  - Bottom-left: "Low priority" — `bg-gray-50`
- Each cluster plotted as a colored bubble — bubble size = absolute card count
- Bubble label: cluster name truncated
- Drag bubbles to manually adjust position (override auto-plot)
- Click any bubble: sidebar shows cluster details — name, card count, top 3 cards, synthesis excerpt
- "Back to board" button top-left
- "Continue to export" button top-right

---

### SCREEN 7: Mentor View (`/session/:id/mentor`)

**Layout:** Identical to Board screen but with a "Mentor view — read only" banner at top in indigo.

**Differences from Board:**
- All drag-and-drop disabled
- No add card / delete card / rename controls visible
- Comment icon appears on every card and every cluster header on hover
- Click comment icon: opens a comment thread panel on the right (220px sliding panel)
- Comments: avatar initial + name + timestamp + text
- Mentor can submit new comments via textarea + send button
- Comments stored in Firebase under `sessions/{id}/comments/{cardOrClusterId}`
- Founders see comment count badge on cards/clusters that have comments — click to view

---

### SCREEN 8: Cross-Board Patterns (`/project/:id/patterns`)

**Layout:** Full page. Header + heatmap table.

**Header:**
- Project name, total sessions count, total cards across all sessions

**Heatmap:**
- Rows: cluster themes (matched semantically across all boards)
- Columns: each stakeholder session
- Cells: card count — colored from white (0) to brand-500 (highest)
- Row label: cluster theme name
- Column label: stakeholder name + round number
- Cell click: opens a slide-over panel showing the actual cards from that cluster in that session
- "Validated patterns" — themes appearing in 5+ sessions — highlighted with a green left border on the row label + "Validated" badge
- "Isolated" — themes in only 1 session — amber border + "Verify" badge
- "New theme" — first appeared in latest round — indigo badge

---

### SCREEN 9: Export (`/session/:id/export`)

**Layout:** Two-column. Left: format picker + options. Right: live preview.

**Format picker:**
Three large radio cards:
1. **PDF** — visual board snapshot — "Best for presentations and reports"
2. **CSV** — flat data export — "Best for further analysis in Excel or Sheets"
3. **Research Summary** — structured doc — "Best for problem statements and pitch decks"

**Research Summary sub-options (only shown when Research Summary selected):**
Three format cards:
- Lean Canvas Problem Block
- Jobs-to-be-Done (JTBD)
- How Might We (HMW) Statements

**Live preview panel:**
- Shows a preview of the export in the selected format
- For Research Summary: editable preview — founder can edit AI-generated content before downloading
- "Download" button — full width brand-500 — at bottom

**Export data included in all formats:**
- Cluster name
- Sub-group name (if any)
- Card text
- Speaker (if attribution on)
- Sentiment (positive/negative/neutral)
- Hedge level (uncertain/assertive)
- Frequency count
- Source quote
- Contradiction status (flagged/resolved/dismissed)
- AI synthesis

---

### SCREEN 10: Longitudinal Tracking (`/project/:id/timeline`)

**Layout:** Full page timeline view.

**Timeline:**
- X axis: research rounds (Round 1, 2, 3...)
- Y axis: cluster themes (semantically linked across sessions)
- Each cell shows a bubble: size = card count in that round for that theme
- Lines connect linked clusters across rounds — colored by cluster accent
- "New theme" marker when a theme appears for the first time
- "Disappeared" marker when a theme was present in round N but not round N+1
- Click any bubble: slide-over with cards from that session/cluster

---

## 5. AI SERVICES — FULL SPECIFICATION

### 5.1 Provider Configuration (`src/config/ai.config.js`)

```js
// Model-agnostic AI configuration
// Set your preferred provider and add your API key in .env

export const AI_CONFIG = {
  // Options: 'claude' | 'gemini'
  provider: import.meta.env.VITE_AI_PROVIDER || 'claude',

  claude: {
    apiKey: import.meta.env.VITE_CLAUDE_API_KEY || '',
    model: 'claude-sonnet-4-6',
    maxTokens: 4000,
    baseUrl: 'https://api.anthropic.com/v1/messages',
  },

  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    model: 'gemini-1.5-pro',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
};
```

### 5.2 AI Provider Router (`src/services/ai/index.js`)

Build a single `callAI(prompt, systemPrompt)` function that:
- Reads `AI_CONFIG.provider`
- Routes to `claude.service.js` or `gemini.service.js`
- Returns a normalized `{ text, usage }` response object
- Throws a typed `AIProviderError` with the provider name and raw error on failure

### 5.3 Prompts (`src/services/ai/prompts.js`)

Build these prompt-generating functions — each takes session context as input and returns a complete prompt string:

**`buildExtractionPrompt(transcript, researchQuestion, sector, stage)`**
```
You are an expert qualitative researcher analysing a stakeholder interview for a startup founder.

Research question this session is answering: "{researchQuestion}"
Startup sector: {sector}
Startup stage: {stage}

Your task: Extract every distinct insight from the transcript below into atomic insight cards.

Rules:
- One idea per card. If a sentence contains 3 ideas, create 3 cards.
- Only extract insights relevant to the research question. Ignore greetings, filler, off-topic chat.
- For each card provide:
  - text: the insight in 10-20 words, clean English
  - quote: the original verbatim quote this came from (under 40 words)
  - speaker: which speaker said it (Speaker 1, Speaker 2, etc.)
  - sentiment: positive | negative | neutral
  - confidence: high | low (low if speaker used hedging language: "I think", "maybe", "not sure", "kind of", "I guess")
  - assertive: true | false (true if speaker used strong language: "always", "never", "definitely", "every time")

Return ONLY valid JSON array. No preamble. No markdown. No explanation.
Format: [{"text":"...","quote":"...","speaker":"...","sentiment":"...","confidence":"...","assertive":true}]

TRANSCRIPT:
{transcript}
```

**`buildClusteringPrompt(cards, researchQuestion, sector, stage)`**
```
You are an expert qualitative researcher doing affinity mapping for a {stage} startup in {sector}.

Research question: "{researchQuestion}"

Below are {n} insight cards extracted from a stakeholder interview.
Group them into thematic clusters. Follow these rules:

- Let themes emerge from the data — do not impose predefined categories
- Each cluster must have a minimum of 2 cards
- Cards that do not fit any cluster go into an "unclustered" group
- Name each cluster with 3-5 words in sentence case
- Write a 2-3 sentence synthesis for each cluster that:
  * Explains what this theme means for THIS startup at THIS stage
  * References the research question
  * Is written as advice to the founder, not as a generic summary
- Flag contradiction: true if a cluster contains cards with directly opposing factual claims about the same subject

Return ONLY valid JSON. No preamble.
Format:
{
  "clusters": [
    {
      "id": "unique_slug",
      "name": "Cluster name",
      "synthesis": "2-3 sentence startup-context synthesis...",
      "conflict": false,
      "cardIds": ["card_id_1", "card_id_2"]
    }
  ],
  "unclustered": ["card_id_x"]
}

CARDS:
{cardsJson}
```

**`buildHMWPrompt(cluster, researchQuestion, sector)`**
```
Convert this research cluster into a How Might We (HMW) design sprint question.

Cluster name: {clusterName}
Cluster synthesis: {synthesis}
Research question it responds to: {researchQuestion}
Startup sector: {sector}

Rules for a good HMW:
- Specific enough to be actionable but broad enough for multiple solutions
- Starts with "How might we..."
- 10-20 words
- Written for a startup founder, not a researcher

Return only the HMW question. No explanation.
```

**`buildJTBDPrompt(clusters, sector)`**
**`buildLeanCanvasPrompt(clusters, sector, stage)`**
Build these similarly — structured prompts that convert cluster data into the respective output format.

---

## 6. BHASHINI INTEGRATION

### 6.1 Config (`src/config/bhashini.config.js`)

```js
export const BHASHINI_CONFIG = {
  // Get credentials at: https://bhashini.gov.in/ulca/model/api-info
  apiKey:     import.meta.env.VITE_BHASHINI_API_KEY     || 'YOUR_BHASHINI_API_KEY',
  userId:     import.meta.env.VITE_BHASHINI_USER_ID     || 'YOUR_BHASHINI_USER_ID',
  pipelineId: import.meta.env.VITE_BHASHINI_PIPELINE_ID || 'YOUR_PIPELINE_ID',
  baseUrl:    'https://dhruva-api.bhashini.gov.in',

  // Supported language codes
  languages: {
    hindi:   'hi',
    telugu:  'te',
    tamil:   'ta',
    kannada: 'kn',
    marathi: 'mr',
    english: 'en',
  },

  // Confidence threshold — below this, fall back to Whisper
  confidenceThreshold: 0.70,

  // Whisper fallback config
  whisper: {
    apiKey:  import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_KEY',
    model:   'whisper-1',
    baseUrl: 'https://api.openai.com/v1/audio/transcriptions',
  },
};
```

### 6.2 Transcription Service (`src/services/bhashini/transcribe.service.js`)

Build `transcribeAudio(audioBlob, languageCode)`:
- Converts audioBlob to base64
- POSTs to Bhashini ASR endpoint with correct pipeline config
- Returns `{ transcript, confidence, engine: 'bhashini' }`
- If confidence < threshold: falls back to Whisper, returns `{ transcript, engine: 'whisper' }`
- Logs which engine handled each segment to console

### 6.3 Diarisation Service (`src/services/bhashini/diarize.service.js`)

Build `diarizeAudio(audioBlob)`:
- Calls Bhashini VAD (Voice Activity Detection) endpoint
- Returns array of `{ start, end, speaker, languageHint }` segments
- Flags overlapping segments: `{ start, end, speaker: 'overlap', overlap: true }`

### 6.4 Processing Pipeline (`src/hooks/useBhashini.js`)

Build `useBhashini()` hook that orchestrates:
1. `diarizeAudio` → get segments
2. Detect language per segment (call Bhashini language identification endpoint)
3. For each segment: `transcribeAudio` with detected language
4. Merge all segment transcripts into one unified English transcript
5. Return `{ transcript, segments, processingLog }`
   - `processingLog` is an array of `{ segmentIndex, language, engine, confidence }` for the Processing Log UI

---

## 7. FIREBASE INTEGRATION

### 7.1 Config (`src/config/firebase.config.js`)

```js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// IMPORTANT: Set location to asia-south1 (Mumbai) for DPDP compliance
// Do this in Firebase Console before initialising — cannot be changed after
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export const auth    = getAuth(app);
export const rtdb    = getDatabase(app); // Realtime DB for presence/cursor
```

### 7.2 Firestore Data Model

```
/sessions/{sessionId}
  - id, name, projectId, stakeholderName, stakeholderRole
  - interviewDate, interviewMethod, sector, stage, roundNumber
  - researchQuestion, sortingMode, guidedMode
  - consentTimestamp, createdBy, createdAt
  - status: 'created' | 'processing' | 'review' | 'board' | 'complete'

/sessions/{sessionId}/board
  - clusters: [ { id, name, confirmed, isUnc, conflict, synthesis, accentColor, cards: [...] } ]
  - lastEditedBy, lastEditedAt, version

/sessions/{sessionId}/comments/{commentId}
  - targetId (cardId or clusterId), text, authorName, authorRole, createdAt

/sessions/{sessionId}/history/{actionId}
  - type: 'card_moved' | 'cluster_renamed' | 'card_deleted' | ...
  - payload, by, at

/projects/{projectId}/patterns
  - clusterEmbeddings: [ { clusterId, sessionId, embedding, clusterName } ]
```

### 7.3 Board Service (`src/services/firebase/board.service.js`)

Build these functions:
- `subscribeToBoard(sessionId, callback)` — `onSnapshot` listener on the board document
- `updateBoard(sessionId, boardState)` — debounced write (300ms) — writes entire board state as one document to avoid per-card read costs
- `recordAction(sessionId, action)` — writes to history subcollection
- `getHistory(sessionId, limit=20)` — reads last N actions

**Architecture note:** Store all 300 cards in a single `board` document — not one document per card. This avoids Firestore per-read charges at scale.

### 7.4 LMS Triggers (`src/services/firebase/lms.service.js`)

Build 3 trigger functions — each makes a POST to the INCUBX LMS webhook URL (stored in env):
- `triggerMilestone(sessionId, founderId)` — fires when board status set to 'complete'
- `triggerMentorComment(sessionId, clusterId, cardId, mentorName)` — fires when mentor posts comment
- `updateCohortGrid(sessionId, founderId, status)` — fires on any status change — updates the cohort manager grid

---

## 8. STATE MANAGEMENT

Use **Zustand** for all state. Three stores:

### `useBoardStore`
```js
{
  clusters: [],              // array of cluster objects
  history: [],               // last 20 actions
  dragCard: null,
  dragFrom: null,
  dragOver: null,
  conflictOpen: null,
  showAttribution: false,
  guidedModeOpen: false,
  // actions
  moveCard, addCard, deleteCard, editCard, duplicateCard,
  renameCluster, addCluster, deleteCluster, splitCluster, mergeCluster,
  resolveConflict, toggleAttribution, undo,
}
```

### `useSessionStore`
```js
{
  session: null,             // current session object
  processing: false,
  processingLog: [],
  transcript: '',
  cards: [],                 // post-extraction cards
  reviewedCards: [],         // post-card-review confirmed cards
  // actions
  setSession, setTranscript, setCards, confirmCards,
}
```

### `useUIStore`
```js
{
  synOpen: {},               // { clusterId: bool }
  addingTo: null,
  editingCol: null,
  priorityMatrixOpen: false,
  exportOpen: false,
  // actions
  toggleSyn, setAddingTo, setEditingCol,
}
```

---

## 9. ENVIRONMENT VARIABLES (`.env.example`)

```
# AI Provider — set to 'claude' or 'gemini'
VITE_AI_PROVIDER=claude

# Claude API
VITE_CLAUDE_API_KEY=your_claude_api_key_here

# Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Bhashini
VITE_BHASHINI_API_KEY=your_bhashini_api_key_here
VITE_BHASHINI_USER_ID=your_bhashini_user_id_here
VITE_BHASHINI_PIPELINE_ID=your_pipeline_id_here

# OpenAI (Whisper fallback only)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=

# INCUBX LMS Webhook
VITE_LMS_WEBHOOK_URL=https://your-incubx-lms.com/api/webhooks/affinity
```

---

## 10. DOCUMENTATION FILES

Generate all four documentation files with full content:

### `README.md`
- Project overview
- What the tool does (3 paragraphs)
- Quick start (clone → install → env setup → run)
- Screen-by-screen guide with descriptions
- Architecture overview diagram (ASCII)
- Contribution guide

### `BHASHINI_SETUP.md`
- What Bhashini is and why it's used
- Step-by-step: how to register at bhashini.gov.in
- How to get API key, User ID, Pipeline ID
- How to configure the pipeline for ASR + translation
- Supported language list with codes
- How to test the integration
- Troubleshooting: common Bhashini errors and fixes
- Whisper fallback: when it triggers and how to configure it

### `AI_PROVIDERS_SETUP.md`
- How the model-agnostic routing works
- Claude setup: where to get API key, which model is used, rate limits
- Gemini setup: where to get API key, which model, rate limits
- How to switch providers: change one env variable
- Token cost estimates per session (approximate)
- How to add a new provider: step-by-step guide for extending `ai/index.js`

### `FIREBASE_SETUP.md`
- Why Firebase was chosen (real-time, flexible)
- **Critical:** Set Firestore region to `asia-south1` (Mumbai) BEFORE creating the database — cannot be changed
- Step-by-step Firebase project setup
- Firestore data model documentation
- Security rules (full rules file to paste into Firebase console)
- Realtime Database setup for presence
- Storage setup for audio files
- LMS webhook configuration

### `DPDP_COMPLIANCE.md`
- What DPDP Act 2023 is and who it applies to
- Full compliance deadline: May 13, 2027
- How INCUBX Affinity Tool handles each DPDP requirement:
  - Data residency: Firebase asia-south1 (Mumbai)
  - Consent: pre-session checklist + stakeholder consent link
  - Retention: recordings auto-deleted 90 days, transcripts 1 year
  - Right to deletion: how a founder deletes a session
  - Breach notification: 72-hour requirement — Firebase Security Alerts setup guide
  - Anonymisation: speaker name stripping before export
- What still requires legal review before launch
- Penalty reference: up to ₹250 crore per violation

### `DESIGN_SYSTEM.md`
- Full color palette with hex values and usage rules
- Typography scale
- Component library reference (every UI component with props)
- Cluster accent color assignment rules
- Animation keyframes reference
- Spacing and layout grid

---

## 11. ROUTING

Use React Router v6:

```
/                           → redirect to /project/demo/sessions
/session/new                → SessionCreate
/session/:id/record         → LiveRecorder
/session/:id/upload         → FileUpload
/session/:id/paste          → TextPaste
/session/:id/processing     → ProcessingSplitView
/session/:id/review         → CardReview
/session/:id/board          → Board (primary screen)
/session/:id/priority       → PriorityMatrix
/session/:id/mentor         → MentorView
/session/:id/export         → Export
/project/:id/patterns       → CrossBoardPatterns
/project/:id/timeline       → LongitudinalTimeline
```

---

## 12. SAMPLE DATA

Seed the app with realistic sample data so every screen is populated on first load:

- Project: "PayEase — UPI Onboarding Research"
- 3 completed sessions with different stakeholders
- Session 1: Priya Sharma, housewife, Tier 2 city, Round 1
- Session 2: Ravi Kumar, auto driver, Tier 3 city, Round 2
- Session 3: Meena Pillai, small shop owner, Tier 2 city, Round 3
- Each session: 4-5 clusters, 15-25 cards, varied sentiments, at least 1 conflict per session
- Research question: "What stops first-time users from completing their UPI transaction?"

Place all sample data in `src/data/sampleData.js` — a single exported object matching the Firestore data model.

---

## 13. QUALITY REQUIREMENTS

Every screen must meet these before considering it done:

- Fully responsive — works at 1440px (desktop primary), 768px (tablet), 375px (mobile)
- Dark mode support — all colors use CSS variables or Tailwind dark: variants
- No hardcoded pixel widths on text or interactive elements
- All interactive elements have hover + active + focus states
- Empty states: every list/board has a designed empty state (not just blank white)
- Error states: every API call has a visible error state with a retry button
- Loading states: every async operation has a skeleton or spinner
- Keyboard navigable: all interactive elements reachable with Tab key
- No console errors in production build

---

## 14. BUILD & RUN

```json
// package.json scripts
{
  "dev":     "vite",
  "build":   "vite build",
  "preview": "vite preview",
  "lint":    "eslint src --ext .jsx,.js"
}
```

Dependencies to install:
```
react react-dom react-router-dom
zustand
@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
firebase
tailwindcss autoprefixer postcss
jspdf jspdf-autotable
papaparse
framer-motion
clsx
date-fns
```

---

*End of build prompt. Build every screen. Build every file. Build every service. This is production-ready — no stubs, no TODOs in the final output.*

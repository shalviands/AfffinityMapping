import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell'

import SessionCreate from './screens/SessionCreate';
import LiveRecorder from './screens/Input/LiveRecorder';
import FileUpload from './screens/Input/FileUpload';
import TextPaste from './screens/Input/TextPaste';
import ProcessingSplitView from './screens/Processing/ProcessingSplitView';
import CardReview from './screens/CardReview';
import Board from './screens/Board';
import PriorityMatrix from './screens/PriorityMatrix';
// import MentorView from './screens/MentorView';
import Export from './screens/Export';
import CrossBoardPatterns from './screens/CrossBoard';
import LongitudinalTimeline from './screens/CrossBoard/LongitudinalTimeline';

import ProjectCreate from './screens/ProjectCreate';
import Dashboard from './screens/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/new" element={<ProjectCreate />} />
          <Route path="/project/:projectId/board" element={<Board />} />
          <Route path="/project/:projectId/add-feedback" element={<SessionCreate />} />
          
          <Route path="/project/:projectId/session/:id/record" element={<LiveRecorder />} />
          <Route path="/project/:projectId/session/:id/upload" element={<FileUpload />} />
          <Route path="/project/:projectId/session/:id/paste" element={<TextPaste />} />
          <Route path="/project/:projectId/session/:id/processing" element={<ProcessingSplitView />} />
          <Route path="/project/:projectId/session/:id/review" element={<CardReview />} />
          
          <Route path="/project/:projectId/priority" element={<PriorityMatrix />} />
          {/* <Route path="/project/:projectId/mentor" element={<MentorView />} /> */}
          <Route path="/project/:projectId/export" element={<Export />} />
          
          <Route path="/project/:projectId/patterns" element={<CrossBoardPatterns />} />
          <Route path="/project/:projectId/timeline" element={<LongitudinalTimeline />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

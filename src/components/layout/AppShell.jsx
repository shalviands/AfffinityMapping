import { Outlet } from 'react-router-dom';
import GuidedTour from '../discovery/GuidedTour';
import SystemIntegrityTool from '../debug/SystemIntegrityTool';

export default function AppShell() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas text-gray-900 font-sans">
      {/* <GuidedTour /> */}
      {/* <SystemIntegrityTool /> */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

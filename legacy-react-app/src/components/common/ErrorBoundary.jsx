import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ANTIGRAVITY System Crash Caught]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl m-4 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-red-900 mb-2 tracking-tight">Component Failed to Render</h2>
          <p className="text-xs text-red-700 max-w-xs mb-6 leading-relaxed">
            The system successfully isolated a crash in this module to prevent the entire platform from going blank.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-white border border-red-200 text-red-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Platform
          </button>
          
          {import.meta.env.DEV && (
            <div className="mt-8 text-[10px] font-mono text-red-400 text-left bg-white/50 p-4 rounded-xl border border-red-100 w-full overflow-x-auto">
                {this.state.error?.toString()}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

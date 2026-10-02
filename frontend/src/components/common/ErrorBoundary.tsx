import React from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Home,
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      'Vandristi application error:',
      error,
      errorInfo
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/app';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07141F] text-white flex items-center justify-center px-6">
          <div className="max-w-lg w-full text-center">

            <div className="mx-auto w-20 h-20 rounded-full bg-[#FF5148]/10 border border-[#FF5148]/30 flex items-center justify-center">
              <AlertTriangle className="w-9 h-9 text-[#FF5148]" />
            </div>

            <h1 className="mt-7 text-2xl font-bold">
              Vandristi Encountered an Error
            </h1>

            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              The application encountered an unexpected error while
              loading this module. Your data has not been modified.
            </p>

            <div className="mt-6 bg-[#0B1B28] border border-[#193348] rounded-xl p-4 text-left">
              <div className="text-xs text-slate-500 mb-2">
                SYSTEM STATUS
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5148]" />

                <span className="text-sm text-slate-300">
                  Application module unavailable
                </span>
              </div>
            </div>

            <div className="mt-7 flex justify-center gap-3">

              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#20D58A] text-[#07141F] font-bold text-sm hover:bg-[#20D58A]/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload System
              </button>

              <button
                onClick={this.handleHome}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#193348] bg-[#0B1B28] text-slate-300 hover:text-white hover:bg-[#102433] font-semibold text-sm transition-colors"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>

            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-xs text-slate-600">
                  Developer error details
                </summary>

                <pre className="mt-2 p-3 bg-[#050D14] rounded-lg text-[10px] text-red-400 overflow-auto">
                  {this.state.error.stack ||
                    this.state.error.message}
                </pre>
              </details>
            )}

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Codex Canvas error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-0 p-8 text-center">
          <div className="max-w-md">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-border-subtle bg-surface-1">
              <span className="text-xl">⚠</span>
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg border border-border-subtle bg-surface-1 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React from "react";
import { Button } from "@/components/ui/button";
import { logError } from "@/utils/logger";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError("React error boundary caught an error", error, {
      componentStack: info?.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-md rounded-[2rem] border bg-card p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="mt-3 text-base text-muted-foreground">
              This page could not load right now. Please try again.
            </p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

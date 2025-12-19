import type { ErrorBoundaryProps, ErrorBoundaryState } from "@/types";
import { Button } from "antd";
import React from "react";

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log error info here
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <OopsSomethingWentWrong handleRefresh={this.props.handleRefresh} />
      );
    }
    return this.props.children;
  }
}

function OopsSomethingWentWrong({
  handleRefresh,
}: {
  handleRefresh: () => void;
}) {
  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <div style={{ textAlign: "center", padding: "16px" }}>
        <h1>Oops, Something went wrong</h1>
        <p>We're sorry, but an unexpected error has occurred.</p>
      </div>
      <Button type="primary" onClick={handleRefresh}>
        Refresh
      </Button>
    </div>
  );
}

export default ErrorBoundary;

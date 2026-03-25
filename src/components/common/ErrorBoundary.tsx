import React from 'react';
import { Alert, Button, Result } from 'antd';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Route crash caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="The page crashed, but the app is still running."
          extra={[
            <Button type="primary" key="reload" onClick={this.handleReload}>
              Reload page
            </Button>,
          ]}
        >
          {this.state.error ? (
            <Alert
              type="error"
              showIcon
              message={this.state.error.message}
              style={{ textAlign: 'left' }}
            />
          ) : null}
        </Result>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

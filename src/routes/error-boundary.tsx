import { Component, type ErrorInfo, type ReactNode } from 'react';

import ErrorPage from './error-page';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('One Browser Web render failed.', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorPage
          error={this.state.error}
          reset={() => this.setState({ error: null })}
        />
      );
    }

    return this.props.children;
  }
}

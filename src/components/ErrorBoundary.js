import React from 'react';
import Marketplace from './buyer/Marketplace.js';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component Error:", error, errorInfo);
    // Add error logging service here
  }

  render() {
    return this.state.hasError ? (
      <div className="error-message">
        Something went wrong. Please refresh the page.
      </div>
    ) : this.props.children;
  }
}

// Wrap components in App.js
<ErrorBoundary>
  <Marketplace />
</ErrorBoundary>
# 🪵 Logging System Guide

## 📖 Overview

The MyWebApp logging system provides comprehensive logging capabilities for debugging, monitoring, and analytics. It supports multiple log levels, structured data, remote logging, and performance monitoring optimized for web applications.

---

## 🚀 Quick Start

### **Basic Import**
```typescript
import { logger } from '../utils/logger';
```

### **Simple Logging**
```typescript
// Basic logging
logger.info('App started successfully');
logger.warn('Network connection unstable');
logger.error('Failed to load user data');
logger.debug('User interaction data', { buttonId: 'submit', timestamp: Date.now() });
```

---

## 📊 Log Levels

### **Available Levels**
```typescript
export enum LogLevel {
  DEBUG = 0,    // Development debugging information
  INFO = 1,     // General information
  WARN = 2,     // Warning conditions
  ERROR = 3,    // Error conditions
  FATAL = 4,    // Critical failures
}
```

### **When to Use Each Level**

| Level | Use Case | Examples |
|-------|----------|----------|
| **DEBUG** | Development debugging | Variable values, function calls, detailed flow |
| **INFO** | General information | User actions, API calls, page navigation |
| **WARN** | Warning conditions | Deprecated features, performance issues |
| **ERROR** | Errors that don't crash the app | API failures, validation errors |
| **FATAL** | Critical errors | App crashes, security breaches |

---

## 🛠️ Core Logging Methods

### **Basic Logging**
```typescript
// Debug logging (development only)
logger.debug('Processing user input', { input: userText });

// Information logging
logger.info('User successfully logged in', { userId: '123', timestamp: Date.now() });

// Warning logging
logger.warn('API response time exceeded threshold', { responseTime: 5000, threshold: 3000 });

// Error logging
logger.error('Failed to save user preferences', error, { userId: '123' });

// Fatal error logging
logger.fatal('Database connection lost', error, { retryAttempts: 3 });
```

### **Specialized Logging Methods**

#### **API Logging**
```typescript
// Log API calls
logger.apiCall('GET', '/api/users/123', { filters: { active: true } });

// Log API responses
logger.apiResponse('GET', '/api/users/123', 200, { user: userData });
logger.apiResponse('POST', '/api/auth/login', 401, { error: 'Invalid credentials' });
```

#### **Navigation Logging**
```typescript
// Log page navigation
logger.navigation('/dashboard', { from: '/login', userId: '123' });
logger.navigation('/profile', { params: { userId: '123' } });
```

#### **User Action Logging**
```typescript
// Log user interactions
logger.userAction('button_click', { buttonId: 'submit_form', formType: 'registration' });
logger.userAction('scroll', { direction: 'down', page: 'ProductList' });
logger.userAction('search', { query: 'react web app', resultsCount: 42 });
```

#### **Authentication Logging**
```typescript
// Log authentication events
logger.auth('login_attempt', '123', { method: 'email' });
logger.auth('login_success', '123', { method: 'email', timestamp: Date.now() });
logger.auth('logout', '123');
logger.auth('password_reset_requested', undefined, { email: 'user@example.com' });
```

#### **Performance Logging**
```typescript
// Time operations
logger.time('data_processing');
// ... your expensive operation ...
logger.timeEnd('data_processing');

// Example with complex operation
logger.time('api_call_with_processing');
const response = await fetch('/api/data');
const data = await response.json();
const processedData = processData(data);
logger.timeEnd('api_call_with_processing');
```

---

## ⚙️ Configuration

### **Logger Configuration Options**
```typescript
interface LoggerConfig {
  enableConsole: boolean;      // Log to browser console
  enableRemote: boolean;       // Send logs to remote server
  enableLocalStorage: boolean; // Save logs to browser localStorage
  minLogLevel: LogLevel;       // Minimum log level to process
  maxLogEntries: number;       // Maximum logs to keep in memory
  remoteEndpoint?: string;     // Remote logging endpoint URL
  userId?: string;             // User ID for all logs
}
```

### **Updating Configuration**
```typescript
import { logger, LogLevel } from '../utils/logger';

// Update configuration at runtime
logger.updateConfig({
  enableRemote: true,
  remoteEndpoint: 'https://your-logging-server.com/logs',
  minLogLevel: LogLevel.INFO,
});

// Set user ID for all future logs
logger.setUserId('user_123');
```

### **Environment-Based Configuration**
```typescript
// In your app initialization (main.tsx or App.tsx)
if (import.meta.env.MODE === 'development') {
  logger.updateConfig({
    enableConsole: true,
    minLogLevel: LogLevel.DEBUG,
    enableRemote: false,
    enableLocalStorage: true,
  });
} else {
  logger.updateConfig({
    enableConsole: false,
    minLogLevel: LogLevel.INFO,
    enableRemote: true,
    enableLocalStorage: false,
    remoteEndpoint: import.meta.env.VITE_LOGGING_ENDPOINT,
  });
}
```

---

## 🌐 Web App Integration

### **App.tsx Integration**
```typescript
import React, { useEffect } from 'react';
import { logger } from './utils/logger';

function App() {
  useEffect(() => {
    logger.info('App initialized', { 
      userAgent: navigator.userAgent,
      version: '1.0.0',
      timestamp: Date.now()
    });
    
    // Set up global error handling
    window.addEventListener('error', (event) => {
      logger.fatal('Unhandled error', event.error, { 
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Set up unhandled promise rejection logging
    window.addEventListener('unhandledrejection', (event) => {
      logger.fatal('Unhandled promise rejection', event.reason);
    });

    return () => {
      logger.info('App unmounting');
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Your app content */}
    </div>
  );
}

export default App;
```

### **React Component Integration**
```typescript
import React, { useEffect } from 'react';
import { logger } from '../utils/logger';

const UserDashboard: React.FC = () => {
  useEffect(() => {
    logger.info('UserDashboard mounted');
    
    return () => {
      logger.debug('UserDashboard unmounted');
    };
  }, []);

  const handleButtonClick = () => {
    logger.userAction('dashboard_button_click', { 
      buttonType: 'primary',
      timestamp: Date.now()
    });
  };

  return (
    <div>
      <button onClick={handleButtonClick}>
        Click me
      </button>
    </div>
  );
};
```

---

## 🔧 Advanced Features

### **Local Storage Persistence**
```typescript
// Enable localStorage persistence
logger.updateConfig({ enableLocalStorage: true });

// Logs are automatically saved to localStorage
// Retrieve logs from localStorage
const savedLogs = localStorage.getItem('app_logs');
if (savedLogs) {
  const logs = JSON.parse(savedLogs);
  console.log('Saved logs:', logs);
}
```

### **Custom Log Processing**
```typescript
// Get all logs for custom processing
const allLogs = logger.getLogs();
console.log('All logs:', allLogs);

// Get logs by level
const errorLogs = logger.getLogsByLevel(LogLevel.ERROR);
console.log('Error logs:', errorLogs);

// Get logging statistics
const stats = logger.getStats();
console.log('Logging stats:', stats);
```

### **Performance Monitoring**
```typescript
// Monitor page load performance
logger.time('page_load');
window.addEventListener('load', () => {
  logger.timeEnd('page_load');
});

// Monitor API response times
const monitoredFetch = async (url: string, options?: RequestInit) => {
  const startTime = performance.now();
  logger.apiCall(options?.method || 'GET', url, options?.body);
  
  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    
    logger.apiResponse(
      options?.method || 'GET',
      url,
      response.status,
      { responseTime: endTime - startTime }
    );
    
    return response;
  } catch (error) {
    logger.error('API call failed', error, { url, method: options?.method });
    throw error;
  }
};
```

---

## 📈 Remote Logging

### **Setting Up Remote Logging**
```typescript
// Configure remote logging
logger.updateConfig({
  enableRemote: true,
  remoteEndpoint: 'https://your-api.com/logs',
});

// Logs are automatically sent to the remote endpoint
// The logger sends a POST request with the log entry as JSON
```

### **Remote Endpoint Expected Format**
```json
{
  "timestamp": "2025-01-22T10:30:45.123Z",
  "level": 2,
  "levelName": "WARN",
  "message": "API response time exceeded threshold",
  "data": {
    "responseTime": 5000,
    "threshold": 3000
  },
  "platform": "web",
  "appVersion": "1.0.0",
  "userId": "user_123",
  "sessionId": "1642857045123-abc123def"
}
```

### **Server-Side Processing Example**
```typescript
// Express.js endpoint example
app.post('/logs', (req, res) => {
  const logEntry = req.body;
  
  // Process log entry
  console.log('Received log:', logEntry);
  
  // Store in database, send to monitoring service, etc.
  // Example: Send to external monitoring service
  if (logEntry.level >= LogLevel.ERROR) {
    sendToMonitoringService(logEntry);
  }
  
  res.status(200).json({ success: true });
});
```

---

## 🎯 Best Practices

### **Development Environment**
```typescript
// Use debug level for detailed information
logger.debug('Component props', { props });
logger.debug('State change', { oldState, newState });
logger.debug('Event handler triggered', { event: 'click', target: 'button' });

// Log function entry/exit for complex debugging
const processUserData = (userData: any) => {
  logger.debug('processUserData entry', { userData });
  
  // ... processing logic ...
  
  logger.debug('processUserData exit', { processedData });
  return processedData;
};
```

### **Production Environment**
```typescript
// Focus on INFO level and above
logger.info('User action completed', { action: 'purchase', orderId: '123' });
logger.warn('Performance threshold exceeded', { metric: 'loadTime', value: 3000 });
logger.error('Payment processing failed', error, { orderId: '123' });

// Monitor critical user flows
logger.info('Checkout flow started', { userId: '123', cartValue: 99.99 });
logger.info('Payment method selected', { method: 'credit_card' });
logger.info('Order completed', { orderId: '123', total: 99.99 });
```

### **Performance Considerations**
```typescript
// Use appropriate log levels to avoid performance impact
if (logger.config.minLogLevel <= LogLevel.DEBUG) {
  logger.debug('Expensive debug info', computeExpensiveData());
}

// Batch non-critical logs
const batchedLogs = [];
batchedLogs.push({ level: LogLevel.INFO, message: 'User action', data: actionData });
// ... collect more logs ...
// Send batch periodically
```

---

## 🚨 Error Handling

### **Global Error Boundary**
```typescript
// Error boundary component
import React from 'react';
import { logger } from '../utils/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.fatal('React component error', error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### **Async Error Handling**
```typescript
// Async function with logging
const handleAsyncOperation = async () => {
  try {
    logger.info('Starting async operation');
    const result = await someAsyncOperation();
    logger.info('Async operation completed', { result });
    return result;
  } catch (error) {
    logger.error('Async operation failed', error);
    throw error;
  }
};
```

---

## 📊 Monitoring & Analytics

### **User Journey Tracking**
```typescript
// Track user journey through the app
logger.info('User session started', { userId: '123' });
logger.navigation('/login');
logger.userAction('login_attempt', { method: 'email' });
logger.auth('login_success', '123');
logger.navigation('/dashboard');
logger.userAction('feature_used', { feature: 'data_export' });
logger.info('User session ended', { duration: 1800000 }); // 30 minutes
```

### **Performance Metrics**
```typescript
// Track performance metrics
logger.time('app_initialization');
// ... app initialization ...
logger.timeEnd('app_initialization');

// Track feature usage
logger.info('Feature accessed', { 
  feature: 'user_profile',
  loadTime: 450,
  userId: '123'
});
```

### **Business Metrics**
```typescript
// Track business-relevant events
logger.info('Conversion event', {
  event: 'signup_completed',
  userId: '123',
  source: 'google_ads',
  value: 0
});

logger.info('Revenue event', {
  event: 'purchase_completed',
  userId: '123',
  orderId: 'ord_123',
  value: 99.99,
  currency: 'USD'
});
```

---

## 🔍 Debugging Tips

### **Common Debugging Patterns**
```typescript
// Debug component rendering
const MyComponent: React.FC<Props> = (props) => {
  logger.debug('MyComponent rendering', { props });
  
  useEffect(() => {
    logger.debug('MyComponent mounted');
    return () => logger.debug('MyComponent unmounted');
  }, []);

  const handleClick = () => {
    logger.debug('MyComponent click handler', { timestamp: Date.now() });
  };

  return <button onClick={handleClick}>Click me</button>;
};

// Debug state changes
const [state, setState] = useState(initialState);
const updateState = (newState: any) => {
  logger.debug('State update', { oldState: state, newState });
  setState(newState);
};
```

### **Browser DevTools Integration**
```typescript
// Add logger to window for debugging
if (import.meta.env.MODE === 'development') {
  (window as any).logger = logger;
}

// Now you can use logger in browser console:
// logger.info('Debug from console');
// logger.getLogs();
// logger.getStats();
```

---

## 🛡️ Security Considerations

### **Sensitive Data Handling**
```typescript
// Don't log sensitive information
logger.info('User login', { 
  userId: '123',
  // DON'T: password: 'secret123',
  // DON'T: creditCard: '1234-5678-9012-3456',
  loginMethod: 'email'
});

// Sanitize data before logging
const sanitizeUserData = (userData: any) => {
  const { password, creditCard, ...safeData } = userData;
  return safeData;
};

logger.info('User data processed', sanitizeUserData(userData));
```

### **Production Log Filtering**
```typescript
// Filter sensitive logs in production
const logUserAction = (action: string, data: any) => {
  if (import.meta.env.MODE === 'production') {
    // Remove sensitive fields in production
    const { password, token, ...safeData } = data;
    logger.info(`User action: ${action}`, safeData);
  } else {
    logger.info(`User action: ${action}`, data);
  }
};
```

---

## 📚 API Reference

### **Logger Methods**
```typescript
// Basic logging methods
logger.debug(message: string, data?: any): void
logger.info(message: string, data?: any): void
logger.warn(message: string, data?: any): void
logger.error(message: string, error?: Error | any, data?: any): void
logger.fatal(message: string, error?: Error | any, data?: any): void

// Specialized logging methods
logger.apiCall(method: string, url: string, data?: any): void
logger.apiResponse(method: string, url: string, status: number, data?: any): void
logger.navigation(path: string, params?: any): void
logger.userAction(action: string, data?: any): void
logger.auth(event: string, userId?: string, data?: any): void

// Performance methods
logger.time(label: string): void
logger.timeEnd(label: string): void

// Utility methods
logger.getLogs(): LogEntry[]
logger.getLogsByLevel(level: LogLevel): LogEntry[]
logger.clearLogs(): void
logger.updateConfig(config: Partial<LoggerConfig>): void
logger.setUserId(userId: string): void
logger.exportLogs(): string
logger.getStats(): LoggingStats
```

### **Configuration Interface**
```typescript
interface LoggerConfig {
  enableConsole: boolean;
  enableRemote: boolean;
  enableLocalStorage: boolean;
  minLogLevel: LogLevel;
  maxLogEntries: number;
  remoteEndpoint?: string;
  userId?: string;
}
```

### **Log Entry Interface**
```typescript
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  data?: any;
  stack?: string;
  platform: string;
  appVersion: string;
  userId?: string;
  sessionId: string;
}
```

---

## 🎉 Conclusion

The logging system provides a comprehensive solution for monitoring your web application. Use it to:

- **Debug** issues during development
- **Monitor** performance in production
- **Track** user behavior and analytics
- **Detect** and respond to errors quickly
- **Improve** application quality over time

Remember to:
- Use appropriate log levels for different environments
- Avoid logging sensitive information
- Monitor performance impact of logging
- Regularly review and analyze logs
- Keep log retention policies in mind

---

**Last Updated:** 2025-07-12
**Version:** 1.0.0
**Next Review:** 2025-02-22 
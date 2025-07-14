# Project Structure Documentation

## 🌐 [PROJECT_NAME]

**Version:** [VERSION]
**Last Updated:** [LAST_UPDATED]
**Framework:** React with Vite  
**Language:** TypeScript  

---

## 🏗️ Directory Structure

```
[PROJECT_NAME]/
├── 📁 src/                     # Source code directory
│   ├── 📁 api/                 # API calls and backend integration
│   │   └── client.ts           # API client configuration
│   ├── 📁 components/          # Reusable UI components
│   │   ├── 📁 ui/              # Basic UI components
│   │   └── 📁 features/        # Feature-specific components
│   ├── 📁 pages/               # Page components
│   │   ├── 📁 Home/            # Home page
│   │   ├── 📁 Auth/            # Authentication pages
│   │   └── 📁 Dashboard/       # Dashboard pages
│   ├── 📁 hooks/               # Custom React hooks
│   ├── 📁 stores/              # State management
│   │   └── authStore.ts        # Authentication state store
│   ├── 📁 utils/               # Utility functions and helpers
│   │   └── logger.ts           # Logging utility
│   ├── 📁 types/               # TypeScript type definitions
│   ├── 📁 constants/           # App constants and configuration
│   ├── 📁 services/            # Business logic services
│   ├── 📄 App.tsx              # Main application component
│   ├── 📄 main.tsx             # Application entry point
│   ├── 📄 index.css            # Global styles and Tailwind imports
│   └── 📄 vite-env.d.ts        # Vite environment type definitions
├── 📁 public/                  # Static assets
│   ├── 📄 favicon.ico          # App favicon
│   ├── 📄 logo.svg             # App logo
│   └── 📁 images/              # Static images
├── 📁 docs/                    # Project documentation
├── 📁 tests/                   # Test files
├── 📁 dist/                    # Build output directory
├── 📄 index.html               # HTML entry point
├── 📄 package.json             # Dependencies and scripts
├── 📄 vite.config.ts           # Vite configuration
├── 📄 tailwind.config.js       # Tailwind CSS configuration
├── 📄 postcss.config.js        # PostCSS configuration
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 tsconfig.node.json       # TypeScript configuration for Node.js
├── 📄 .eslintrc.cjs            # ESLint configuration
├── 📄 .cursorrules             # AI development assistance rules
└── 📄 .env.example             # Environment variables template
```

---

## 🔧 Technology Stack

### **Core Technologies**
- **React**: Library for building user interfaces
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking

### **Styling**
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS post-processing
- **Autoprefixer**: Automatic vendor prefixing

### **State Management**
- **Zustand**: Lightweight state management
- **React Query**: Server state management

### **Backend & Database**
- **[BACKEND_SOLUTION]**: Backend-as-a-Service
  - Authentication
  - Database
  - Real-time subscriptions

### **Navigation**
- **React Router**: Declarative routing for React

### **Development Tools**
- **Vite**: Build tool and development server
- **ESLint**: Code linting
- **TypeScript**: Type checking

---

## 📋 File Conventions

### **Component Structure**
```typescript
// src/components/Button/Button.tsx
import React from 'react';

interface ButtonProps {
  title: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onClick, 
  variant = 'primary',
  disabled = false,
  size = 'md'
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-300'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {title}
    </button>
  );
};
```

### **Page Structure**
```typescript
// src/pages/HomePage/HomePage.tsx
import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/Button/Button';

export const HomePage: React.FC = () => {
  const { user, signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to [PROJECT_NAME]
            </h1>
            {user && (
              <Button
                title="Sign Out"
                onClick={signOut}
                variant="secondary"
              />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500 text-lg">
              {user ? `Hello, ${user.email}!` : 'Please sign in to continue'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
```

### **Hook Structure**
```typescript
// src/hooks/useApi.ts
import { useState, useEffect } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useApi = <T>(url: string): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
```

### **Store Structure**
```typescript
// src/stores/userStore.ts
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserState {
  user: User | null;
  users: User[];
  loading: boolean;
  setUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  users: [],
  loading: false,
  setUser: (user) => set({ user }),
  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),
  clearUser: () => set({ user: null }),
}));
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18+)
- npm or yarn
- Modern web browser

### **Installation**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Environment Setup**
1. Copy `.env.example` to `.env`
2. Fill in your environment variables:
   ```bash
   VITE_API_URL=your-api-url
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

---

## 📦 Package Management

### **Adding Dependencies**
```bash
# Production dependency
npm install package-name

# Development dependency
npm install --save-dev package-name

# Type definitions
npm install --save-dev @types/package-name
```

### **Key Dependencies**
- `react` - Core React library
- `react-dom` - React DOM rendering
- `react-router-dom` - Client-side routing
- `@supabase/supabase-js` - Backend integration
- `zustand` - State management
- `@tanstack/react-query` - Server state
- `tailwindcss` - Styling framework

---

## 🔄 Development Workflow

### **Daily Development**
1. **Start development server**: `npm run dev`
2. **Make changes** to source files
3. **Test in browser** - hot reload enabled
4. **Commit changes** with descriptive messages

### **Code Quality**
```bash
# Run linting
npm run lint

# Build for production (checks for errors)
npm run build

# Type checking
npx tsc --noEmit
```

### **Branch Strategy**
- `main` - Production ready code
- `develop` - Development integration
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

---

## 🧪 Testing Strategy

### **Browser Testing**
- **Development**: Chrome DevTools, responsive design mode
- **Cross-browser**: Firefox, Safari, Edge
- **Performance**: Lighthouse audits

### **Code Quality**
- **TypeScript**: Compile-time type checking
- **ESLint**: Code quality and consistency
- **Build process**: Vite build validation

---

## 🎨 Styling Guidelines

### **Tailwind CSS Usage**
```typescript
// Responsive design
<div className="w-full md:w-1/2 lg:w-1/3">
  <h2 className="text-xl md:text-2xl font-bold">Title</h2>
</div>

// State variants
<button className="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
  Click me
</button>

// Dark mode support
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content
</div>
```

### **Component Styling**
```typescript
// Use Tailwind classes for consistency
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    {children}
  </div>
);

// Custom styles when needed
const customStyles = {
  gradientBackground: 'bg-gradient-to-r from-blue-500 to-purple-600'
};
```

---

## 📱 Responsive Design

### **Breakpoints**
- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up
- `2xl`: 1536px and up

### **Mobile-First Approach**
```typescript
// Always design for mobile first, then add larger breakpoints
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">
    Responsive Title
  </h1>
</div>
```

---

## 🔐 Authentication Flow

### **Authentication Integration**
```typescript
// Login
const handleLogin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Handle successful login
    setUser(data.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Logout
const handleLogout = async () => {
  await supabase.auth.signOut();
  setUser(null);
};
```

### **Protected Routes**
```typescript
// Using React Router
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

---

## 📊 Performance Optimization

### **Code Splitting**
```typescript
// Lazy loading pages
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
  </Routes>
</Suspense>
```

### **Asset Optimization**
```typescript
// Image optimization
<img 
  src="/images/hero.jpg" 
  alt="Hero image"
  loading="lazy"
  className="w-full h-auto"
/>

// Icon optimization
import { ReactComponent as Logo } from './assets/logo.svg';
```

---

## 🐛 Debugging

### **Development Tools**
- **React DevTools**: Component inspection
- **Browser DevTools**: Network, performance, console
- **Vite DevTools**: Build analysis

### **Logging**
```typescript
import { logger } from './utils/logger';

// Development logging
logger.debug('Component rendered', { props });
logger.info('User action', { action: 'click', element: 'button' });
logger.error('API error', error);
```

---

## 🚀 Production Deployment

### **Build Process**
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Deploy to hosting service
npm run deploy
```

### **Deployment Platforms**
- **Vercel**: Zero-config deployment
- **Netlify**: Git-based deployment
- **AWS S3**: Static hosting with CloudFront
- **GitHub Pages**: Free hosting for public repos

---

## 🔗 Useful Resources

### **Documentation**
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

### **Tools**
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [TypeScript ESLint](https://typescript-eslint.io/)

---

**Last Updated:** [LAST_UPDATED]
**Framework Version:** React 18.2.0  
**Build Tool:** Vite 5.0.8  
**Next Review:** [NEXT_REVIEW] 
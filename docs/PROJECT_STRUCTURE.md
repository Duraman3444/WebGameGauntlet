# Project Structure Documentation

## 🌐 MyWebApp

**Version:** 1.0.0
**Last Updated:** 2025-07-12
**Framework:** React with Vite  
**Language:** TypeScript  

---

## 🏗️ Directory Structure

```
MyWebApp/
├── 📁 src/                     # Source code directory
│   ├── 📁 api/                 # API calls and Supabase integration
│   │   └── supabase.ts         # Supabase client configuration
│   ├── 📁 components/          # Reusable UI components
│   ├── 📁 pages/               # Page components
│   ├── 📁 stores/              # Zustand state management
│   │   └── authStore.ts        # Authentication state store
│   ├── 📁 utils/               # Utility functions and helpers
│   │   └── logger.ts           # Logging utility
│   ├── 📁 types/               # TypeScript type definitions
│   ├── 📁 constants/           # App constants and configuration
│   ├── 📄 App.tsx              # Main application component
│   ├── 📄 main.tsx             # Application entry point
│   ├── 📄 index.css            # Global styles and Tailwind imports
│   └── 📄 vite-env.d.ts        # Vite environment type definitions
├── 📁 public/                  # Static assets (images, fonts, etc.)
├── 📁 docs/                    # Project documentation
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
- **Supabase**: Backend-as-a-Service
  - Authentication
  - PostgreSQL database
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
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onClick, 
  variant = 'primary',
  disabled = false 
}) => {
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        variant === 'primary' 
          ? 'bg-blue-500 text-white hover:bg-blue-600' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to MyWebApp</h1>
      {user && (
        <p className="text-lg text-gray-600">Hello, {user.email}!</p>
      )}
    </div>
  );
};
```

### **Store Structure**
```typescript
// src/stores/exampleStore.ts
import { create } from 'zustand';

interface ExampleState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
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
2. Fill in your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

---

## 📦 Package Management

### **Adding Dependencies**
```bash
# Standard npm package
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

### **Deployment**
```bash
# Build production bundle
npm run build

# Deploy dist/ folder to hosting service
# Popular options: Vercel, Netlify, AWS S3
```

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

### **Custom Styles**
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component styles */
@layer components {
  .btn-primary {
    @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600;
  }
}
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

### **Supabase Integration**
```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Logout
await supabase.auth.signOut();

// Check session
const { data: { session } } = await supabase.auth.getSession();
```

### **Protected Routes**
```typescript
// Using React Router
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" />;
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
  <HomePage />
</Suspense>
```

### **Bundle Analysis**
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/
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
```

### **Deployment Options**
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
- [Supabase Documentation](https://supabase.com/docs)

### **Tools**
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [TypeScript ESLint](https://typescript-eslint.io/)

---

**Last Updated:** 2025-07-12
**Framework Version:** React 18.2.0  
**Build Tool:** Vite 5.0.8  
**Next Review:** 2025-02-22 
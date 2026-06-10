# FRONTEND SETUP & TROUBLESHOOTING GUIDE

## 🚀 QUICK START

### 1. **Clean Installation**
```bash
cd frontend
rm -r node_modules package-lock.json
npm install
```

### 2. **Start Development Server**
```bash
npm run dev
```
The app will run on `http://localhost:5173`

### 3. **Build for Production**
```bash
npm run build
npm run preview
```

---

## 🔧 WHAT WAS FIXED

### **Issue #1: Missing `vite.config.js`**
**Problem:** Vite didn't know how to process React JSX files
**Solution:** Created proper Vite config with React plugin
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],  // ← This enables JSX processing
  server: {
    port: 5173,
    host: true,
  },
})
```

### **Issue #2: Incomplete Tailwind Setup**
**Problem:** Tailwind directives were present but not fully configured
**Solution:** 
- Enhanced `tailwind.config.js` with proper content paths
- Added safelist for dynamic classes (error/success messages)
- Extended theme with custom colors for Palette brand

### **Issue #3: Missing Tailwind Reset**
**Problem:** Global styles weren't properly initialized
**Solution:** Added CSS reset and base layer to `style.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

### **Issue #4: Incomplete index.html**
**Problem:** Old template title and missing proper structure
**Solution:** Updated to proper React app setup

### **Issue #5: main.jsx Error Handling**
**Problem:** No validation for root element
**Solution:** Added error check to catch missing root div

---

## 📁 FRONTEND STRUCTURE NOW

```
frontend/
├── vite.config.js              ✅ NEW - Vite React config
├── tailwind.config.js          ✅ UPDATED - Full Tailwind config
├── postcss.config.js           ✅ OK - PostCSS config
├── index.html                  ✅ UPDATED - Proper React HTML
├── package.json                ✅ OK - Dependencies correct
├── src/
│   ├── main.jsx               ✅ UPDATED - React entry point
│   ├── App.jsx                ✅ UPDATED - App component
│   ├── style.css              ✅ UPDATED - Tailwind imports
│   ├── pages/
│   │   ├── Login.jsx          ✅ Ready - Login form
│   │   └── Register.jsx       ✅ Ready - Registration form
│   └── assets/                ✅ OK - Image assets
└── public/                     ✅ OK - Static files
```

---

## 🧪 HOW TO TEST

### **Test 1: Check if it starts**
```bash
npm run dev
```
Should see: `VITE v8.x.x  ready in XXX ms`

### **Test 2: Open in browser**
Go to `http://localhost:5173`
You should see:
- Palette logo (top-left)
- "WELCOME BACK" heading
- Email input field
- Password input field  
- "Sign in to Palette" button
- "Don't have an account? Register" link at bottom

### **Test 3: Test Login Form**
1. Click "Don't have an account? Register" → Should switch to Register page
2. Fill in Register form
3. Click "Already have an account? Sign in" → Back to Login

### **Test 4: Test Styling**
- Check if inputs have proper styling (borders, focus states)
- Check if logo and heading are visible
- Check if buttons are styled with dark background
- Check if hover effects work on buttons

---

## 🔍 TROUBLESHOOTING

### **Issue: "Cannot find module 'react-icons/fi'"**
```bash
npm install react-icons
npm install framer-motion
```

### **Issue: Tailwind styles not applying**
1. Clear cache:
```bash
rm -r .vite node_modules
npm install
```
2. Check that `style.css` has `@tailwind` directives
3. Verify `tailwind.config.js` has correct content paths

### **Issue: Port 5173 already in use**
```bash
# Kill the process on port 5173
npx kill-port 5173
npm run dev
```

### **Issue: "root element not found"**
1. Check `index.html` has `<div id="root"></div>`
2. Check `main.jsx` imports from correct path
3. Check script tag in HTML loads `/src/main.jsx`

### **Issue: Icons not showing**
1. Install: `npm install react-icons`
2. Clear node_modules: `rm -r node_modules && npm install`
3. Restart dev server: `npm run dev`

---

## 📦 REQUIRED DEPENDENCIES

All these are already in `package.json`:

```json
{
  "dependencies": {
    "react": "^19.2.7",           // React core
    "react-dom": "^19.2.7",       // React DOM
    "framer-motion": "^12.40.0",  // Animations
    "react-icons": "^5.6.0",      // Icon library
    "lucide-react": "^1.17.0"     // Alternative icons
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.2",  // Vite React support
    "vite": "^8.0.12",                 // Build tool
    "tailwindcss": "^3.4.19",          // Styling
    "postcss": "^8.5.15",              // CSS processing
    "autoprefixer": "^10.5.0"          // Vendor prefixes
  }
}
```

---

## 🎨 COMPONENT ARCHITECTURE

### **App.jsx (Root Component)**
- Manages page state: `login` or `register`
- Switches between Login and Register pages
- Passes `onSwitch` callback to each page

### **Login.jsx**
- Email input with icon
- Password input with show/hide toggle
- Login button that calls `/api/auth/login`
- Switch to Register link
- Success/error message display
- Loading state management

### **Register.jsx**
- Full name input
- Email input
- Password input with show/hide
- Currency selector (PKR/USD)
- Register button that calls `/api/auth/register`
- Switch to Login link
- Success/error message display
- Loading state management

---

## 🔗 API ENDPOINTS USED

```
POST http://localhost:8081/api/auth/login
POST http://localhost:8081/api/auth/register
```

Both are already configured in Login.jsx and Register.jsx

---

## ✨ FEATURES

✅ Beautiful gradient backgrounds
✅ Smooth animations (Framer Motion)
✅ Form validation
✅ Error/success messages
✅ Password visibility toggle
✅ Responsive design (Tailwind CSS)
✅ Icon support (React Icons)
✅ Loading states
✅ Dark/Light theme ready

---

## 🚀 NEXT STEPS

After testing:
1. **Connect to Backend:**
   - Ensure Spring Boot is running on port 8081
   - Backend API endpoints ready

2. **Add More Pages:**
   - Dashboard page
   - Product browsing page
   - Shopping cart page
   - Checkout page
   - Design quiz page

3. **State Management:**
   - Consider adding Context API or Zustand
   - Store user session
   - Store cart data

4. **Routing:**
   - Add React Router for multiple pages
   - Protected routes for authenticated users

---

## 💡 COMMON COMMANDS

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install new package
npm install package-name

# Clean install
rm -r node_modules && npm install
```

---

## 📝 NOTES

- Backend MUST be running on `http://localhost:8081`
- Frontend runs on `http://localhost:5173`
- All API calls are CORS-enabled (check backend SecurityConfig)
- Tailwind CSS purges unused styles in production
- React 19 is being used (latest version)

---

Generated: 2026-06-10
Status: ✅ All fixes applied

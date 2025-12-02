# 🚀 Quick Start Guide - SPICE Project

## For Developers Cloning This Repository

### 1️⃣ Backend Setup (FastAPI + MongoDB)

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# Run the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Test Backend:**
```bash
curl http://localhost:8001/api/
# Should return: {"message": "Hello World"}
```

---

### 2️⃣ Frontend Setup (React Web)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
yarn install

# Configure environment
# The .env file should already exist with REACT_APP_BACKEND_URL

# Run the development server
yarn start
```

**Access Frontend:**
Open http://localhost:3000 in your browser

---

### 3️⃣ Mobile App Setup (React Native + Expo)

```bash
# Navigate to root directory
cd /path/to/project

# Install dependencies
npm install

# Update Supabase credentials
# Edit src/config.ts with your Supabase project URL and anon key

# Start Expo development server
npm start
```

**Run on Device:**
1. Install "Expo Go" app on your iOS/Android device
2. Scan the QR code from terminal
3. App will load on your device

---

## 📋 Prerequisites

### Backend
- Python 3.11+
- MongoDB (local or cloud instance)
- pip or conda

### Frontend
- Node.js 18+
- Yarn package manager

### Mobile App
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone
- Supabase project (create at supabase.com)

---

## 🔧 Environment Variables

### Backend (.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="your_database_name"
CORS_ORIGINS="*"
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Mobile App (src/config.ts)
```typescript
export const supabaseUrl = 'YOUR_SUPABASE_URL';
export const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

---

## 🐛 Common Issues

### Backend won't start
- Ensure MongoDB is running
- Check Python version: `python --version`
- Verify .env file exists and has correct values

### Frontend build errors
- Clear node_modules: `rm -rf node_modules && yarn install`
- Check Node version: `node --version`
- Ensure backend URL in .env is correct

### Mobile app errors
- Update Expo CLI: `npm install -g expo-cli@latest`
- Clear cache: `expo start -c`
- Check Supabase credentials in src/config.ts

---

## 📱 Project Components

| Component | Port | Purpose |
|-----------|------|---------|
| Backend API | 8001 | REST API endpoints |
| Web Frontend | 3000 | React web application |
| Mobile App | - | React Native mobile app |
| MongoDB | 27017 | Database |

---

## 🧪 Quick Test

After setup, verify everything works:

```bash
# Test backend
curl http://localhost:8001/api/

# Test creating a status check
curl -X POST http://localhost:8001/api/status \
  -H "Content-Type: application/json" \
  -d '{"client_name": "Test"}'

# Frontend should automatically make API calls when you open it
# Check browser console for "Hello World" log
```

---

## 📖 Documentation

- **Backend API**: See `/backend/server.py` for available endpoints
- **Frontend**: See `/frontend/README.md`
- **Mobile App**: See `/README.md` (root level)
- **Full Setup Guide**: See `PROJECT_SETUP.md`

---

## 🆘 Need Help?

1. Check the respective README files
2. Review `PROJECT_SETUP.md` for detailed setup
3. Ensure all prerequisites are installed
4. Check console/terminal for error messages

---

**Happy Coding! 🚀**

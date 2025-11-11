# 🚀 Quick Setup - Safe Map with OpenStreetMap

## Prerequisites
- macOS (your system)
- Internet connection
- Terminal access

---

## Step 1: Install Node.js

**Choose one method:**

### Using Homebrew (Recommended)
```bash
brew install node
```

### Using nvm
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc
nvm install --lts
```

### Direct Download
Visit: https://nodejs.org/ → Download macOS installer

**Verify:**
```bash
node --version  # Should be v18+
npm --version   # Should be v9+
```

---

## Step 2: Install Dependencies

```bash
cd /Users/alvinho/Projects/nt-roadmap
npm install
```

Wait for installation to complete (~2-5 minutes).

---

## Step 3: Create Environment Files

```bash
# Backend
cp packages/server/.env.example packages/server/.env

# Frontend  
cp packages/web/.env.example packages/web/.env
```

**Note:** Default values work! No editing needed.

---

## Step 4: Start the App

```bash
npm run dev
```

Wait for:
```
Backend: http://localhost:3001
Frontend: http://localhost:5173
```

---

## Step 5: Open Browser

Visit: **http://localhost:5173**

You should see:
- ✅ OpenStreetMap loads
- ✅ Incident markers appear
- ✅ Interactive sidebar
- ✅ No API keys needed!

---

## 🎉 That's It!

**What changed:**
- ❌ Removed Google Maps (required API key)
- ✅ Added OpenStreetMap (free, no keys!)

**Benefits:**
- No API key setup
- No billing
- No Google account needed
- Same functionality

---

## 📖 More Info

- Full details: `MIGRATION_SUMMARY.md`
- Migration guide: `OPENSTREETMAP_MIGRATION.md`
- Main docs: `README.md`

---

## ❓ Need Help?

**Map not loading?**
- Check internet connection
- Refresh browser
- Check console (F12)

**Errors during npm install?**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Port already in use?**
- Stop other apps using port 3001 or 5173
- Or edit port in `packages/server/src/index.ts`

---

**Happy mapping! 🗺️**

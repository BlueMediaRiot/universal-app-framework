# 📦 Intelligence Framework - Download & Installation

You have **2 download options** - choose whichever works best for you:

## 📥 Download Options

### Option 1: TAR.GZ (28 KB) - Recommended for Mac/Linux
**File**: `intelligence-framework-complete.tar.gz`

### Option 2: ZIP (42 KB) - Recommended for Windows
**File**: `intelligence-framework-complete.zip`

Both contain the exact same files!

---

## 🚀 Quick Installation

### Step 1: Download
Download one of the files above (tar.gz OR zip)

### Step 2: Extract

**For TAR.GZ (Mac/Linux):**
```bash
cd /path/to/your/universal-app-framework
tar -xzf ~/Downloads/intelligence-framework-complete.tar.gz
```

**For ZIP (Windows/Mac):**
```bash
cd /path/to/your/universal-app-framework
unzip ~/Downloads/intelligence-framework-complete.zip
```

Or just double-click the zip file and drag the folder to your project.

### Step 3: Move Files to Project Root

After extraction, you'll have a folder called `intelligence-framework/`. 

**Move the contents** (not the folder itself) to your project root:

```bash
# Mac/Linux
cd /path/to/your/universal-app-framework
mv intelligence-framework/* .
mv intelligence-framework/.* . 2>/dev/null || true
rm -rf intelligence-framework/

# Windows (PowerShell)
cd C:\path\to\your\universal-app-framework
Move-Item intelligence-framework\* . -Force
Remove-Item intelligence-framework -Recurse
```

Your project should now have:
```
your-project/
├── .framework/
│   ├── intelligence.yaml
│   └── self-healing-config.yaml
├── .github/
│   └── workflows/
│       └── intelligence.yml
├── execution/
│   ├── setup-intelligence.ts
│   └── intelligence/
│       └── (8 TypeScript files)
├── package.json  (updated)
├── tsconfig.json
└── (5 documentation markdown files)
```

### Step 4: Install & Setup

```bash
# Install dependencies
pnpm install

# Setup intelligence database
pnpm run intelligence:setup

# Generate first report
pnpm run intelligence:report
```

You should see:
```
✅ Intelligence database setup complete!
📁 Database location: .framework/data/intelligence.db
```

### Step 5: View Dashboard

```bash
cat .dashboard/INTELLIGENCE.md
```

---

## 📁 What's Inside the Archive

### Documentation (5 files)
- `FILE-INDEX.md` - Complete file listing
- `README-INTELLIGENCE.md` - Main documentation
- `INTELLIGENCE-INSTALLATION.md` - Detailed setup guide
- `INTELLIGENCE-QUICK-REF.md` - Command reference
- `IMPLEMENTATION-CHECKLIST.md` - Progress tracker

### Configuration (4 files)
- `package.json` - Scripts and dependencies
- `tsconfig.json` - TypeScript config
- `.framework/intelligence.yaml` - Intelligence settings
- `.framework/self-healing-config.yaml` - Auto-repair config

### Code (9 TypeScript files)
- `execution/setup-intelligence.ts` - Database setup
- `execution/intelligence/self-healing.ts` - Auto-repair
- `execution/intelligence/analyze-patterns.ts` - Pattern detection
- `execution/intelligence/decision-engine.ts` - MCDA
- `execution/intelligence/risk-assessment.ts` - Risk analysis
- `execution/intelligence/error-mining.ts` - Error patterns
- `execution/intelligence/predictive-cores.ts` - Core prediction
- `execution/intelligence/meta-learner.ts` - Meta-learning
- `execution/intelligence/generate-report.ts` - Dashboard

### Automation (1 file)
- `.github/workflows/intelligence.yml` - Daily analysis

**Total: 19 files, ~4,400 lines of code + docs**

---

## ✅ Verification

After installation, verify everything is working:

```bash
# Check files exist
ls .framework/intelligence.yaml
ls execution/intelligence/

# Check database was created
ls .framework/data/intelligence.db

# Check dashboard was generated
ls .dashboard/INTELLIGENCE.md

# Run test command
pnpm run intelligence:report
```

All commands should work without errors.

---

## 🎯 First Steps

1. **Read the installation guide**
   ```bash
   cat INTELLIGENCE-INSTALLATION.md
   ```

2. **Follow the checklist**
   ```bash
   cat IMPLEMENTATION-CHECKLIST.md
   ```

3. **Keep quick reference handy**
   ```bash
   cat INTELLIGENCE-QUICK-REF.md
   ```

4. **Start using it!**
   ```bash
   pnpm run intelligence:all
   ```

---

## 🆘 Troubleshooting

### "pnpm: command not found"
```bash
npm install -g pnpm
```

### "Database locked" error
```bash
rm .framework/data/intelligence.db
pnpm run intelligence:setup
```

### "Cannot find module" errors
```bash
pnpm install
```

### Files in wrong location
Make sure you moved the **contents** of `intelligence-framework/`, not the folder itself.

---

## 📞 Need Help?

1. Check `INTELLIGENCE-INSTALLATION.md` - comprehensive guide
2. Check `INTELLIGENCE-QUICK-REF.md` - common commands
3. Check `IMPLEMENTATION-CHECKLIST.md` - step-by-step

---

## 🎉 You're All Set!

Once installed, run:
```bash
pnpm run intelligence:report
```

Then check `.dashboard/INTELLIGENCE.md` for your first intelligence dashboard!

**Total setup time: ~5 minutes** ⏱️

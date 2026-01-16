# 🚀 Intelligence Framework - Installation Guide

This guide will help you set up the Intelligence Framework upgrade for your Universal App Framework.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 20.x or higher** (`node --version`)
- **pnpm 8.x or higher** (`pnpm --version`)
- **Git 2.40+** (`git --version`)
- **SQLite 3.x** (usually pre-installed)

## 🎯 Quick Start (5 minutes)

```bash
# 1. Navigate to your project
cd /path/to/universal-app-framework

# 2. Install dependencies
pnpm install

# 3. Setup intelligence database
pnpm run intelligence:setup

# 4. Verify installation
pnpm run intelligence:report
```

You should see:
```
✅ Intelligence database setup complete!
📁 Database location: .framework/data/intelligence.db
```

## 📁 Directory Structure

After installation, you'll have:

```
universal-app-framework/
├── .framework/
│   ├── intelligence.yaml          # Main intelligence config
│   ├── self-healing-config.yaml   # Self-healing settings
│   └── data/
│       └── intelligence.db         # SQLite database
│
├── .dashboard/
│   ├── INTELLIGENCE.md             # Main dashboard
│   ├── inbox/                      # Decisions pending
│   ├── suggestions/                # AI suggestions
│   ├── intelligence/               # Analysis outputs
│   └── reports/                    # Weekly reports
│
├── execution/
│   ├── setup-intelligence.ts       # Database setup
│   └── intelligence/
│       ├── self-healing.ts         # Auto-repair system
│       ├── analyze-patterns.ts     # Pattern detection
│       ├── decision-engine.ts      # MCDA decision maker
│       ├── risk-assessment.ts      # Risk analyzer
│       ├── error-mining.ts         # Error pattern mining
│       ├── predictive-cores.ts     # Core prediction
│       ├── meta-learner.ts         # Meta-learning agent
│       └── generate-report.ts      # Dashboard generator
│
├── .github/
│   └── workflows/
│       └── intelligence.yml        # Auto-analysis workflow
│
└── package.json                    # Updated with new scripts
```

## 🔧 Configuration

### 1. Intelligence Settings

Edit `.framework/intelligence.yaml`:

```yaml
# Start with basic level
intelligence_level: "basic"  # basic -> intermediate -> advanced

# Adjust thresholds
learning:
  confidence_threshold: 0.85  # Lower = more auto-approvals
  pattern_detection_threshold: 3  # Patterns after N occurrences
```

### 2. Self-Healing Settings

Edit `.framework/self-healing-config.yaml`:

```yaml
# Enable/disable monitors
monitors:
  - name: test_failures
    enabled: true  # Set to false to disable

# Adjust auto-recovery
auto_recovery_actions:
  test_failure:
    - action: rollback_last_commit
      max_attempts: 1  # Increase for more retries
```

## 🎮 Usage

### Daily Commands

```bash
# Morning routine (check what happened overnight)
pnpm run intelligence:report

# Check pending decisions
cat .dashboard/inbox/*.md

# Run self-healing check
pnpm run monitor
```

### Weekly Commands

```bash
# Full analysis
pnpm run intelligence:all

# View meta-learning insights
cat .dashboard/reports/meta-learner-weekly.md
```

### Individual Analysis Tools

```bash
# Pattern detection (finds decision patterns)
pnpm run intelligence:patterns

# Risk assessment (demo)
pnpm run intelligence:risks

# Error mining (finds recurring errors)
pnpm run intelligence:errors

# Predictive cores (suggests new cores)
pnpm run intelligence:predict

# Meta-learning (analyzes the system itself)
pnpm run intelligence:meta
```

## 📊 Monitoring Setup

### Option 1: Manual Monitoring

Run periodically:
```bash
# Every few hours
pnpm run monitor
```

### Option 2: Cron Job (Recommended)

```bash
# Edit crontab
crontab -e

# Add this line (runs every 15 minutes)
*/15 * * * * cd /path/to/project && pnpm run monitor
```

### Option 3: GitHub Actions (Automatic)

Already configured! The workflow runs daily at 2 AM automatically.

To trigger manually:
1. Go to GitHub → Actions
2. Select "Intelligence Analysis"
3. Click "Run workflow"

## 🎯 First Steps After Installation

### 1. Generate Initial Report

```bash
pnpm run intelligence:report
```

Open `.dashboard/INTELLIGENCE.md` to see your dashboard.

### 2. Simulate Some Data (Optional)

To test the system, you can manually insert test data:

```bash
# Open SQLite
sqlite3 .framework/data/intelligence.db

# Insert a test decision
INSERT INTO decisions (id, type, context, decision, created_at)
VALUES ('test1', 'approve_core_creation', '{"core": "test"}', 'approved', datetime('now'));

# Exit
.exit

# Analyze
pnpm run intelligence:patterns
```

### 3. Check the Dashboard

```bash
cat .dashboard/INTELLIGENCE.md
```

### 4. Review Suggestions

```bash
ls .dashboard/suggestions/
cat .dashboard/suggestions/*.md
```

## 🔍 Troubleshooting

### Database Locked Error

```bash
# Close any open connections, then:
rm .framework/data/intelligence.db
pnpm run intelligence:setup
```

### Missing Dependencies

```bash
# Reinstall everything
rm -rf node_modules
pnpm install
```

### TypeScript Errors

```bash
# Install TypeScript definitions
pnpm add -D @types/node @types/better-sqlite3 @types/js-yaml
```

### Permission Errors

```bash
# Make scripts executable
chmod +x execution/intelligence/*.ts
```

## 📈 Gradual Rollout Plan

### Week 1: Observation Mode
- ✅ Run `intelligence:report` daily
- ✅ Review suggestions but don't auto-approve
- ✅ Monitor self-healing (notifications only)

### Week 2: Pattern Learning
- ✅ Enable pattern detection
- ✅ Let system suggest auto-approvals
- ✅ Review and approve/reject patterns

### Week 3: Risk Assessment
- ✅ Start using risk assessment for changes
- ✅ Follow mitigation recommendations

### Week 4: Full Automation
- ✅ Enable auto-approvals for high-confidence patterns
- ✅ Let self-healing auto-fix simple issues
- ✅ Trust the system more

## 🎛️ Customization

### Add Custom Metrics

Edit `execution/intelligence/generate-report.ts`:

```typescript
private getCustomMetric(): string {
  // Add your custom logic
  return 'My custom metric value'
}
```

### Adjust Risk Thresholds

Edit `.framework/intelligence.yaml`:

```yaml
risk_assessment:
  critical_threshold: 0.9  # More strict (was 0.8)
  high_threshold: 0.7      # More strict (was 0.6)
```

### Change Analysis Frequency

Edit `.github/workflows/intelligence.yml`:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours instead of daily
```

## 🆘 Getting Help

### Check Logs

All scripts output to console. To save logs:

```bash
pnpm run intelligence:all > intelligence.log 2>&1
```

### Inspect Database

```bash
sqlite3 .framework/data/intelligence.db

# List tables
.tables

# View patterns
SELECT * FROM patterns;

# View recent decisions
SELECT * FROM decisions ORDER BY created_at DESC LIMIT 10;

# Exit
.exit
```

### Reset Everything

```bash
# Nuclear option - fresh start
rm -rf .framework/data/intelligence.db
rm -rf .dashboard/
pnpm run intelligence:setup
```

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Dashboard generates without errors
2. ✅ Database file exists: `.framework/data/intelligence.db`
3. ✅ Reports appear in `.dashboard/reports/`
4. ✅ Suggestions appear in `.dashboard/suggestions/`
5. ✅ Patterns detected after making some decisions

## 🚀 Next Steps

Once installed:

1. **Read the dashboard**: `cat .dashboard/INTELLIGENCE.md`
2. **Make some decisions**: The system learns from your choices
3. **Review patterns**: Check `.dashboard/suggestions/`
4. **Adjust settings**: Tune `.framework/intelligence.yaml`
5. **Enable automation**: Increase autonomy gradually

## 📚 Further Reading

- [Main Specification](./UNIVERSAL-APP-FRAMEWORK-SPEC.md)
- [Intelligence Configuration](./.framework/intelligence.yaml)
- [Self-Healing Guide](./.framework/self-healing-config.yaml)

---

**Installation complete!** 🎉

Run `pnpm run intelligence:report` to see your first intelligence dashboard.

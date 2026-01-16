# 🎯 Intelligence Framework - Quick Reference

## 🚀 Daily Commands

```bash
# Morning check
pnpm run intelligence:report    # Generate dashboard

# Review decisions
ls .dashboard/inbox/            # Pending decisions
ls .dashboard/suggestions/      # AI suggestions

# Run monitoring
pnpm run monitor                # Self-healing check
```

## 📊 Analysis Commands

```bash
# Full analysis suite
pnpm run intelligence:all       # Run everything

# Individual analyses
pnpm run intelligence:patterns  # Find decision patterns
pnpm run intelligence:risks     # Assess risks
pnpm run intelligence:errors    # Mine error patterns
pnpm run intelligence:predict   # Predict needed cores
pnpm run intelligence:meta      # Meta-learning analysis
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.dashboard/INTELLIGENCE.md` | Main dashboard |
| `.dashboard/inbox/*.md` | Decisions awaiting you |
| `.dashboard/suggestions/*.md` | AI recommendations |
| `.dashboard/reports/*.md` | Weekly reports |
| `.framework/intelligence.yaml` | Main config |
| `.framework/data/intelligence.db` | Database |

## 🎛️ Configuration Quick Edits

### Increase Auto-Approval

```yaml
# .framework/intelligence.yaml
learning:
  confidence_threshold: 0.75  # Lower = more auto-approvals (was 0.85)
```

### Disable Self-Healing

```yaml
# .framework/self-healing-config.yaml
enabled: false
```

### Change Risk Levels

```yaml
# .framework/intelligence.yaml
risk_assessment:
  critical_threshold: 0.9  # More strict
  high_threshold: 0.7      # More strict
```

## 🧠 Intelligence Levels

| Level | Auto-Approvals | Risk Taking | Learning Speed |
|-------|---------------|-------------|----------------|
| **basic** | Few | Conservative | Slow |
| **intermediate** | Some | Moderate | Medium |
| **advanced** | Many | Calculated | Fast |
| **expert** | Most | Aggressive | Very Fast |

Change in `.framework/intelligence.yaml`:
```yaml
intelligence_level: "intermediate"  # Upgrade from basic
```

## 🔍 Inspecting Data

```bash
# Open database
sqlite3 .framework/data/intelligence.db

# Useful queries
SELECT * FROM patterns;                    # See learned patterns
SELECT * FROM decisions LIMIT 10;          # Recent decisions
SELECT * FROM risk_assessments;            # Risk assessments
SELECT * FROM meta_learnings;              # System learnings

# Exit
.exit
```

## ⚡ Quick Fixes

### Database Locked
```bash
rm .framework/data/intelligence.db && pnpm run intelligence:setup
```

### Missing Dependencies
```bash
rm -rf node_modules && pnpm install
```

### Reset Everything
```bash
rm -rf .framework/data/ .dashboard/
pnpm run intelligence:setup
```

## 📈 Metrics Tracked

- **Patterns**: Decision patterns you follow
- **Metrics**: Performance measurements
- **Errors**: Error occurrences and patterns
- **Risks**: Risk assessments of changes
- **Experiments**: A/B test results
- **Performance Baselines**: Performance benchmarks
- **User Behavior**: Your decision-making patterns
- **Meta Learnings**: System self-improvements

## 🎯 Success Indicators

✅ **Working Well:**
- Dashboard generates without errors
- Patterns detected after 3-5 decisions
- Suggestions appear in `.dashboard/suggestions/`
- Self-healing catches test failures

❌ **Needs Attention:**
- No patterns after 20+ decisions → Lower confidence threshold
- Too many false positives → Raise confidence threshold
- Database errors → Check SQLite installation
- No suggestions → Run `pnpm run intelligence:predict`

## 🔔 Notifications

Intelligence notifications appear in:
1. **Inbox**: `.dashboard/inbox/*.md` (needs your decision)
2. **Suggestions**: `.dashboard/suggestions/*.md` (optional improvements)
3. **Reports**: `.dashboard/reports/*.md` (weekly summaries)

## 🎨 Customization Points

### Add Custom Analysis
Create `execution/intelligence/my-analysis.ts`:
```typescript
import Database from 'better-sqlite3'

const db = new Database('.framework/data/intelligence.db')
// Your analysis here
db.close()
```

Add to `package.json`:
```json
"intelligence:custom": "tsx execution/intelligence/my-analysis.ts"
```

### Extend Dashboard
Edit `execution/intelligence/generate-report.ts`:
```typescript
private getMyMetric(): string {
  // Add your metric
  return 'Custom metric value'
}
```

## 🆘 Emergency Commands

```bash
# Stop all automation
echo "enabled: false" > .framework/self-healing-config.yaml

# Pause learning
echo "intelligence_level: basic" > .framework/intelligence.yaml

# Delete recent decisions
sqlite3 .framework/data/intelligence.db "DELETE FROM decisions WHERE created_at > datetime('now', '-1 day')"

# Fresh start
rm -rf .framework/data/intelligence.db && pnpm run intelligence:setup
```

## 📞 Debug Info

When reporting issues, include:

```bash
# System info
node --version
pnpm --version
sqlite3 --version

# Database info
ls -lh .framework/data/intelligence.db

# Recent logs
pnpm run intelligence:report > debug.log 2>&1
```

## 🎓 Learning Resources

1. **Main Spec**: `UNIVERSAL-APP-FRAMEWORK-SPEC.md`
2. **Installation**: `INTELLIGENCE-INSTALLATION.md`
3. **This Guide**: `INTELLIGENCE-QUICK-REF.md`
4. **Config Files**: `.framework/*.yaml`

## 💡 Pro Tips

1. **Review patterns weekly** to spot trends
2. **Lower confidence gradually** as you trust the system
3. **Check suggestions daily** for quick wins
4. **Use meta-learner** to optimize the system itself
5. **Backup database** before major changes: 
   ```bash
   cp .framework/data/intelligence.db .framework/data/intelligence.db.backup
   ```

---

**Quick Start**: `pnpm run intelligence:report` to see your dashboard!

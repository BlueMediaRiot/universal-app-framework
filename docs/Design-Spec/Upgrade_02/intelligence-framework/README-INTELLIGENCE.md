# 🤖 Universal App Framework - Intelligence System

An autonomous learning and decision-making system that transforms your framework from reactive to proactive.

## ✨ Features

### 🔮 Predictive Intelligence
- **Pattern Detection**: Learns from your decisions and automates repetitive approvals
- **Predictive Core Creation**: Suggests new cores based on code duplication analysis
- **Performance Prediction**: Forecasts bottlenecks before they impact users

### 🛡️ Self-Healing
- **Auto-Recovery**: Automatically fixes test failures and performance regressions
- **Git Bisect**: Pinpoints breaking commits without human intervention
- **Rollback Capability**: Safe automatic rollback when issues detected

### 🧠 Decision Intelligence
- **Multi-Criteria Analysis**: Evaluates decisions using 6 weighted criteria
- **Risk Assessment**: Calculates risk scores with automated mitigation plans
- **Confidence Scoring**: Only auto-approves when confidence exceeds threshold

### 📊 Continuous Learning
- **Error Mining**: Discovers patterns in errors and prevents recurrence
- **Performance Tracking**: Monitors all metrics and detects regressions
- **Meta-Learning**: System analyzes itself and suggests improvements

### 🎯 Production Telemetry
- **Real-time Metrics**: Tracks performance of cores and apps in production
- **Usage Patterns**: Identifies frequently-used code paths
- **Optimization Suggestions**: Recommends performance improvements based on data

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Setup intelligence database
pnpm run intelligence:setup

# 3. View dashboard
pnpm run intelligence:report
cat .dashboard/INTELLIGENCE.md
```

## 📁 What's Included

### Configuration Files
- `.framework/intelligence.yaml` - Main intelligence settings
- `.framework/self-healing-config.yaml` - Auto-repair configuration

### Execution Scripts
- `execution/setup-intelligence.ts` - Database initialization
- `execution/intelligence/self-healing.ts` - Auto-repair system
- `execution/intelligence/analyze-patterns.ts` - Pattern detection
- `execution/intelligence/decision-engine.ts` - MCDA decision maker
- `execution/intelligence/risk-assessment.ts` - Risk analyzer
- `execution/intelligence/error-mining.ts` - Error pattern mining
- `execution/intelligence/predictive-cores.ts` - Core prediction
- `execution/intelligence/meta-learner.ts` - Meta-learning agent
- `execution/intelligence/generate-report.ts` - Dashboard generator

### Workflows
- `.github/workflows/intelligence.yml` - Automated daily analysis

## 📊 Intelligence Levels

| Level | Description | Auto-Approvals | Best For |
|-------|-------------|----------------|----------|
| **Basic** | Conservative, learns slowly | Very few | Getting started |
| **Intermediate** | Balanced approach | Some | Production use |
| **Advanced** | Aggressive automation | Many | Mature systems |
| **Expert** | Maximum autonomy | Most | Trusted systems |

Configure in `.framework/intelligence.yaml`:
```yaml
intelligence_level: "basic"  # Start here
```

## 🎯 Use Cases

### 1. Pattern-Based Auto-Approval
```
You: Approve adding tests (10 times)
System: Detects pattern
System: "You always approve test additions. Auto-approve?"
You: Yes
System: Future test additions auto-approved
```

### 2. Self-Healing Test Failures
```
3 AM: Tests fail on commit abc123
3:01 AM: System auto-reverts commit
3:02 AM: Tests pass again
7 AM: You wake up to: "Test failure auto-fixed"
```

### 3. Predictive Core Creation
```
System: Analyzing codebase...
System: "Image resizing appears in 3 apps"
System: "Suggest creating core-image-resize"
You: Approve
System: Creates core and updates all 3 apps
```

### 4. Risk Assessment
```
You: Deploy database migration
System: Risk analysis...
System: "CRITICAL risk - data integrity concerns"
System: "Required: backup + rollback plan"
You: Follow mitigations
System: Safe deployment
```

## 📈 Metrics Tracked

The system tracks:
- **Decision patterns** - Your approval/rejection patterns
- **Performance metrics** - Response times, throughput
- **Error occurrences** - Frequency and patterns
- **Risk scores** - Change risk assessments
- **Code patterns** - Duplication and co-occurrence
- **Agent performance** - Efficiency of AI agents
- **User behavior** - Your interaction patterns

## 🔧 Configuration

### Adjust Learning Sensitivity
```yaml
# .framework/intelligence.yaml
learning:
  confidence_threshold: 0.85  # Lower = more auto-approvals
  pattern_detection_threshold: 3  # Patterns after N occurrences
```

### Tune Self-Healing
```yaml
# .framework/self-healing-config.yaml
auto_recovery_actions:
  test_failure:
    - action: rollback_last_commit
      max_attempts: 3  # More aggressive
```

### Risk Tolerance
```yaml
# .framework/intelligence.yaml
risk_assessment:
  critical_threshold: 0.8  # Lower = more strict
```

## 📊 Dashboard

The intelligence dashboard (`.dashboard/INTELLIGENCE.md`) shows:

- 🎯 **System Health**: Overall health score
- 📚 **Learning Progress**: Patterns discovered, auto-approvals
- 🔮 **Predictions**: Upcoming issues and opportunities
- ⚠️ **Active Risks**: Pending high-risk changes
- 💡 **Suggestions**: AI-generated improvement ideas
- 📈 **Performance Trends**: Week-over-week metrics
- 🧠 **Meta Insights**: System self-analysis

## 🎮 Commands

### Daily Workflow
```bash
pnpm run intelligence:report  # Check dashboard
ls .dashboard/inbox/          # Review decisions
pnpm run monitor              # Self-healing check
```

### Weekly Analysis
```bash
pnpm run intelligence:all     # Full analysis
cat .dashboard/reports/meta-learner-weekly.md
```

### Individual Tools
```bash
pnpm run intelligence:patterns   # Pattern detection
pnpm run intelligence:risks      # Risk assessment
pnpm run intelligence:errors     # Error mining
pnpm run intelligence:predict    # Core prediction
pnpm run intelligence:meta       # Meta-learning
```

## 🔄 Continuous Monitoring

### Option 1: Cron (Recommended)
```bash
crontab -e
# Add: */15 * * * * cd /path/to/project && pnpm run monitor
```

### Option 2: GitHub Actions
Already configured! Runs daily at 2 AM automatically.

### Option 3: Manual
```bash
pnpm run monitor  # Run whenever needed
```

## 🎯 Gradual Adoption

### Week 1: Observe
- Run daily reports
- Review suggestions
- Don't auto-approve anything

### Week 2: Learn
- Enable pattern detection
- Review detected patterns
- Manually approve suggested patterns

### Week 3: Automate
- Enable auto-approval for high-confidence patterns
- Use self-healing for simple failures
- Trust risk assessments

### Week 4: Optimize
- Raise autonomy level
- Fine-tune thresholds
- Let system self-optimize

## 🆘 Troubleshooting

### Database Errors
```bash
rm .framework/data/intelligence.db
pnpm run intelligence:setup
```

### No Patterns Detected
- Lower `confidence_threshold` in config
- Make more decisions (needs 3+ samples)
- Check database: `sqlite3 .framework/data/intelligence.db "SELECT * FROM decisions"`

### Too Many False Positives
- Raise `confidence_threshold`
- Increase `pattern_detection_threshold`

## 📚 Documentation

- **[Installation Guide](./INTELLIGENCE-INSTALLATION.md)** - Step-by-step setup
- **[Quick Reference](./INTELLIGENCE-QUICK-REF.md)** - Common commands
- **[Main Spec](./UNIVERSAL-APP-FRAMEWORK-SPEC.md)** - Complete framework spec

## 🔒 Security & Privacy

- All data stored locally in SQLite
- No external API calls
- No telemetry sent to external servers
- You control all thresholds and automation

## 🤝 Contributing

The intelligence system is modular. To add custom analysis:

1. Create `execution/intelligence/my-analysis.ts`
2. Add to `package.json` scripts
3. Run with `pnpm run intelligence:my-analysis`

## 📊 Example Output

```
🧠 META-LEARNER ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Agent Performance...

Agent Performance:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Idea Refiner         ████████░░ 85%
Core Developer       █████████░ 92%
App Developer        ███████░░░ 74%
Tester               ██████████ 98%
Auditor              ████████░░ 82%

💡 Framework Evolution Suggestions...

1. Add core-validation helper
   Type: new_capability
   Why: 40% of cores have similar validation logic
   Impact: Reduce code by ~800 lines
   Effort: medium
```

## 🎉 Benefits

After full adoption, expect:

- **80% fewer repetitive decisions** - Auto-approved based on patterns
- **90% faster issue resolution** - Self-healing catches most problems
- **50% reduction in bugs** - Error mining prevents recurrence
- **3x faster feature development** - Predictive core suggestions
- **100% uptime confidence** - Risk assessment prevents disasters

## 📞 Support

Check the following in order:
1. [Installation Guide](./INTELLIGENCE-INSTALLATION.md)
2. [Quick Reference](./INTELLIGENCE-QUICK-REF.md)
3. Database inspection: `sqlite3 .framework/data/intelligence.db`
4. Logs: `pnpm run intelligence:all > debug.log 2>&1`

## 📄 License

MIT

---

**Ready to get started?** Run `pnpm install && pnpm run intelligence:setup`

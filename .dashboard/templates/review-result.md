# Review Result: {{title}}

**ID**: {{id}}
**Status**: {{status}}
**Confidence**: {{confidence}}%

---

## Verdict
**Reviewer**: {{reviewer}}
**Decision**: {{decision_summary}}

## Feedback
### Overall
{{overall_feedback}}

### Strength
{{#strengths}}
- {{.}}
{{/strengths}}

### Concerns
{{#concerns}}
- {{.}}
{{/concerns}}

---

## Checklist
{{#checklist}}
- [{{#if value}}x{{else}} {{/if}}] {{key}}
{{/checklist}}

# Layer 1: Resource Scoping & Ownership

> Defining organizational ownership and governance before infrastructure creation

---

## Overview

Before anything is created, the module needs to know where resources belong organizationally. This layer has nothing to do with networking or compute yet. Instead, it answers operational questions:

- **Which team owns this infrastructure?**
- **How should resources be identified?**
- **Which IAM policies apply?**
- **Which automation systems can discover these resources?**

---

## Key Variables

| Variable | Purpose |
|----------|---------|
| `resource_group_id` | Determines the IBM Cloud resource container where all resources are provisioned |
| `tags` | Adds searchable metadata for resource identification |
| `access_tags` | Influences IAM authorization behavior |
| `prefix` | Becomes the naming foundation used throughout the module |

---

## Resource Group ID

The `resource_group_id` determines the IBM Cloud resource container where all VSI-related resources are provisioned.

**What it controls:**
- Billing aggregation
- Access control boundaries
- Resource organization
- Team ownership

**Example:**
```hcl
resource_group_id = "abc123-resource-group-id"
```

All VSIs, volumes, network interfaces, and related resources will belong to this resource group.

---

## Tags

Tags add searchable metadata for resource identification and organization.

**Common tag patterns:**
```
env:production
team:platform
cost-center:engineering
project:web-app
```

**Benefits:**
- ✓ Resource discovery
- ✓ Cost allocation
- ✓ Automation targeting
- ✓ Compliance tracking

---

## Access Tags

Access tags influence IAM authorization behavior, controlling who can operate on resources.

**How they work:**
```
Access Tag: "env:prod"
IAM Policy: "Users with prod-access can manage resources tagged env:prod"
```

**Security benefits:**
- ✓ Fine-grained access control
- ✓ Environment isolation
- ✓ Compliance enforcement
- ✓ Audit trail

---

## Prefix

The `prefix` variable becomes the naming foundation for all generated resources.

**Example:**
```hcl
prefix = "web-app"
```

**Generated names:**
```
web-app-vsi-001
web-app-vsi-002
web-app-boot-volume-001
web-app-nic-001
```

**Why this matters:**
- ✓ Consistent naming across all resources
- ✓ Easy identification in console
- ✓ Predictable resource discovery
- ✓ Clear ownership

---

## Administrative Identity

This layer establishes administrative identity before infrastructure even exists.

**Flow:**
```
Define resource group
    ↓
Set naming prefix
    ↓
Add identification tags
    ↓
Apply access control tags
    ↓
Ready for infrastructure creation
```

---

## Best Practices

### 1. Use Descriptive Prefixes
```
✓ Good: "prod-web-app"
✗ Bad: "test123"
```

### 2. Consistent Tagging Strategy
```
✓ Good: env:prod, team:platform, app:web
✗ Bad: production, Platform Team, webapp
```

### 3. Separate Resource Groups
```
Development → dev-resource-group
Staging     → staging-resource-group
Production  → prod-resource-group
```

### 4. Access Tag Hierarchy
```
env:prod
  └── Requires production access
env:dev
  └── Requires development access
```

---

## Next Layer

Once resource scoping is defined, proceed to:

**[Layer 2: Network Foundation →](vsi-network-foundation.md)**

---
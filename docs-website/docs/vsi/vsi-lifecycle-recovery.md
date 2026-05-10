# Layer 10: Lifecycle Management & Recovery

> Ensuring consistency, recoverability, and predictability over time

---

## Overview

The final stage focuses on consistency, recoverability, and predictability. The remaining concern is operational stability over time: ensuring resources keep recognizable names, volumes can be restored reliably, and environments can be recreated without manual rebuilding.

---

## Deterministic Naming

In cloud systems, resources are often created dynamically with auto-generated names. This creates operational problems because resource names may change between deployments.

**Default naming example:**
```
prod-vsi-7f3a-001
prod-vsi-7f3a-002
```

These names work but are not human-friendly.

---

## Custom VSI Volume Names

The variable **`custom_vsi_volume_names`** allows deterministic naming with explicit control.

**Structured example:**
```
Subnet-A
  └── app-server-1
        ├── app-data-volume
        └── logs-volume
```

### Configuration

```hcl
custom_vsi_volume_names = {
  "subnet-1" = [
    {
      vsi_name = "web-server-1"
      volumes  = ["web-data", "web-logs"]
    },
    {
      vsi_name = "web-server-2"
      volumes  = ["web-data", "web-logs"]
    }
  ]
}
```

### Validations

- ✓ Volume counts must match configured storage volumes
- ✓ Volume names must be unique
- ✓ VSI names must remain globally unique
- ✓ Number of VSIs cannot exceed vsi_per_subnet

---

## Static Boot Volume Names

The variable **`use_static_boot_volume_name`** forces boot volumes to follow a stable naming convention:

```
{hostname}_boot
```

**Example:**
```
VSI name: web-server-1
Boot volume: web-server-1_boot
```

This ensures the boot volume keeps the same recognizable identity even if the VSI is destroyed and recreated.

**Configuration:**
```hcl
use_static_boot_volume_name = true
```

---

## Snapshots

A **snapshot** is a point-in-time copy of a disk volume. It freezes the exact state of the filesystem at a specific moment.

### Snapshot Creation

```
OS installed
Applications configured
Database populated
    ↓
Create snapshot
```

That snapshot now contains:
- Operating system
- Installed packages
- Configurations
- Application files
- Data present at capture time

---

## Boot Volume Snapshot Restoration

The variable **`boot_volume_snapshot_crn`** allows a new VSI boot volume to be created directly from a snapshot.

### Without Snapshot Restoration

```
Provision OS
    ↓
Install software
    ↓
Configure application
    ↓
Restore data
```

### With Snapshot Restoration

```
Restore snapshot
    ↓
Machine already configured
```

### Use Cases

- ✓ Disaster recovery
- ✓ Environment cloning
- ✓ Backup restoration
- ✓ Rapid scaling
- ✓ Migration workflows

**Configuration:**
```hcl
boot_volume_snapshot_crn = "crn:v1:bluemix:public:is:us-south:..."
```

---

## Snapshot Consistency Groups

The variable **`snapshot_consistency_group_id`** extends snapshots to multiple volumes simultaneously.

### Why This Matters

**Problem scenario:**
```
Volume-1 → Database files
Volume-2 → Transaction logs
Volume-3 → Application data
```

If snapshots are taken independently at different times, data inconsistency can corrupt applications during restoration.

### Consistency Group Solution

```
Freeze all volumes
    ↓
Capture snapshots simultaneously
    ↓
Restore together later
```

Now the restored environment preserves application consistency because every disk reflects the same exact point in time.

**Configuration:**
```hcl
snapshot_consistency_group_id = "r006-consistency-group-id"
```

---

## Lifecycle Stability Summary

```
Deterministic names
  └── Operational continuity

Static boot volume names
  └── Recognizable storage identity

Snapshots
  └── Preserve machine and application state

Consistency groups
  └── Synchronize multi-volume recovery

Restoration workflows
  └── Recreate environments rapidly
```

> **Cloud-Native Principle:** Infrastructure should be reproducible. The entire environment—including naming, storage layout, and application state—can be recreated predictably through infrastructure definitions and snapshot restoration.

---

## Best Practices

### 1. Use Custom Names

```
✓ Good: Explicit, meaningful names
✗ Bad: Auto-generated random names
```

### 2. Enable Static Boot Volume Names

```
✓ Good: use_static_boot_volume_name = true
✗ Bad: Random boot volume names
```

### 3. Regular Snapshots

```
✓ Good: Automated snapshot schedule
✗ Bad: No backup strategy
```

### 4. Consistency Groups for Multi-Volume Apps

```
✓ Good: Synchronized snapshots
✗ Bad: Independent snapshots
```

### 5. Test Recovery Procedures

```
✓ Good: Regular restore testing
✗ Bad: Untested backups
```

---

## Common Patterns

### Pattern 1: Production Web Application

```hcl
# Deterministic naming
custom_vsi_volume_names = {
  "subnet-prod" = [
    {
      vsi_name = "prod-web-1"
      volumes  = ["app-data", "logs"]
    }
  ]
}

# Static boot volumes
use_static_boot_volume_name = true

# Consistency groups
snapshot_consistency_group_id = "consistency-group-prod"
```

### Pattern 2: Disaster Recovery

```hcl
# Clone from snapshot
boot_volume_snapshot_crn = "crn:..."

# Maintain naming
custom_vsi_volume_names = {
  "subnet-dr" = [
    {
      vsi_name = "dr-web-1"
      volumes  = ["app-data", "logs"]
    }
  ]
}
```

### Pattern 3: Development Environment

```hcl
# Clone production snapshot
boot_volume_snapshot_crn = "crn:..."

# Different naming
custom_vsi_volume_names = {
  "subnet-dev" = [
    {
      vsi_name = "dev-web-1"
      volumes  = ["dev-data", "dev-logs"]
    }
  ]
}
```

---

## Recovery Architecture

```
Running VSI
     ↓
Snapshot
     ↓
Disaster
     ↓
Restore Snapshot
     ↓
New VSI

Infrastructure becomes reproducible.
```

---

## Snapshot Workflow

### 1. Create Snapshot

```bash
# Manual snapshot creation
ibmcloud is snapshot-create \
  --name "prod-web-1-snapshot" \
  --source-volume "volume-id"
```

### 2. Verify Snapshot

```bash
# List snapshots
ibmcloud is snapshots
```

### 3. Restore from Snapshot

```hcl
# In Terraform
boot_volume_snapshot_crn = "crn:v1:bluemix:public:is:..."
```

### 4. Validate Restoration

```bash
# SSH into restored VSI
ssh root@<vsi-ip>

# Verify data
ls -la /data
```

---

## Consistency Group Workflow

### 1. Create Consistency Group

```bash
ibmcloud is snapshot-consistency-group-create \
  --name "app-consistency-group"
```

### 2. Add Volumes

```bash
ibmcloud is snapshot-consistency-group-volume-attach \
  --consistency-group "group-id" \
  --volume "volume-1-id"
```

### 3. Create Synchronized Snapshot

```bash
ibmcloud is snapshot-consistency-group-snapshot-create \
  --consistency-group "group-id"
```

### 4. Restore All Volumes

```hcl
# Restore all volumes from consistency group
block_storage_volumes = [
  {
    snapshot_crn = "crn:...snapshot-1"
  },
  {
    snapshot_crn = "crn:...snapshot-2"
  }
]
```

---

## Complete Lifecycle

```
1. Provision VSI with deterministic names
         ↓
2. Configure applications
         ↓
3. Create snapshots regularly
         ↓
4. Test restoration procedures
         ↓
5. Maintain consistency groups
         ↓
6. Document recovery workflows
         ↓
7. Automate backup schedules
```

---

## Summary

This layer ensures:

- ✓ **Predictable naming** - Resources have consistent, meaningful names
- ✓ **Recoverability** - Snapshots enable rapid restoration
- ✓ **Consistency** - Multi-volume applications restore correctly
- ✓ **Reproducibility** - Environments can be recreated on demand
- ✓ **Operational stability** - Infrastructure remains manageable over time

---

## Next Steps

You've completed all 10 layers! Now explore:

**[VSI Architecture Summary →](vsi-architecture-summary.md)**

---

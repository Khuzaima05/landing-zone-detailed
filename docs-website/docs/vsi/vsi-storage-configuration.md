# Layer 4: Storage Configuration

> Defining persistent storage, encryption, and backup strategies

---

## Overview

The storage configuration stage defines how data is stored for the VSI, how fast that storage performs, how secure it is, and whether the data survives machine restarts or recreations.

> **Key Concept:** In cloud infrastructure, storage is separated from compute. The virtual machine itself is only CPU and memory; all operating system files, applications, logs, and databases live on attached storage volumes.

---

## Boot Volume

The **boot volume** is the primary disk attached to the VSI during creation. When the machine powers on, the operating system is loaded from this boot volume.

### Boot Volume Configuration

| Variable | Purpose |
|----------|---------|
| `boot_volume_size` | Defines storage capacity (GB) |
| `boot_volume_profile` | Defines storage class (general-purpose, 5iops-tier, 10iops-tier, custom) |
| `boot_volume_iops` | Controls disk speed (Input/Output Operations Per Second) |

**Example:**
```hcl
boot_volume_size    = 100  # 100 GB
boot_volume_profile = "general-purpose"
boot_volume_iops    = 3000
```

### IOPS Performance

**IOPS (Input/Output Operations Per Second)** determines how fast the disk can read/write data.

| IOPS Level | Use Case |
|------------|----------|
| 3,000 | General workloads |
| 5,000 | Moderate databases |
| 10,000 | High-performance databases |
| 20,000+ | Analytics, heavy I/O |

**Example:**
- High IOPS → Better for databases or analytics systems
- Standard IOPS → Sufficient for general workloads

---

## Encryption

Encryption controls how the data stored on disks is protected. There are two modes:

### Provider-Managed Encryption

```hcl
kms_encryption_enabled = false
```

**Characteristics:**
- IBM Cloud manages encryption internally
- Simpler configuration
- Less governance control
- Automatic key management

### Customer-Managed Encryption

```hcl
kms_encryption_enabled      = true
boot_volume_encryption_key  = "<KMS key CRN>"
```

**Characteristics:**
- Customer controls the key lifecycle
- Enables compliance and auditing
- Stricter security policies
- Integration with Key Protect or Hyper Protect Crypto Services

**Benefits:**
- ✓ Full control over encryption keys
- ✓ Audit trail of key usage
- ✓ Compliance with regulations
- ✓ Key rotation capabilities

### Default Encryption Key

The variable **`use_boot_volume_key_as_default`** determines whether the same encryption key used for the boot volume should automatically apply to all additional storage volumes.

```hcl
use_boot_volume_key_as_default = true
```

**When enabled:**
- All volumes use the same encryption key
- Simplified key management
- Consistent security policy

---

## Additional Block Storage

Beyond the boot volume, the VSI can attach additional block storage volumes using **`block_storage_volumes`**. These are independent disks attached to the machine.

### Storage Separation

**Example separation:**
```
Boot volume       → Operating system
Additional volume → Database storage
Another volume    → Logs
Another volume    → Backups
```

### Volume Configuration

Each additional volume can define:

| Property | Purpose |
|----------|---------|
| `name` | Volume identifier |
| `profile` | Storage class (general-purpose, 5iops-tier, 10iops-tier, custom) |
| `capacity` | Size in GB |
| `iops` | Performance tuning |
| `encryption_key` | Separate KMS key (optional) |
| `snapshot_crn` | Restore from backup (optional) |

**Example:**
```hcl
block_storage_volumes = [
  {
    name            = "database-volume"
    profile         = "10iops-tier"
    capacity        = 500
    iops            = 10000
    encryption_key  = "crn:..."
  },
  {
    name     = "logs-volume"
    profile  = "general-purpose"
    capacity = 100
  }
]
```

---

## Snapshot Consistency Groups

The module supports **`snapshot_consistency_group_id`** for synchronized snapshots across multiple volumes.

### Why Consistency Matters

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

## Storage Profiles

IBM Cloud offers different storage profiles optimized for various workloads:

| Profile | IOPS | Use Case |
|---------|------|----------|
| `general-purpose` | 3 IOPS/GB | Standard workloads |
| `5iops-tier` | 5 IOPS/GB | Moderate performance |
| `10iops-tier` | 10 IOPS/GB | High performance |
| `custom` | User-defined | Specific requirements |

**Selection guide:**
```
General workloads    → general-purpose
Web applications     → 5iops-tier
Databases           → 10iops-tier
Analytics           → custom (high IOPS)
```

---

## Storage Architecture Summary

```
Boot Volume
  └── Operating system and machine state

Additional Block Volumes
  └── Persistent application storage

Storage Profiles
  └── Performance characteristics

IOPS Tuning
  └── Throughput and latency behavior

Encryption Settings
  └── Data confidentiality

Snapshots
  └── Backup and restoration capability
```

---

## Best Practices

### 1. Separate System and Data

```
✓ Good: Boot volume for OS, separate volumes for data
✗ Bad: Everything on boot volume
```

### 2. Right-Size Storage

```
✓ Good: Start with appropriate size, expand as needed
✗ Bad: Massive volumes "just in case"
```

### 3. Use Encryption

```
✓ Good: Enable customer-managed encryption for sensitive data
✗ Bad: No encryption for production data
```

### 4. Regular Snapshots

```
✓ Good: Automated snapshot schedule
✗ Bad: No backup strategy
```

### 5. Consistency Groups

```
✓ Good: Use for multi-volume applications
✗ Bad: Independent snapshots for related volumes
```

---

## Common Patterns

### Pattern 1: Web Application

```hcl
boot_volume_size    = 100
boot_volume_profile = "general-purpose"

block_storage_volumes = [
  {
    name     = "app-data"
    capacity = 200
    profile  = "5iops-tier"
  }
]
```

### Pattern 2: Database Server

```hcl
boot_volume_size    = 100
boot_volume_profile = "general-purpose"

block_storage_volumes = [
  {
    name     = "database"
    capacity = 1000
    profile  = "10iops-tier"
    iops     = 10000
  },
  {
    name     = "logs"
    capacity = 200
    profile  = "5iops-tier"
  }
]
```

### Pattern 3: High-Security Application

```hcl
kms_encryption_enabled     = true
boot_volume_encryption_key = "crn:..."
use_boot_volume_key_as_default = true

block_storage_volumes = [
  {
    name            = "secure-data"
    capacity        = 500
    profile         = "10iops-tier"
    encryption_key  = "crn:..."  # Separate key
  }
]
```

---

## Next Layer

Once storage is configured, proceed to:

**[Layer 5: Instance Networking →](vsi-instance-networking.md)**

---

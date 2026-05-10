# Layer 3: Compute Instantiation

> Creating the actual virtual machine with boot source, capacity, and access configuration

---

## Overview

The compute instantiation stage is the exact point where an abstract infrastructure definition turns into a real, bootable machine. Every variable in this layer directly controls how the virtual machine is created, what it runs, and how it is accessed.

---

## Boot Source Selection

The first requirement is selecting the boot source, which defines what the machine will run when it starts. The module enforces that **only one** of the following is used:

1. **`image_id`** - Standard OS image (Ubuntu, RHEL, etc.)
2. **`catalog_offering`** - Pre-packaged solution with bundled software
3. **`boot_volume_snapshot_crn`** - Clone an existing disk state

> **Why only one?** This constraint ensures determinism—there is exactly one source of truth for how the machine boots, avoiding conflicts or ambiguity.

---

## Boot Source Options

### Option 1: Image ID

Use a standard operating system image from IBM Cloud's image catalog.

**Example:**
```hcl
image_id = "r006-abc123-ubuntu-20-04"
```

**Common images:**
- Ubuntu 20.04 LTS
- Ubuntu 22.04 LTS
- Red Hat Enterprise Linux 8
- Red Hat Enterprise Linux 9
- CentOS Stream
- Debian
- Windows Server

**When to use:**
- ✓ Fresh OS installation
- ✓ Standard configurations
- ✓ New deployments
- ✓ Development environments

### Option 2: Catalog Offering

Use a pre-packaged solution with bundled software and configurations.

**Example:**
```hcl
catalog_offering = {
  offering_crn = "crn:v1:bluemix:public:..."
  version_crn  = "crn:v1:bluemix:public:..."
}
```

**What catalog offerings include:**
- Pre-installed applications
- Pre-configured settings
- Optimized configurations
- Vendor-supported stacks

**When to use:**
- ✓ Marketplace solutions
- ✓ Vendor-provided images
- ✓ Complex software stacks
- ✓ Certified configurations

### Option 3: Boot Volume Snapshot

Clone an existing disk state to create an identical machine.

**Example:**
```hcl
boot_volume_snapshot_crn = "crn:v1:bluemix:public:is:..."
```

**What gets cloned:**
- Operating system
- Installed packages
- Configurations
- Application files
- Data present at snapshot time

**When to use:**
- ✓ Disaster recovery
- ✓ Environment cloning
- ✓ Rapid scaling
- ✓ Migration workflows

---

## Compute Capacity

Once the OS source is fixed, the next step is defining the compute capacity using **`machine_type`**. This is not just a label but a predefined hardware profile that determines:

- CPU cores
- RAM
- Network throughput

### Machine Type Examples

| Profile | vCPUs | RAM | Use Case |
|---------|-------|-----|----------|
| `bx2-2x8` | 2 | 8 GB | Small workloads |
| `bx2-4x16` | 4 | 16 GB | Medium applications |
| `bx2-8x32` | 8 | 32 GB | Large applications |
| `bx2-16x64` | 16 | 64 GB | High-performance |
| `cx2-2x4` | 2 | 4 GB | Compute-optimized |
| `mx2-2x16` | 2 | 16 GB | Memory-optimized |

**Profile families:**
- **bx2** - Balanced (general purpose)
- **cx2** - Compute-optimized (CPU-intensive)
- **mx2** - Memory-optimized (RAM-intensive)
- **ux2** - Ultra-high memory

**Example:**
```hcl
machine_type = "bx2-4x16"
```

---

## Secure Access

Access is configured through **`ssh_key_ids`**. Instead of using passwords, the system injects SSH public keys into the instance during creation. When the machine boots, these keys are placed into the OS (typically in `~/.ssh/authorized_keys`).

### SSH Key Configuration

**Example:**
```hcl
ssh_key_ids = [
  "r006-key-1-id",
  "r006-key-2-id"
]
```

**Benefits:**
- ✓ Eliminates password-based authentication
- ✓ Stronger security
- ✓ Easier to manage at scale
- ✓ Supports multiple keys per VSI

### How SSH Keys Work

```
1. Generate SSH key pair locally
     ↓
2. Upload public key to IBM Cloud
     ↓
3. Reference key ID in VSI configuration
     ↓
4. VSI boots with key injected
     ↓
5. Connect using private key
```

**Connection example:**
```bash
ssh -i ~/.ssh/my-private-key root@<vsi-ip>
```

---

## Initialization Logic

The final part is initialization logic, handled by **`user_data`**. This is a script or configuration block that runs automatically when the machine boots for the first time via cloud-init.

### User Data

**Example:**
```hcl
user_data = <<-EOT
#!/bin/bash
apt-get update
apt-get install -y nginx
systemctl start nginx
systemctl enable nginx
EOT
```

### Typical Operations

- Installing software packages
- Starting services
- Configuring users
- Pulling application code
- Setting environment variables
- Registering with management systems

### Cloud-Init Support

User data is processed by cloud-init, which supports:

- **Shell scripts** - Bash commands
- **Cloud-config** - YAML configuration
- **Include files** - External scripts
- **Multi-part** - Combined formats

**Cloud-config example:**
```yaml
#cloud-config
packages:
  - nginx
  - postgresql
runcmd:
  - systemctl start nginx
  - systemctl enable nginx
```

---

## The Complete Flow

```
Provision VM with compute profile
         ↓
Attach boot volume from chosen source
         ↓
Inject SSH keys for secure access
         ↓
Execute initialization scripts
         ↓
Fully operational machine
```

---

## Validation Rules

The module enforces these constraints:

1. ✓ Exactly one boot source (image, catalog, or snapshot)
2. ✓ Valid machine type from IBM Cloud catalog
3. ✓ At least one SSH key ID
4. ✓ User data must be valid script/config

---

## Best Practices

### 1. Boot Source Selection
```
✓ Good: Use image_id for standard deployments
✓ Good: Use snapshot for cloning
✗ Bad: Specify multiple boot sources
```

### 2. Machine Type Sizing
```
✓ Good: Start small, scale up as needed
✗ Bad: Over-provision from the start
```

### 3. SSH Key Management
```
✓ Good: Use separate keys per environment
✓ Good: Rotate keys regularly
✗ Bad: Share keys across teams
```

### 4. User Data
```
✓ Good: Keep scripts idempotent
✓ Good: Log all operations
✗ Bad: Hard-code secrets in user data
```

---

## Common Patterns

### Pattern 1: Web Server
```hcl
image_id     = "ubuntu-20-04"
machine_type = "bx2-2x8"
user_data    = <<-EOT
#!/bin/bash
apt-get update
apt-get install -y nginx
EOT
```

### Pattern 2: Database Server
```hcl
image_id     = "rhel-8"
machine_type = "mx2-4x32"  # Memory-optimized
user_data    = <<-EOT
#!/bin/bash
yum install -y postgresql-server
EOT
```

### Pattern 3: Clone Production
```hcl
boot_volume_snapshot_crn = "crn:..."
machine_type             = "bx2-8x32"
# No user_data needed - already configured
```

---

## Next Layer

Once compute is instantiated, proceed to:

**[Layer 4: Storage Configuration →](vsi-storage-configuration.md)**

---
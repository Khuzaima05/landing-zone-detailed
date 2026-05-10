# Layer 2: Network Foundation

> Selecting the networking environment for VSI deployment

---

## Overview

The network foundation is defined through VPC-related inputs. At this stage, the module is not yet creating machines—it is selecting the networking environment into which machines will later attach.

---

## Key Concepts

The variable `vpc_id` selects the isolated virtual network where the VSI will operate. The `subnets` list determines the exact network segments and zones where instances are placed.

This layer determines:

- ✓ IP address ranges
- ✓ Availability zones
- ✓ Routing behavior
- ✓ Internet access paths
- ✓ Subnet-level ACL protections

> **Important:** The subnet effectively becomes the "location" where the VSI will live. Without this networking layer, the machine would have nowhere to attach.

---

## VPC Selection

The `vpc_id` variable anchors the VSI to a specific virtual private cloud.

**What VPC provides:**
- Isolated network environment
- Software-defined networking
- Private IP address space
- Network segmentation
- Security boundaries

**Example:**
```hcl
vpc_id = "r006-abc123-vpc-id"
```

All VSIs deployed will exist within this VPC's network boundaries.

---

## Subnet Configuration

The `subnets` variable is a list that determines where VSIs are placed.

**Subnet object structure:**
```hcl
subnets = [
  {
    id   = "subnet-1-id"
    zone = "us-south-1"
    cidr = "10.10.10.0/24"
  },
  {
    id   = "subnet-2-id"
    zone = "us-south-2"
    cidr = "10.10.20.0/24"
  }
]
```

### Multi-Zone Distribution

The module distributes VSIs across zones for high availability:

```
Subnet 1 (Zone 1)
  └── VSI-1, VSI-2, VSI-3

Subnet 2 (Zone 2)
  └── VSI-4, VSI-5, VSI-6
```

---

## Horizontal Scaling

The `vsi_per_subnet` variable drives horizontal scaling.

**Example:**
```hcl
vsi_per_subnet = 3
subnets = [subnet-1, subnet-2]
```

**Result:**
- 3 VSIs in subnet-1
- 3 VSIs in subnet-2
- Total: 6 VSIs

**Scaling pattern:**
```
vsi_per_subnet × number_of_subnets = total_vsis
```

---

## What Subnet Determines

### 1. IP Address Range
Each VSI receives a private IP from the subnet's CIDR block.

**Example:**
```
Subnet CIDR: 10.10.10.0/24
VSI-1: 10.10.10.4
VSI-2: 10.10.10.5
VSI-3: 10.10.10.6
```

### 2. Availability Zone
The subnet's zone determines the physical datacenter location.

**Multi-zone architecture:**
```
us-south-1 → Datacenter A
us-south-2 → Datacenter B
us-south-3 → Datacenter C
```

### 3. Routing Behavior
Subnets have attached route tables that control traffic flow.

**Routing decisions:**
- Internal VPC traffic
- Internet-bound traffic
- Cross-VPC traffic
- On-premises connectivity

### 4. Internet Access
Subnets can have public gateways attached for outbound internet access.

**With public gateway:**
```
VSI → Subnet → Public Gateway → Internet
```

**Without public gateway:**
```
VSI → Subnet → (No internet access)
```

### 5. Network ACLs
Subnet-level access control lists provide the first layer of security.

**ACL protection:**
```
Internet
    ↓
ACL Rules (Subnet level)
    ↓
VSI
```

---

## Network Foundation Flow

```
Select VPC
    ↓
Define subnets (with zones)
    ↓
Set vsi_per_subnet
    ↓
Module calculates distribution
    ↓
VSIs placed in subnets
    ↓
Each VSI inherits:
  - IP range
  - Zone location
  - Routing rules
  - Gateway access
  - ACL protection
```

---

## Pre-Requisites

Before deploying VSIs, ensure:

1. ✓ VPC exists
2. ✓ Subnets created in desired zones
3. ✓ Subnets have appropriate CIDR blocks
4. ✓ Route tables configured
5. ✓ Public gateways attached (if internet access needed)
6. ✓ ACLs configured

> **Critical:** The network foundation must exist before VSI deployment. VSIs cannot create their own network infrastructure.

---

## Best Practices

### 1. Multi-Zone Deployment
```
✓ Good: Deploy across 3 zones
✗ Bad: Single zone (no redundancy)
```

### 2. Appropriate Subnet Sizing
```
✓ Good: /24 subnet (254 hosts)
✗ Bad: /28 subnet (14 hosts) - too small
```

### 3. Consistent Naming
```
✓ Good: prod-web-subnet-zone1
✗ Bad: subnet-abc123
```

### 4. Zone Distribution
```
✓ Good: Even distribution across zones
✗ Bad: All VSIs in one zone
```

---

## Next Layer

Once network foundation is established, proceed to:

**[Layer 3: Compute Instantiation →](vsi-compute-instantiation.md)**

---
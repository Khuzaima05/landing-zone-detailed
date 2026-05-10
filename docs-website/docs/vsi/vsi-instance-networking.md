# Layer 5: Instance-Level Networking

> Configuring network interfaces, IP addresses, and public exposure

---

## Overview

The networking stage is where the VSI becomes reachable and capable of communicating with other systems. Until this point, the machine only exists as compute and storage. Networking gives it identity inside the VPC, enables communication with other machines, and optionally exposes it to the internet.

---

## Primary Network Interface

Every VSI must attach to at least one **network interface** (NIC). The primary network interface connects the VSI to a subnet inside the VPC. When attached, the subnet assigns the interface a **private IP address** from its CIDR range.

### What the Subnet Determines

- Which IP range the VSI belongs to
- Which availability zone the VSI resides in
- Which route tables apply
- Whether internet access exists through a public gateway
- Which ACL rules protect the subnet

**Example:**
```
Subnet CIDR: 10.10.10.0/24
VSI-1 gets: 10.10.10.4
VSI-2 gets: 10.10.10.5
```

---

## Reserved IPs

Normally, private IP addresses are dynamically assigned. The variable **`manage_reserved_ips`** solves the problem of IP persistence.

### Why Reserved IPs Matter

**Without reserved IPs:**
```
VSI created  → Gets IP 10.10.10.5
VSI deleted  → IP released
VSI recreated → Gets IP 10.10.10.8 (different!)
```

**With reserved IPs:**
```
VSI created  → Gets IP 10.10.10.5
VSI deleted  → IP remains reserved
VSI recreated → Gets IP 10.10.10.5 (same!)
```

### Configuration

```hcl
manage_reserved_ips = true
```

**When enabled:**
- Same IP persists across VSI recreations
- IP becomes an independent resource
- Prevents application/firewall rule breakage
- Ensures consistent connectivity

---

## Multiple Private IPs

The variable **`primary_vni_additional_ip_count`** allows multiple private IPs on the same network interface.

**Configuration:**
```hcl
primary_vni_additional_ip_count = 2
```

**Result:**
```
Primary IP:     10.10.10.5
Additional IP:  10.10.10.6
Additional IP:  10.10.10.7
```

### Use Cases

- Hosting multiple applications with different addresses
- Supporting failover configurations
- Running network appliances
- Handling IP-based licensing systems
- Virtual IP addresses for high availability

---

## Floating IPs

By default, all addresses are private and only reachable within the VPC. To expose a VSI to the internet, use **`enable_floating_ip`**.

### Floating IP Concept

```
Internet Traffic
      ↓
Floating IP (Public)
      ↓
NAT Translation
      ↓
Private IP (VSI)
```

### Configuration

```hcl
enable_floating_ip = true
```

### Without Floating IP

- VSI can communicate outward to internet (if public gateway exists)
- External systems cannot directly initiate connections
- VSI remains private

### With Floating IP

- Users can SSH into the machine
- APIs become publicly accessible
- Web servers can serve internet traffic
- Direct inbound connectivity

**Example:**
```
Private IP:  10.10.10.5 (internal only)
Floating IP: 52.116.128.45 (public)
```

---

## Advanced Networking Controls

| Variable | Purpose |
|----------|---------|
| `allow_ip_spoofing` | Allows VSI to send packets from non-assigned IPs (advanced use only) |
| `placement_group_id` | Influences VSI distribution across physical hosts |
| `enable_dedicated_host` | Reserves exclusive physical server for customer |
| `dedicated_host_id` | Specifies which dedicated host to use |

### IP Spoofing

**Default:** Disabled (recommended)

**When to enable:**
- Network appliances
- Virtual routers
- NAT gateways
- Packet inspection systems

> **Warning:** For normal application workloads, spoofing remains disabled because it weakens network trust boundaries.

### Placement Groups

Control how VSIs are distributed across physical infrastructure:

**Placement strategies:**
- **Host spread** - VSIs on different physical hosts (high availability)
- **Power spread** - VSIs on different power sources (disaster recovery)

### Dedicated Hosts

Reserve an entire physical server for your VSIs:

**Benefits:**
- ✓ Regulatory compliance
- ✓ Licensing requirements
- ✓ Performance isolation
- ✓ Security isolation

---

## Complete Networking Flow

```
VSI boots
    ↓
Attaches to subnet via network interface
    ↓
Subnet assigns private IP addresses
    ↓
Security groups and ACLs govern traffic
    ↓
Optional reserved IP management ensures persistence
    ↓
Optional additional IPs extend capabilities
    ↓
Optional floating IPs expose machine publicly
    ↓
Routing rules determine packet travel
    ↓
Placement rules determine physical location
```

---

## Best Practices

### 1. Use Reserved IPs for Production

```
✓ Good: Enable reserved IPs for stable infrastructure
✗ Bad: Dynamic IPs that change on recreation
```

### 2. Minimize Public Exposure

```
✓ Good: Only expose necessary services via floating IP
✗ Bad: Floating IPs on all VSIs
```

### 3. Plan IP Addressing

```
✓ Good: Document IP assignments
✗ Bad: Random IP allocation
```

### 4. Placement Strategy

```
✓ Good: Use host spread for high availability
✗ Bad: All VSIs on same physical host
```

---

## Common Patterns

### Pattern 1: Private Application Server

```hcl
manage_reserved_ips  = true
enable_floating_ip   = false
allow_ip_spoofing    = false
```

### Pattern 2: Public Web Server

```hcl
manage_reserved_ips  = true
enable_floating_ip   = true
allow_ip_spoofing    = false
```

### Pattern 3: Multi-IP Application

```hcl
manage_reserved_ips             = true
primary_vni_additional_ip_count = 3
enable_floating_ip              = true
```

### Pattern 4: Network Appliance

```hcl
manage_reserved_ips  = true
allow_ip_spoofing    = true
enable_floating_ip   = true
```

---

## Next Layer

Once instance networking is configured, proceed to:

**[Layer 6: Security Groups →](vsi-security-groups.md)**

---

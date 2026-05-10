# Layer 7: Advanced Networking (Secondary Interfaces)

> Multi-homed systems with traffic separation and isolation

---

## Overview

By default, a VSI is created with a single network interface attached to one subnet. However, advanced systems often require **traffic separation**. This is where secondary network interfaces become important.

---

## Multi-Homed Systems

A network interface is the networking attachment point between the VSI and a subnet. Each interface receives its own private IP address and participates independently in the VPC network.

**Conceptual example:**
```
Interface 1 → Public web traffic
Interface 2 → Internal database traffic
Interface 3 → Monitoring or backup traffic
```

---

## Configuration

The variable **`secondary_subnets`** defines additional interfaces. Each entry specifies a subnet where an additional interface should be attached.

**Example:**
```hcl
secondary_subnets = [
  {
    id   = "subnet-backend-id"
    zone = "us-south-1"
  },
  {
    id   = "subnet-monitoring-id"
    zone = "us-south-1"
  }
]
```

> **Restriction:** Secondary subnets must exist in the **same availability zone** as the VSI.

---

## Benefits of Multiple Interfaces

- ✓ **Security** - Traffic isolation
- ✓ **Routing control** - Independent paths
- ✓ **Performance isolation** - Separate bandwidth
- ✓ **Administrative clarity** - Clear separation of concerns

---

## Real-World Example: Web Application Server

```
Frontend Interface
  └── Connects to subnet exposed to users/load balancers

Backend Interface
  └── Connects to private subnet where databases exist
  └── Never directly exposed publicly
```

This creates layered isolation. Even if attackers reach the frontend interface, they cannot directly access backend systems.

---

## Interface-Specific Security

Each secondary interface can have its own dedicated security groups through **`secondary_security_groups`**.

**Example policies:**
```
Frontend interface  → Allow HTTPS from internet
Backend interface   → Allow only database traffic from app servers
Monitoring interface → Allow traffic only from observability tools
```

### Configuration

```hcl
secondary_security_groups = [
  {
    security_group_id = "sg-backend-id"
    interface_index   = 0  # First secondary interface
  },
  {
    security_group_id = "sg-monitoring-id"
    interface_index   = 1  # Second secondary interface
  }
]
```

The variable **`secondary_use_vsi_security_group`** controls whether the primary security group automatically applies to secondary interfaces.

```hcl
secondary_use_vsi_security_group = false  # Each interface has independent security
```

---

## Secondary Floating IPs

Advanced workloads may require multiple externally reachable interfaces using **`secondary_floating_ips`**.

**Configuration:**
```hcl
secondary_floating_ips = [
  {
    interface_index = 0  # First secondary interface
  },
  {
    interface_index = 1  # Second secondary interface
  }
]
```

**Use cases:**
- One public IP for customer traffic
- Another public IP for partner APIs
- Another for administrative access

---

## IP Spoofing Control

The variable **`secondary_allow_ip_spoofing`** controls spoofing permissions on additional interfaces.

**When required:**
- Firewalls
- NAT gateways
- Virtual routers
- Load balancers

> **Warning:** For normal application workloads, spoofing remains disabled because it weakens network trust boundaries.

---

## Operating System View

Inside the VSI, interfaces appear as separate network devices:

```
eth0 → Primary interface
eth1 → Secondary interface
eth2 → Another secondary interface
```

Each interface has:
- Its own IP address
- Its own subnet
- Its own routing behavior
- Its own security rules
- Its own optional floating IP

---

## Multi-Interface Packet Flow

```
Packet arrives on specific interface
         ↓
Security group attached to that interface evaluates it
         ↓
If allowed, operating system processes it
         ↓
OS routing table decides which interface sends responses
         ↓
Outgoing traffic exits through appropriate network path
```

---

## Best Practices

### 1. Separate Traffic Types

```
✓ Good: Frontend on eth0, backend on eth1
✗ Bad: All traffic on single interface
```

### 2. Independent Security

```
✓ Good: Different security groups per interface
✗ Bad: Same security group for all interfaces
```

### 3. Document Interface Purpose

```
✓ Good: Clear naming and documentation
✗ Bad: Unnamed interfaces
```

### 4. Zone Consistency

```
✓ Good: All interfaces in same zone
✗ Bad: Interfaces across zones (not supported)
```

---

## Common Patterns

### Pattern 1: Three-Tier Application

```hcl
# Primary interface - Frontend
subnets = [{
  id   = "subnet-frontend"
  zone = "us-south-1"
}]

# Secondary interfaces
secondary_subnets = [
  {
    id   = "subnet-backend"
    zone = "us-south-1"
  },
  {
    id   = "subnet-monitoring"
    zone = "us-south-1"
  }
]

# Security per interface
secondary_security_groups = [
  {
    security_group_id = "sg-backend"
    interface_index   = 0
  },
  {
    security_group_id = "sg-monitoring"
    interface_index   = 1
  }
]
```

### Pattern 2: DMZ Architecture

```hcl
# Primary - Public DMZ
enable_floating_ip = true

# Secondary - Internal network
secondary_subnets = [{
  id   = "subnet-internal"
  zone = "us-south-1"
}]

secondary_use_vsi_security_group = false
```

### Pattern 3: Network Appliance

```hcl
# Multiple interfaces for routing
secondary_subnets = [
  { id = "subnet-wan", zone = "us-south-1" },
  { id = "subnet-lan", zone = "us-south-1" }
]

# Enable spoofing for routing
allow_ip_spoofing = true
secondary_allow_ip_spoofing = [true, true]

# Public IPs on multiple interfaces
enable_floating_ip = true
secondary_floating_ips = [
  { interface_index = 0 },
  { interface_index = 1 }
]
```

---

## Architecture Diagram

```
                VSI
          ┌──────┼──────┐
          │      │      │
        eth0   eth1   eth2
          │      │      │
      frontend backend monitoring
       subnet   subnet   subnet
          │      │      │
       Public  Private Private
```

---

## Next Layer

Once secondary interfaces are configured, proceed to:

**[Layer 8: Load Balancer Integration →](vsi-load-balancer.md)**

---

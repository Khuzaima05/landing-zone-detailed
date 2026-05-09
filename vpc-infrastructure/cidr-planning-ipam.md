# 🗺️ CIDR Planning and IPAM — Deep Beginner Explanation

[← Previous: Zones & Datacenter Architecture](./zones-datacenter-architecture.md) | [Index](./README.md) | [Next: Subnet Service Internals →](./subnet-service-internals.md)

---

## 📋 Overview

CIDR planning is one of the most important foundational concepts in cloud networking. Almost every major networking problem in enterprise cloud environments eventually traces back to **bad IP planning**.

Beginners usually focus on:
- VSIs
- Kubernetes
- Load Balancers
- VPNs

But networking engineers first think about:
> **IP address architecture**

because every workload, subnet, route, firewall rule, VPN tunnel, Kubernetes pod, and DNS record ultimately depends on IP communication.

### Without Proper IP Planning

- workloads cannot communicate correctly
- routes conflict
- VPNs fail
- Kubernetes networking breaks
- hybrid cloud becomes unstable

This is why enterprise cloud projects usually **design networking architecture before deploying applications**.

---

## 🌐 What Is an IP Address

Every device on a network requires an address.

### Examples

- laptop
- mobile phone
- server
- router
- Kubernetes pod
- load balancer

An IP address identifies:
- **source of traffic**
- **destination of traffic**

### Example

```
10.0.1.5
```

This uniquely identifies a workload inside a private network.

Networking fundamentally works through:
> **packet delivery between IP addresses**

---

## 🔐 Public IP vs Private IP

There are two major IP categories.

### Public IP

Public IPs are **internet-routable**.

**Example:**
```
142.250.183.110
```

These are **globally unique**.

**Used for:**
- websites
- internet services
- external communication

**Public IP space is limited.**

### Private IP

Private IPs are used **internally**.

Defined by **RFC1918 standards**.

#### 📊 Private IP Ranges (RFC1918)

| CIDR Block | Address Range | Total IPs | Typical Use |
|------------|---------------|-----------|-------------|
| `10.0.0.0/8` | 10.0.0.0 - 10.255.255.255 | 16,777,216 | Large enterprises, cloud VPCs |
| `172.16.0.0/12` | 172.16.0.0 - 172.31.255.255 | 1,048,576 | Medium enterprises |
| `192.168.0.0/16` | 192.168.0.0 - 192.168.255.255 | 65,536 | Small networks, home networks |

These ranges are **NOT internet routable**.

They are used inside:
- datacenters
- enterprises
- VPCs
- Kubernetes clusters

IBM Cloud VPC primarily uses:
> **RFC1918 private addressing**

---

## 📊 What Is CIDR

CIDR means:
> **Classless Inter-Domain Routing**

CIDR defines:
- IP network range
- network size

### Example

```
10.0.0.0/16
```

This does NOT mean one IP.

It means:
> **entire network range**

The `/16` defines:
> **how many addresses belong to network**

### 📊 Common CIDR Subnet Calculations

| CIDR | Subnet Mask | Total IPs | Usable IPs* | Typical Use |
|------|-------------|-----------|-------------|-------------|
| `/8` | 255.0.0.0 | 16,777,216 | 16,777,214 | Entire VPC (very large) |
| `/12` | 255.240.0.0 | 1,048,576 | 1,048,574 | Large VPC |
| `/16` | 255.255.0.0 | 65,536 | 65,534 | Standard VPC |
| `/18` | 255.255.192.0 | 16,384 | 16,382 | Large zone allocation |
| `/20` | 255.255.240.0 | 4,096 | 4,094 | Medium zone allocation |
| `/22` | 255.255.252.0 | 1,024 | 1,022 | Small zone allocation |
| `/24` | 255.255.255.0 | 256 | 254 | **Standard subnet** |
| `/26` | 255.255.255.192 | 64 | 62 | Small subnet |
| `/28` | 255.255.255.240 | 16 | 14 | Micro subnet |

> **Note:** *Usable IPs exclude network address and broadcast address. In IBM Cloud VPC, additional IPs are reserved (see IBM Reserved IPs section).

---

## 🔢 Understanding /16

### Example

```
10.0.0.0/16
```

This means:
- first 16 bits represent network
- remaining bits available for hosts

**Result:**
```
65,536 total IP addresses
```

**Range:**
```
10.0.0.0 → 10.0.255.255
```

---

## 🔢 Understanding /24

### Example

```
10.0.1.0/24
```

This gives:
```
256 total IP addresses
```

**Range:**
```
10.0.1.0 → 10.0.1.255
```

Usually:
```
subnet = /24
```

because:
- manageable size
- easy segmentation

---

## 🏗️ VPC CIDR vs Subnet CIDR

This is critical.

### VPC CIDR

Large overall network block.

**Example:**
```
10.0.0.0/16
```

Represents:
> **entire VPC address space**

### Subnet CIDR

Smaller sections carved from VPC CIDR.

**Example:**
```
10.0.1.0/24
10.0.2.0/24
10.0.3.0/24
```

These represent:
> **individual subnet networks**

Think of it like:
```
VPC = Large Land Area
Subnet = Individual Neighborhood
```

---

## 🎯 Real Example

Suppose:

### VPC CIDR
```
10.0.0.0/16
```

### 🗺️ Visual CIDR Allocation Example

See diagram below showing how a VPC CIDR is subdivided into subnets:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VPC: 10.0.0.0/16 (65,536 IPs)                    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Zone 1 Address Prefix: 10.0.0.0/18                │ │
│  │                     (16,384 IPs)                               │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                   │ │
│  │  │ Management       │  │ Application      │                   │ │
│  │  │ 10.0.1.0/24      │  │ 10.0.2.0/24      │                   │ │
│  │  │ (256 IPs)        │  │ (256 IPs)        │                   │ │
│  │  └──────────────────┘  └──────────────────┘                   │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                   │ │
│  │  │ Database         │  │ Reserved         │                   │ │
│  │  │ 10.0.3.0/24      │  │ 10.0.4.0/22      │                   │ │
│  │  │ (256 IPs)        │  │ (1,024 IPs)      │                   │ │
│  │  └──────────────────┘  └──────────────────┘                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Zone 2 Address Prefix: 10.0.64.0/18               │ │
│  │                     (16,384 IPs)                               │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                   │ │
│  │  │ Management       │  │ Application      │                   │ │
│  │  │ 10.0.65.0/24     │  │ 10.0.66.0/24     │                   │ │
│  │  │ (256 IPs)        │  │ (256 IPs)        │                   │ │
│  │  └──────────────────┘  └──────────────────┘                   │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                   │ │
│  │  │ Database         │  │ Reserved         │                   │ │
│  │  │ 10.0.67.0/24     │  │ 10.0.68.0/22     │                   │ │
│  │  │ (256 IPs)        │  │ (1,024 IPs)      │                   │ │
│  │  └──────────────────┘  └──────────────────┘                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Zone 3 Address Prefix: 10.0.128.0/18              │ │
│  │                     (16,384 IPs)                               │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                   │ │
│  │  │ Management       │  │ Application      │                   │ │
│  │  │ 10.0.129.0/24    │  │ 10.0.130.0/24    │                   │ │
│  │  │ (256 IPs)        │  │ (256 IPs)        │                   │ │
│  │  └──────────────────┘  └──────────────────┘                   │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                   │ │
│  │  │ Database         │  │ Reserved         │                   │ │
│  │  │ 10.0.131.0/24    │  │ 10.0.132.0/22    │                   │ │
│  │  │ (256 IPs)        │  │ (1,024 IPs)      │                   │ │
│  │  └──────────────────┘  └──────────────────┘                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│              Remaining: 10.0.192.0/18 (16,384 IPs)                  │
│                    Reserved for future growth                        │
└─────────────────────────────────────────────────────────────────────┘
```

> **Key Concepts:**
> - VPC CIDR divided into zone address prefixes
> - Each zone gets equal allocation (/18 = 16,384 IPs)
> - Subnets carved from zone prefixes
> - Reserved space for future expansion

### Subnets

**Management:**
```
10.0.1.0/24
```

**Application:**
```
10.0.2.0/24
```

**Database:**
```
10.0.3.0/24
```

This means:
- workloads separated logically
- easier firewalling
- easier routing
- better security segmentation

---

## 🛡️ Why Subnets Exist

Without subnets:
> **Everything in one huge network**

### Problems

- security difficult
- traffic noisy
- no segmentation
- firewall complexity

### Subnets Allow

- workload isolation
- traffic control
- security boundaries

**Example:**
> database subnet should not directly expose internet

---

## 🗺️ IBM Internal Subnet Mapping

IBM internally tracks:
- subnet ownership
- route propagation
- workload placement
- subnet reachability

### When Packet Arrives

**Destination:**
```
10.0.2.15
```

IBM internally checks:
```
10.0.2.0/24 belongs to App Subnet
```

Then forwards packet correctly.

This process happens through:
- distributed routing systems
- software networking fabric

---

## 🔀 Virtual Routing Tables

IBM VPC internally maintains **routing tables**.

**Purpose:**
> determine where packets go

### Example

```
10.0.1.0/24 → Local subnet
10.0.2.0/24 → App subnet
0.0.0.0/0 → Public Gateway
192.168.0.0/16 → VPN
```

Every packet requires:
> **route lookup**

Without routes:
> **packet dropped**

---

## 🚫 IBM Reserved IP Addresses

Beginners often assume:
> all subnet IPs usable

**False.**

IBM reserves some addresses internally.

### Example Subnet

```
10.0.1.0/24
```

Not all 256 addresses available.

### 📊 IBM Cloud VPC Reserved IPs per Subnet

| IP Address | Purpose | Example (10.0.1.0/24) |
|------------|---------|----------------------|
| **First IP** | Network address | 10.0.1.0 |
| **Second IP** | Gateway address | 10.0.1.1 |
| **Third IP** | Reserved by IBM | 10.0.1.2 |
| **Fourth IP** | Reserved by IBM | 10.0.1.3 |
| **Last IP** | Broadcast address | 10.0.1.255 |

> **Important:** For a /24 subnet (256 IPs), only **251 IPs are usable** for workloads (256 - 5 reserved = 251).

### 📋 IP Planning Worksheet

Use this table to plan your subnet allocations:

| Subnet Name | Zone | CIDR | Total IPs | Reserved | Usable | Purpose | Notes |
|-------------|------|------|-----------|----------|--------|---------|-------|
| mgmt-zone1 | us-south-1 | 10.0.1.0/24 | 256 | 5 | 251 | Management | Bastion, tools |
| app-zone1 | us-south-1 | 10.0.2.0/24 | 256 | 5 | 251 | Application | Web servers |
| db-zone1 | us-south-1 | 10.0.3.0/24 | 256 | 5 | 251 | Database | DB instances |
| mgmt-zone2 | us-south-2 | 10.0.65.0/24 | 256 | 5 | 251 | Management | Bastion, tools |
| app-zone2 | us-south-2 | 10.0.66.0/24 | 256 | 5 | 251 | Application | Web servers |
| db-zone2 | us-south-2 | 10.0.67.0/24 | 256 | 5 | 251 | Database | DB instances |
| mgmt-zone3 | us-south-3 | 10.0.129.0/24 | 256 | 5 | 251 | Management | Bastion, tools |
| app-zone3 | us-south-3 | 10.0.130.0/24 | 256 | 5 | 251 | Application | Web servers |
| db-zone3 | us-south-3 | 10.0.131.0/24 | 256 | 5 | 251 | Database | DB instances |

### IBM Reserves

- network identifier
- broadcast-related addresses
- gateway IP
- metadata addresses

**Purpose:**
> internal networking operations

---

## 🚪 Gateway IP

Every subnet gets:
> **internal gateway address**

**Purpose:**
> route traffic outside subnet

### Conceptually

```
VSI
 ↓
Subnet Gateway
 ↓
Other Networks
```

Without gateway:
> **subnet isolated completely**

---

## 🔧 Routing Metadata IPs

IBM internally uses hidden networking IPs for:
- routing management
- overlay systems
- hypervisor communication
- infrastructure metadata

These are invisible to customer mostly.

---

## 💻 Every Workload Gets IP Addresses

When VSI created:

IBM allocates:
> **primary private IP**

### Example

```
10.0.2.15
```

This becomes:
> **main workload identity**

---

## 🔢 Secondary IPs

Optional additional IPs.

**Used for:**
- multiple applications
- virtual appliances
- advanced networking

### Example

**Primary:**
```
10.0.2.15
```

**Secondary:**
```
10.0.2.16
10.0.2.17
```

---

## 🌍 Floating IPs

Optional public internet mapping.

### Example

```
Public IP
 ↓
Mapped to
 ↓
Private IP
```

Allows:
> **internet access to workload**

---

## ⚠️ Why CIDR Planning Is Critical

Beginners often randomly choose:
```
10.0.0.0/16
```

without planning future architecture.

**Huge mistake.**

Networking becomes extremely difficult later.

---

## 🚨 Example Problem — VPN Overlap

Suppose:

**On-prem network:**
```
10.0.0.0/16
```

**Cloud VPC:**
```
10.0.0.0/16
```

Now VPN created.

**Problem:**
> both sides use same network

**Result:**
> routing ambiguity

Packets cannot determine:
- local destination?
- remote destination?

**VPN breaks.**

---

## 🚨 Example Problem — Transit Gateway

Suppose:

**VPC A:**
```
10.0.0.0/16
```

**VPC B:**
```
10.0.0.0/16
```

Now attach both to TGW.

**Problem:**
> overlapping routes

TGW cannot distinguish traffic destinations.

**Communication fails.**

---

## 🚨 Example Problem — Kubernetes Networking

Kubernetes also uses CIDRs internally.

### Examples

- pod CIDRs
- service CIDRs

Suppose:

**VPC:**
```
10.0.0.0/16
```

**Kubernetes Pods:**
```
10.0.0.0/16
```

**Conflict occurs.**

Packets routed incorrectly.

**Pods become unreachable.**

---

## 🌐 Hybrid Cloud Networking

Enterprise environments commonly connect:
- IBM Cloud
- AWS
- Azure
- On-prem datacenters

**All networks must avoid overlap.**

### Example Architecture

**IBM Cloud:**
```
10.10.0.0/16
```

**AWS:**
```
10.20.0.0/16
```

**On-Prem:**
```
192.168.0.0/16
```

This prevents routing conflicts.

---

## 🏢 Enterprise IP Planning Strategy

Large enterprises carefully reserve ranges.

### Example

**Production:**
```
10.10.0.0/16
```

**Development:**
```
10.20.0.0/16
```

**Management:**
```
10.30.0.0/16
```

### Benefits

- organized routing
- easier expansion
- predictable architecture

---

## 📊 IPAM (IP Address Management)

IPAM means:
> **managing IP allocation systematically**

### Purpose

- avoid conflicts
- track subnet usage
- reserve future space
- maintain routing consistency

Large enterprises maintain:
> **centralized IPAM databases**

Cloud networking heavily depends on proper IPAM.

---

## 🔧 Terraform Variables

Relevant variables:

```hcl
network_cidrs = [
  "10.0.0.0/16"
]
```

**Subnets:**

```hcl
cidr = "10.0.1.0/24"
```

Terraform converts this into:
> **actual VPC networking layout**

These variables essentially define:
> **entire network topology**

before workloads even exist.

---

## 🧠 Complete Beginner Mental Model

Think of networking like **city planning**.

| Concept | Mapping |
|---------|---------|
| Country | VPC |
| State | Zone |
| City | Subnet |
| Street Address | IP Address |
| Road System | Routes |
| Traffic Rules | ACLs / SGs |

CIDR planning is basically:
> **deciding how the city map is organized before buildings are constructed**

**Good networking begins with good IP planning.**

---

[← Previous: Zones & Datacenter Architecture](./zones-datacenter-architecture.md) | [Index](./README.md) | [Next: Subnet Service Internals →](./subnet-service-internals.md)

---

## 🗺️ Address Prefixes

Address prefixes are an advanced VPC networking feature that allows custom IP address range management within a VPC.

### What Are Address Prefixes

> **Custom IP address ranges that define available address space in each zone**

By default, IBM Cloud automatically creates address prefixes when you create a VPC. However, you can manage custom address prefixes for more control.

### 🏗️ Address Prefix Hierarchy Diagram

See diagram below showing the relationship between VPC CIDR, address prefixes, and subnets:

```
                    ┌─────────────────────────────────────┐
                    │      VPC: 10.0.0.0/16               │
                    │      (Overall IP Space)             │
                    └─────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
        │ Address Prefix  │ │ Address Prefix  │ │ Address Prefix  │
        │   Zone 1        │ │   Zone 2        │ │   Zone 3        │
        │ 10.0.0.0/18     │ │ 10.0.64.0/18    │ │ 10.0.128.0/18   │
        │ (16,384 IPs)    │ │ (16,384 IPs)    │ │ (16,384 IPs)    │
        └─────────────────┘ └─────────────────┘ └─────────────────┘
                │                   │                   │
        ┌───────┼───────┐   ┌───────┼───────┐   ┌───────┼───────┐
        ▼       ▼       ▼   ▼       ▼       ▼   ▼       ▼       ▼
    ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
    │Subnet││Subnet││Subnet││Subnet││Subnet││Subnet││Subnet││Subnet││Subnet│
    │ /24  ││ /24  ││ /24  ││ /24  ││ /24  ││ /24  ││ /24  ││ /24  ││ /24  │
    └──────┘└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘
       │       │       │       │       │       │       │       │       │
       ▼       ▼       ▼       ▼       ▼       ▼       ▼       ▼       ▼
    ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐
    │VSI │  │VSI │  │VSI │  │VSI │  │VSI │  │VSI │  │VSI │  │VSI │  │VSI │
    │IPs │  │IPs │  │IPs │  │IPs │  │IPs │  │IPs │  │IPs │  │IPs │  │IPs │
    └────┘  └────┘  └────┘  └────┘  └────┘  └────┘  └────┘  └────┘  └────┘
```

> **Hierarchy Levels:**
> 1. **VPC CIDR**: Overall address space (e.g., 10.0.0.0/16)
> 2. **Address Prefixes**: Zone-specific allocations (e.g., 10.0.0.0/18 per zone)
> 3. **Subnets**: Workload segments (e.g., 10.0.1.0/24)
> 4. **IP Addresses**: Individual workload IPs (e.g., 10.0.1.5)

### Default vs Custom Address Prefixes

| Aspect | Default | Custom |
|--------|---------|--------|
| Creation | Automatic | Manual |
| Management | IBM-managed | User-managed |
| Flexibility | Limited | High |
| Use Case | Simple deployments | Complex architectures |

---

## 🔧 Managing Custom Address Prefixes

### Resource: ibm_is_vpc_address_prefix

```hcl
resource "ibm_is_vpc_address_prefix" "custom_prefix" {
  name = "custom-prefix-zone-1"
  vpc  = ibm_is_vpc.vpc.id
  zone = "us-south-1"
  cidr = "10.10.0.0/20"
}
```

### What This Creates

IBM Cloud:
- registers custom address prefix
- associates prefix with zone
- makes IP range available for subnets
- updates VPC routing tables

---

## 🎯 Why Custom Address Prefixes Matter

### Use Cases

**1. Precise IP Planning**
```
Control exact IP ranges per zone
```

**2. Non-Contiguous Ranges**
```
Use separate IP blocks in same VPC
```

**3. IP Conservation**
```
Allocate only needed address space
```

**4. Migration Scenarios**
```
Match existing on-premises IP schemes
```

---

## 📊 Address Prefix Architecture

### Example Multi-Zone VPC

```
VPC: 10.0.0.0/16

Zone 1 Address Prefix:
10.0.0.0/20 (4,096 addresses)

Zone 2 Address Prefix:
10.0.16.0/20 (4,096 addresses)

Zone 3 Address Prefix:
10.0.32.0/20 (4,096 addresses)
```

### Subnet Creation

Subnets must be created within defined address prefixes:

```
Zone 1 Subnets:
- 10.0.1.0/24 (within 10.0.0.0/20)
- 10.0.2.0/24 (within 10.0.0.0/20)

Zone 2 Subnets:
- 10.0.17.0/24 (within 10.0.16.0/20)
- 10.0.18.0/24 (within 10.0.16.0/20)
```

---

## ⚠️ Address Prefix Constraints

### Important Rules

**1. Zone-Specific**
```
Each prefix belongs to one zone
```

**2. No Overlap**
```
Prefixes cannot overlap within VPC
```

**3. Subnet Dependency**
```
Subnets must fit within prefix range
```

**4. Cannot Modify**
```
Cannot change prefix after creation
```

---

## 🔧 Terraform Variable

### Module Variable

```hcl
address_prefixes = {
  zone-1 = ["10.10.0.0/20"]
  zone-2 = ["10.10.16.0/20"]
  zone-3 = ["10.10.32.0/20"]
}
```

### What Terraform Does

Terraform:
- creates address prefixes per zone
- validates CIDR ranges
- ensures no overlaps
- associates with VPC

---

## 💡 Best Practices for Address Prefix Management

### 1. Plan Before Creating VPC

```
Design complete IP architecture first
```

**Why:**
- address prefixes cannot be easily changed
- subnet planning depends on prefixes
- migration is complex

### 2. Leave Room for Growth

```
Allocate larger prefixes than immediately needed
```

**Example:**
```
Current need: /24
Allocate: /20
```

This provides expansion capacity.

### 3. Align with Zone Strategy

```
Match prefix size to zone workload expectations
```

**Example:**
```
Production Zone: /18 (large)
Development Zone: /22 (small)
```

### 4. Document IP Allocation

```
Maintain IPAM documentation
```

Track:
- prefix assignments
- subnet allocations
- reserved ranges
- future expansion plans

### 5. Consider Multi-Region

```
Plan IP ranges across regions
```

**Example:**
```
US-South VPC: 10.10.0.0/16
US-East VPC: 10.20.0.0/16
EU-DE VPC: 10.30.0.0/16
```

Prevents conflicts in multi-region architectures.

---

## 🏢 Enterprise Address Prefix Strategy

### Example Architecture

```
VPC: prod-vpc (10.10.0.0/16)

Zone 1 (us-south-1):
├── Address Prefix: 10.10.0.0/18
├── Management Subnet: 10.10.1.0/24
├── Application Subnet: 10.10.2.0/24
└── Database Subnet: 10.10.3.0/24

Zone 2 (us-south-2):
├── Address Prefix: 10.10.64.0/18
├── Management Subnet: 10.10.65.0/24
├── Application Subnet: 10.10.66.0/24
└── Database Subnet: 10.10.67.0/24

Zone 3 (us-south-3):
├── Address Prefix: 10.10.128.0/18
├── Management Subnet: 10.10.129.0/24
├── Application Subnet: 10.10.130.0/24
└── Database Subnet: 10.10.131.0/24
```

### Benefits

- ✅ Clear zone separation
- ✅ Predictable IP allocation
- ✅ Room for expansion
- ✅ Easy troubleshooting
- ✅ Consistent architecture

---

## 🚨 Common Address Prefix Mistakes

### 1. Prefix Too Small

**Problem:**
```
Allocated /24, need more subnets
```

**Solution:**
```
Plan for growth, use larger prefixes
```

### 2. Overlapping Prefixes

**Problem:**
```
Zone 1: 10.0.0.0/20
Zone 2: 10.0.8.0/20 (overlaps!)
```

**Solution:**
```
Use non-overlapping ranges
Zone 1: 10.0.0.0/20
Zone 2: 10.0.16.0/20
```

### 3. Ignoring Future Zones

**Problem:**
```
Used entire VPC CIDR for 2 zones
```

**Solution:**
```
Reserve space for additional zones
```

---

## 🔄 Address Prefix vs VPC CIDR

### Relationship

```
VPC CIDR: 10.0.0.0/16 (overall range)
    ↓
Address Prefixes: subdivisions per zone
    ↓
Subnets: further subdivisions
```

### Example

**VPC CIDR:**
```
10.0.0.0/16 (65,536 addresses)
```

**Address Prefixes:**
```
Zone 1: 10.0.0.0/18 (16,384 addresses)
Zone 2: 10.0.64.0/18 (16,384 addresses)
Zone 3: 10.0.128.0/18 (16,384 addresses)
Reserved: 10.0.192.0/18 (16,384 addresses)
```

---

## 🧠 Mental Model

Think of address prefixes like:
> **land parcels within a city**

| Real World | IBM Cloud |
|------------|-----------|
| City | VPC |
| District | Zone |
| Land Parcel | Address Prefix |
| Building Plot | Subnet |
| Building Address | IP Address |

**Address prefix:**
> **defines available land in each district before buildings are constructed**

---

## 🔑 Key Takeaways

### 1. Address Prefixes Define Zone IP Space

They determine what IP ranges are available per zone.

### 2. Plan Before Creating

Cannot easily change after VPC creation.

### 3. Leave Room for Growth

Allocate larger prefixes than immediately needed.

### 4. Maintain IPAM Documentation

Track all IP allocations systematically.

### 5. Align with Enterprise Strategy

Consider multi-VPC and multi-region architectures.

---

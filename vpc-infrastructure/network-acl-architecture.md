# 🛡️ Network ACL Architecture — Deep Beginner Explanation

[← Previous: Subnet Service Internals](./05-subnet-service-internals.md) | [Index](./README.md) | [Next: ACL Service Internals →](./07-acl-service-internals.md)

---

## 📋 Overview

After understanding:
- VPC
- subnets
- routing

the next major concept is:
> **traffic filtering**

Because creating a network alone is not enough.

### Without Security Controls

- every workload could communicate freely
- attackers could scan infrastructure
- unwanted traffic could enter subnets
- malware could spread laterally

Cloud networking therefore introduces multiple security layers.

The first major security layer inside IBM Cloud VPC networking is:
> **Network ACLs**

---

## 🔐 What Is an ACL

ACL stands for:
> **Access Control List**

ACLs act like:
> **subnet-level traffic filtering checkpoints**

They decide:
- which packets may enter subnet
- which packets may leave subnet

before traffic reaches actual workloads.

---

## 🔀 Where ACL Fits in Traffic Flow

### 🔄 ACL Evaluation Flow Diagram

See diagram below showing how ACLs evaluate traffic:

```
┌─────────────────────────────────────────────────────────────────┐
│                      External Traffic Source                     │
│              (Internet / VPN / Transit Gateway)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   VPC Routing        │
                  │   (Route Tables)     │
                  └──────────┬───────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Subnet Boundary                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Network ACL (Stateless Firewall)                   │ │
│  │                                                            │ │
│  │  Step 1: Check Inbound Rules (Sequential Order)           │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Rule 1: Priority 1  → Allow TCP 443 from 0.0.0.0/0   │ │ │
│  │  │ Rule 2: Priority 2  → Allow TCP 22 from 10.0.1.0/24  │ │ │
│  │  │ Rule 3: Priority 3  → Deny ALL from 0.0.0.0/0        │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  Decision: ALLOW or DENY                                  │ │
│  │  ├─ If DENY → Packet Dropped ❌                          │ │
│  │  └─ If ALLOW → Continue ✅                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Security Group (Stateful Firewall)                 │ │
│  │  - Evaluates rules (any order)                             │ │
│  │  - Tracks connection state                                 │ │
│  │  - Auto-allows return traffic                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             ▼                                    │
│                    ┌─────────────────┐                          │
│                    │   Workload      │                          │
│                    │   (VSI/Pod)     │                          │
│                    └─────────┬───────┘                          │
│                              │                                   │
│                              │ Response Traffic                  │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Security Group (Return)                            │ │
│  │  - Automatically allowed (stateful)                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Network ACL (Outbound Rules)                       │ │
│  │  Step 2: Check Outbound Rules (Sequential Order)          │ │
│  │  ⚠️ Must explicitly allow return traffic!                 │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Rule 1: Allow TCP 1024-65535 to 0.0.0.0/0            │ │ │
│  │  │ Rule 2: Deny ALL to 0.0.0.0/0                        │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   Return to Source   │
                  └──────────────────────┘
```

> **Key Concepts:**
> - **ACL evaluates BOTH inbound and outbound** (stateless)
> - **Rules processed in sequential order** (priority matters)
> - **First matching rule wins** (stops evaluation)
> - **Return traffic needs explicit outbound rule** (no auto-tracking)
> - **Security Groups evaluated after ACL** (second layer)

### Traffic Hierarchy

```
Internet / VPN / TGW
        ↓
VPC Routing
        ↓
Subnet
        ↓
ACL
        ↓
Security Group
        ↓
Workload
```

**Important:**
> ACL operates BEFORE workload-level security

This is why ACLs are called:
> **first security boundary**

---

## 🎯 Why ACLs Exist

Imagine no ACLs existed.

### Example

```
Database Subnet
10.0.3.0/24
```

**Without ACL:**
- any reachable source could attempt traffic
- port scans possible
- unauthorized traffic reaches workloads

Even if Security Groups later block traffic:
> **unwanted packets already entered subnet**

ACLs provide:
> **early packet filtering**

This reduces:
- attack surface
- unnecessary traffic
- exposure risk

---

## 🔍 What ACL Actually Does

ACL examines every packet entering or leaving subnet.

### It Checks

- source IP
- destination IP
- protocol
- port
- traffic direction

### Then Decides

- **allow**
- **deny**

### Conceptually

```
Incoming Packet
       ↓
ACL Rule Evaluation
       ↓
Permit or Deny
```

---

## ⚠️ Important Beginner Understanding

ACLs protect:
> **subnet**

NOT:
> **individual workloads**

This is critical.

If ACL attached to subnet:
```
10.0.2.0/24
```

then:
> **all workloads inside subnet inherit ACL behavior**

### Example

- all VSIs
- all Kubernetes workers
- all interfaces

inside subnet affected.

---

## 🔧 What Happens Internally When ACL Is Created

### Terraform Example

```hcl
resource "ibm_is_network_acl" "app_acl" {
  name = "app-acl"
}
```

Terraform creates:
> **ACL object**

IBM internally:
- registers ACL
- associates subnet mappings
- configures packet filtering rules
- updates distributed enforcement systems

IBM networking fabric now knows:
> **Traffic entering subnet must pass ACL evaluation**

---

## 📋 ACL Rules

ACL itself does nothing until rules added.

**Rules define filtering behavior.**

### Example

- allow SSH from management subnet
- deny all internet inbound

### Rules Commonly Contain

| Field | Purpose |
|-------|---------|
| Source CIDR | Where traffic comes from |
| Destination CIDR | Where traffic going |
| Protocol | TCP/UDP/ICMP |
| Port | 22, 443, etc |
| Direction | inbound/outbound |
| Action | allow/deny |

---

## 🌐 Source CIDR

Defines:
> **packet origin network**

### Example

```
10.0.1.0/24
```

**Meaning:**
> traffic allowed only from management subnet

---

## 🎯 Destination CIDR

Defines:
> **where packet going**

### Example

```
10.0.3.0/24
```

**Meaning:**
> rule applies only toward database subnet

---

## 📡 Protocol

Defines:
> **traffic type**

### Examples

| Protocol | Purpose |
|----------|---------|
| TCP | Web, SSH, databases |
| UDP | DNS, streaming |
| ICMP | Ping |
| ALL | All protocols |

---

## 🔄 Direction

Defines:
- **inbound**
- **outbound**

**Inbound:**
> traffic entering subnet

**Outbound:**
> traffic leaving subnet

### Example

```
Internet
   ↓
Inbound ACL
   ↓
Subnet
```

---

## ✅ Allow / Deny

Final ACL decision.

### Example

```
Allow TCP 22
Deny everything else
```

If packet matches deny:
> **dropped immediately**

---

## ⚡ Important Characteristic — ACLs Are Stateless

This is one of the most important beginner concepts.

ACLs are:
> **stateless firewalls**

**Meaning:**
> ACL does NOT remember connections

Every packet evaluated independently.

### 📊 Comprehensive ACL vs Security Groups Comparison

| Feature | Network ACL | Security Group |
|---------|-------------|----------------|
| **Stateful/Stateless** | ❌ Stateless | ✅ Stateful |
| **Scope** | Subnet-level | Network interface (NIC) level |
| **Applies to** | All resources in subnet | Specific workload instances |
| **Rule Processing** | Sequential (priority order) | All rules evaluated (no order) |
| **Rule Limit** | 100 rules per ACL | 25 rules per security group |
| **Default Behavior** | Allow all (default ACL) | Deny all (custom SG) |
| **Return Traffic** | ⚠️ Requires explicit rule | ✅ Automatically allowed |
| **Direction** | Inbound + Outbound separate | Inbound + Outbound separate |
| **Rule Actions** | Allow or Deny | Allow only (implicit deny) |
| **Protocol Support** | TCP, UDP, ICMP, ALL | TCP, UDP, ICMP, ALL |
| **Source/Destination** | IP/CIDR only | IP/CIDR or Security Group reference |
| **Modification Impact** | Affects entire subnet | Affects specific instances |
| **Use Case** | Broad subnet protection | Fine-grained workload control |
| **Best Practice** | Coarse filtering | Application-specific rules |
| **Performance** | Minimal overhead | Minimal overhead |
| **Evaluation Order** | First (before SG) | Second (after ACL) |
| **Connection Tracking** | ❌ None | ✅ Full connection state |
| **Ephemeral Ports** | Must explicitly allow | Automatically handled |

### 📋 Example ACL Rule Tables

#### Web Tier ACL (Public Subnet)

| Priority | Direction | Protocol | Source | Dest | Port | Action | Purpose |
|----------|-----------|----------|--------|------|------|--------|---------|
| 1 | Inbound | TCP | 0.0.0.0/0 | 0.0.0.0/0 | 443 | Allow | HTTPS from internet |
| 2 | Inbound | TCP | 0.0.0.0/0 | 0.0.0.0/0 | 80 | Allow | HTTP from internet |
| 3 | Inbound | TCP | 10.0.1.0/24 | 0.0.0.0/0 | 22 | Allow | SSH from mgmt subnet |
| 4 | Inbound | ALL | 0.0.0.0/0 | 0.0.0.0/0 | ALL | Deny | Block all other inbound |
| 5 | Outbound | TCP | 0.0.0.0/0 | 0.0.0.0/0 | 1024-65535 | Allow | Return traffic (ephemeral) |
| 6 | Outbound | TCP | 0.0.0.0/0 | 10.0.3.0/24 | 5432 | Allow | Database access |
| 7 | Outbound | TCP | 0.0.0.0/0 | 0.0.0.0/0 | 443 | Allow | HTTPS to internet |
| 8 | Outbound | ALL | 0.0.0.0/0 | 0.0.0.0/0 | ALL | Deny | Block all other outbound |

#### App Tier ACL (Private Subnet)

| Priority | Direction | Protocol | Source | Dest | Port | Action | Purpose |
|----------|-----------|----------|--------|------|------|--------|---------|
| 1 | Inbound | TCP | 10.0.2.0/24 | 0.0.0.0/0 | 8080 | Allow | From web tier |
| 2 | Inbound | TCP | 10.0.1.0/24 | 0.0.0.0/0 | 22 | Allow | SSH from mgmt |
| 3 | Inbound | ALL | 0.0.0.0/0 | 0.0.0.0/0 | ALL | Deny | Block all other |
| 4 | Outbound | TCP | 0.0.0.0/0 | 10.0.3.0/24 | 5432 | Allow | To database |
| 5 | Outbound | TCP | 0.0.0.0/0 | 0.0.0.0/0 | 1024-65535 | Allow | Return traffic |
| 6 | Outbound | TCP | 0.0.0.0/0 | 0.0.0.0/0 | 443 | Allow | External APIs |
| 7 | Outbound | ALL | 0.0.0.0/0 | 0.0.0.0/0 | ALL | Deny | Block all other |

#### Database Tier ACL (Private Subnet)

| Priority | Direction | Protocol | Source | Dest | Port | Action | Purpose |
|----------|-----------|----------|--------|------|------|--------|---------|
| 1 | Inbound | TCP | 10.0.2.0/24 | 0.0.0.0/0 | 5432 | Allow | From web tier |
| 2 | Inbound | TCP | 10.0.4.0/24 | 0.0.0.0/0 | 5432 | Allow | From app tier |
| 3 | Inbound | TCP | 10.0.1.0/24 | 0.0.0.0/0 | 22 | Allow | SSH from mgmt |
| 4 | Inbound | ALL | 0.0.0.0/0 | 0.0.0.0/0 | ALL | Deny | Block all other |
| 5 | Outbound | TCP | 0.0.0.0/0 | 0.0.0.0/0 | 1024-65535 | Allow | Return traffic |
| 6 | Outbound | ALL | 0.0.0.0/0 | 0.0.0.0/0 | ALL | Deny | Block all other |

> **Key Observations:**
> - **Ephemeral ports (1024-65535)** must be explicitly allowed for return traffic
> - **Deny rules at end** ensure default-deny posture
> - **Priority order matters** - first match wins
> - **Both inbound AND outbound** rules required (stateless)

---

## 🔄 Example of Stateless Behavior

Suppose:

```
Laptop
 ↓
SSH to Server
```

**Inbound packet allowed:**
```
Laptop → Server TCP 22
```

But response traffic:
```
Server → Laptop
```

is separate traffic.

**ACL does NOT automatically allow return traffic.**

You must explicitly allow:
> **outbound response traffic too**

This surprises many beginners.

---

## 📊 Stateful vs Stateless

| Feature | ACL | Security Group |
|---------|-----|----------------|
| Stateful | No | Yes |
| Subnet scoped | Yes | No |
| Workload scoped | No | Yes |
| Return traffic automatic | No | Yes |

**ACL:**
> packet-by-packet evaluation

**Security Group:**
> connection-aware

---

## 📝 Ordered Rules

ACL rules are evaluated in order.

This is extremely important.

### Example

**Rule 1:**
```
Deny all inbound
```

**Rule 2:**
```
Allow SSH
```

**SSH never works.**

Because:
> packet matched deny first

### Correct Order

**Rule 1:**
```
Allow SSH
```

**Rule 2:**
```
Deny all inbound
```

**Now SSH works.**

ACL processing stops at:
> **first matching rule**

This is called:
> **first-match evaluation**

---

## 🎯 Example ACL Design

Suppose database subnet:

```
10.0.3.0/24
```

### Requirements

- only app subnet may access database
- internet blocked completely

### ACL Rules

```
Allow TCP 5432 from 10.0.2.0/24
Deny all inbound from internet
```

### Result

- app servers communicate
- public traffic blocked

---

## 🏢 Real Enterprise Example

### Enterprise Subnet Design

| Subnet | Purpose |
|--------|---------|
| Management | Admin access |
| Application | Business apps |
| Database | Persistent storage |
| Monitoring | Observability |

ACLs enforce segmentation.

### Example

**Management subnet:**
```
Allow SSH outbound
```

**Database subnet:**
```
Allow DB traffic only from app subnet
```

**Monitoring subnet:**
```
Allow telemetry traffic only
```

This creates:
- lateral movement restriction
- tighter security boundaries

---

## 🔧 IBM Internal ACL Enforcement

IBM internally distributes ACL rules through networking infrastructure.

### Traffic Entering Subnet

```
Packet
 ↓
IBM Enforcement Engine
 ↓
ACL Rule Match
 ↓
Forward or Drop
```

This enforcement happens:
> **before workload receives packet**

This reduces unnecessary traffic load.

---

## 🚪 Inbound ACL Example

Suppose attacker scans subnet.

### Packet

**Source:**
```
203.0.113.5
```

**Destination:**
```
10.0.3.10
```

**Port:**
```
22
```

### ACL Rule

```
Deny inbound SSH from internet
```

### Result

**Packet dropped immediately**

Server never sees traffic.

---

## 🚫 Outbound ACL Example

Suppose malware inside workload tries internet communication.

### ACL

```
Deny outbound internet traffic
```

### Result

**traffic blocked at subnet boundary**

This limits:
- data exfiltration
- malware propagation

---

## 📏 Why ACLs Are Called "Coarse-Grained Security"

ACLs apply to:
> **entire subnet**

Not:
> **individual workload behavior**

This makes ACLs:
- broader controls
- infrastructure-level filtering

### Example

- block internet entirely
- restrict subnet communication
- enforce zone segmentation

More detailed workload protection handled by:
> **Security Groups**

---

## 🛡️ ACL and Security Groups Together

Production environments usually use both.

### Example

**ACL:**
```
Block all internet inbound
```

**Security Group:**
```
Allow HTTPS only
```

This creates:
> **layered defense**

Even if SG misconfigured:
> **ACL still protects subnet**

This is called:
> **defense in depth**

---

## 🔒 Default ACL Behavior

Many cloud providers create default allow rules initially.

But secure enterprise environments usually create:
> **restrictive ACLs**

### Principle

> **least privilege**

**Meaning:**
> allow only required traffic

Everything else denied.

---

## 🔧 Terraform Implementation

### Network ACL Resource Creation

The `terraform-ibm-landing-zone-vpc` module creates Network ACLs with sophisticated rule management:

**File:** [`network_acls.tf`](https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone-vpc/blob/main/network_acls.tf)

```terraform
##############################################################################
# Network ACL with Automatic IBM Cloud Rules
##############################################################################

locals {
  # IBM Cloud Internal Rules (IaaS and PaaS endpoints)
  internal_rules = [
    # IaaS Endpoints (161.26.0.0/16) - Inbound
    {
      name        = "ibmflow-iaas-inbound"
      action      = "allow"
      source      = "161.26.0.0/16"  # IBM Cloud IaaS services
      destination = "0.0.0.0/0"
      direction   = "inbound"
      tcp         = null
      udp         = null
      icmp        = null
    },
    # IaaS Endpoints - Outbound
    {
      name        = "ibmflow-iaas-outbound"
      action      = "allow"
      destination = "161.26.0.0/16"
      source      = "0.0.0.0/0"
      direction   = "outbound"
      tcp         = null
      udp         = null
      icmp        = null
    },
    # PaaS Endpoints (166.8.0.0/14) - Inbound
    {
      name        = "ibmflow-paas-inbound"
      action      = "allow"
      source      = "166.8.0.0/14"  # IBM Cloud PaaS services
      destination = "0.0.0.0/0"
      direction   = "inbound"
      tcp         = null
      udp         = null
      icmp        = null
    },
    # PaaS Endpoints - Outbound
    {
      name        = "ibmflow-paas-outbound"
      action      = "allow"
      destination = "166.8.0.0/14"
      source      = "0.0.0.0/0"
      direction   = "outbound"
      tcp         = null
      udp         = null
      icmp        = null
    }
  ]

  # VPC Connectivity Rules: Allow traffic between all subnets in the VPC
  vpc_inbound_rule = flatten([
    for index, cidrs in var.network_cidrs != null ? var.network_cidrs : ["0.0.0.0/0"] : [
      for address in data.ibm_is_vpc_address_prefixes.get_address_prefixes.address_prefixes :
      {
        name        = "ibmflow-allow-vpc-connectivity-inbound-${substr(address.id, -4, -1)}-${index}"
        action      = "allow"
        source      = address.cidr      # From any VPC address prefix
        destination = cidrs             # To this subnet
        direction   = "inbound"
        tcp         = null
        udp         = null
        icmp        = null
      }
    ]
  ])
  
  vpc_outbound_rule = flatten([
    for address in data.ibm_is_vpc_address_prefixes.get_address_prefixes.address_prefixes : [
      for index, cidrs in var.network_cidrs != null ? var.network_cidrs : ["0.0.0.0/0"] :
      {
        name        = "ibmflow-allow-vpc-connectivity-outbound-${substr(address.id, -4, -1)}-${index}"
        action      = "allow"
        source      = cidrs             # From this subnet
        destination = address.cidr      # To any VPC address prefix
        direction   = "outbound"
        tcp         = null
        udp         = null
        icmp        = null
      }
    ]
  ])

  vpc_connectivity_rules = distinct(flatten(concat(local.vpc_inbound_rule, local.vpc_outbound_rule)))

  # Deny-all rules (best practice: explicit deny at the end)
  deny_all_rules = [
    {
      name        = "ibmflow-deny-all-inbound"
      action      = "deny"
      source      = "0.0.0.0/0"
      destination = "0.0.0.0/0"
      direction   = "inbound"
      tcp         = null
      udp         = null
      icmp        = null
    },
    {
      name        = "ibmflow-deny-all-outbound"
      action      = "deny"
      source      = "0.0.0.0/0"
      destination = "0.0.0.0/0"
      direction   = "outbound"
      tcp         = null
      udp         = null
      icmp        = null
    }
  ]

  # Build the complete ACL object with all rules in order
  acl_object = {
    for network_acl in var.network_acls :
    network_acl.name => {
      name = network_acl.name
      rules = flatten([
        # PREPEND IBM rules (if requested)
        [
          for rule in local.ibm_cloud_internal_rules :
          rule if network_acl.add_ibm_cloud_internal_rules == true &&
                  network_acl.prepend_ibm_rules == true
        ],
        [
          for rule in local.vpc_connectivity_rules :
          rule if network_acl.add_vpc_connectivity_rules == true &&
                  network_acl.prepend_ibm_rules == true
        ],
        
        # CUSTOM USER RULES (always in the middle)
        network_acl.rules,
        
        # APPEND IBM rules (if not prepended)
        [
          for rule in local.ibm_cloud_internal_rules :
          rule if network_acl.add_ibm_cloud_internal_rules == true &&
                  network_acl.prepend_ibm_rules != true
        ],
        [
          for rule in local.vpc_connectivity_rules :
          rule if network_acl.add_vpc_connectivity_rules == true &&
                  network_acl.prepend_ibm_rules != true
        ],
        
        # DENY-ALL rules (always at the end - best practice)
        local.deny_all_rules
      ])
    }
  }
}

##############################################################################
# Create Network ACLs
##############################################################################

resource "ibm_is_network_acl" "network_acl" {
  for_each = {
    for acl_key, acl_value in local.acl_object : acl_key => acl_value
    if var.create_subnets
  }
  
  name           = var.prefix != null ? "${var.prefix}-${each.key}" : each.key
  vpc            = local.vpc_id
  resource_group = var.resource_group_id
  access_tags    = var.access_tags
  tags           = var.tags

  # Dynamic rules block - creates one rule per entry
  dynamic "rules" {
    for_each = each.value.rules
    
    content {
      name        = rules.value.name
      action      = rules.value.action      # "allow" or "deny"
      source      = rules.value.source      # Source CIDR
      destination = rules.value.destination # Destination CIDR
      direction   = rules.value.direction   # "inbound" or "outbound"

      # TCP rules (optional)
      dynamic "tcp" {
        for_each = rules.value.tcp == null ? [] : [rules.value]
        content {
          port_min        = lookup(rules.value.tcp, "port_min", null)
          port_max        = lookup(rules.value.tcp, "port_max", null)
          source_port_min = lookup(rules.value.tcp, "source_port_min", null)
          source_port_max = lookup(rules.value.tcp, "source_port_max", null)
        }
      }

      # UDP rules (optional)
      dynamic "udp" {
        for_each = rules.value.udp == null ? [] : [rules.value]
        content {
          port_min        = lookup(rules.value.udp, "port_min", null)
          port_max        = lookup(rules.value.udp, "port_max", null)
          source_port_min = lookup(rules.value.udp, "source_port_min", null)
          source_port_max = lookup(rules.value.udp, "source_port_max", null)
        }
      }

      # ICMP rules (optional)
      dynamic "icmp" {
        for_each = rules.value.icmp == null ? [] : [rules.value]
        content {
          type = rules.value.icmp.type  # ICMP type (e.g., 8 for echo request)
          code = rules.value.icmp.code  # ICMP code
        }
      }
    }
  }
}
```

### Key Implementation Details

#### 1. Rule Ordering (Critical!)
```terraform
rules = flatten([
  # 1. IBM Cloud internal rules (optional, prepended)
  # 2. VPC connectivity rules (optional, prepended)
  # 3. Custom user rules (always in the middle)
  # 4. IBM Cloud internal rules (optional, appended)
  # 5. VPC connectivity rules (optional, appended)
  # 6. Deny-all rules (always at the end)
])
```

**Why this order matters:**
- ACL rules are evaluated **sequentially**
- First match wins
- Deny-all at the end ensures explicit security posture

#### 2. IBM Cloud Internal Rules
```terraform
# IaaS: 161.26.0.0/16
# PaaS: 166.8.0.0/14
```

**Required for:**
- DNS resolution
- NTP time sync
- Package repositories
- IBM Cloud services (COS, databases, etc.)

**Without these rules:** Workloads cannot access IBM Cloud services!

#### 3. VPC Connectivity Rules
```terraform
vpc_connectivity_rules = distinct(flatten(concat(
  local.vpc_inbound_rule,
  local.vpc_outbound_rule
)))
```

**Purpose:** Allow traffic between all subnets in the VPC

**Generated from:** VPC address prefixes (fetched via data source)

#### 4. Dynamic Protocol Blocks
```terraform
dynamic "tcp" {
  for_each = rules.value.tcp == null ? [] : [rules.value]
  content {
    port_min = lookup(rules.value.tcp, "port_min", null)
    port_max = lookup(rules.value.tcp, "port_max", null)
  }
}
```

**Handles:**
- TCP port ranges
- UDP port ranges
- ICMP types and codes
- Protocol-agnostic rules (when all are null)

### Usage Example

```terraform
module "vpc" {
  source = "terraform-ibm-modules/landing-zone-vpc/ibm"
  
  # VPC Configuration
  create_vpc        = true
  name              = "production"
  region            = "us-south"
  resource_group_id = "abc123..."
  
  # Network ACL Configuration
  network_acls = [
    {
      name = "web-acl"
      
      # Add IBM Cloud service rules
      add_ibm_cloud_internal_rules = true
      add_vpc_connectivity_rules   = true
      prepend_ibm_rules            = true  # Put IBM rules first
      
      # Custom rules
      rules = [
        # Allow HTTP from internet
        {
          name        = "allow-http-inbound"
          action      = "allow"
          direction   = "inbound"
          source      = "0.0.0.0/0"
          destination = "0.0.0.0/0"
          tcp = {
            port_min = 80
            port_max = 80
          }
          udp  = null
          icmp = null
        },
        # Allow HTTPS from internet
        {
          name        = "allow-https-inbound"
          action      = "allow"
          direction   = "inbound"
          source      = "0.0.0.0/0"
          destination = "0.0.0.0/0"
          tcp = {
            port_min = 443
            port_max = 443
          }
          udp  = null
          icmp = null
        },
        # Allow all outbound
        {
          name        = "allow-all-outbound"
          action      = "allow"
          direction   = "outbound"
          source      = "0.0.0.0/0"
          destination = "0.0.0.0/0"
          tcp         = null
          udp         = null
          icmp        = null
        }
      ]
    },
    {
      name = "db-acl"
      
      # Add IBM Cloud service rules
      add_ibm_cloud_internal_rules = true
      add_vpc_connectivity_rules   = true
      prepend_ibm_rules            = true
      
      # Custom rules
      rules = [
        # Allow PostgreSQL from VPC only
        {
          name        = "allow-postgres-from-vpc"
          action      = "allow"
          direction   = "inbound"
          source      = "10.10.0.0/16"  # VPC CIDR
          destination = "0.0.0.0/0"
          tcp = {
            port_min = 5432
            port_max = 5432
          }
          udp  = null
          icmp = null
        },
        # Allow outbound for updates
        {
          name        = "allow-outbound-updates"
          action      = "allow"
          direction   = "outbound"
          source      = "0.0.0.0/0"
          destination = "0.0.0.0/0"
          tcp         = null
          udp         = null
          icmp        = null
        }
      ]
    }
  ]
  
  # Subnet Configuration (ACLs are attached here)
  subnets = {
    zone-1 = [
      {
        name     = "web-subnet"
        cidr     = "10.10.1.0/24"
        acl_name = "web-acl"  # Reference ACL by name
      },
      {
        name     = "db-subnet"
        cidr     = "10.10.4.0/24"
        acl_name = "db-acl"
      }
    ]
  }
}
```

### Resulting ACL Rule Order

For the `web-acl` above, the final rule order will be:

```
1. ibmflow-iaas-inbound (161.26.0.0/16)
2. ibmflow-iaas-outbound (161.26.0.0/16)
3. ibmflow-paas-inbound (166.8.0.0/14)
4. ibmflow-paas-outbound (166.8.0.0/14)
5. ibmflow-allow-vpc-connectivity-inbound-* (VPC CIDRs)
6. ibmflow-allow-vpc-connectivity-outbound-* (VPC CIDRs)
7. allow-http-inbound (custom)
8. allow-https-inbound (custom)
9. allow-all-outbound (custom)
10. ibmflow-deny-all-inbound (0.0.0.0/0)
11. ibmflow-deny-all-outbound (0.0.0.0/0)
```

**Security Posture:** Default deny with explicit allows

### Best Practices

1. **Always include IBM Cloud internal rules** for service access
2. **Always include VPC connectivity rules** for inter-subnet communication
3. **Always end with deny-all rules** for explicit security
4. **Use prepend_ibm_rules = true** to ensure IBM rules are evaluated first
5. **Be specific with custom rules** - avoid overly permissive rules
6. **Test ACL changes carefully** - they can break connectivity

See [`acl-service-internals.md`](acl-service-internals.md) for more details on ACL behavior.

---

## 🧠 Complete Beginner Mental Model

Think of subnet like:
> **secure apartment building**

ACL acts like:
> **security gate outside building**

Before anyone enters:
- guard checks identity
- decides allow or deny

### Mapping

| Real World | IBM Cloud |
|------------|-----------|
| Apartment Complex | Subnet |
| Main Security Gate | ACL |
| Apartment Door Lock | Security Group |
| Resident | Workload |

**ACL protects:**
> **entire building perimeter**

**Security Group protects:**
> **individual apartments**

This layered model is foundational to cloud network security architecture.

---

[← Previous: Subnet Service Internals](./05-subnet-service-internals.md) | [Index](./README.md) | [Next: ACL Service Internals →](./07-acl-service-internals.md)
# 🔍 ACL Service Internals — Deep Beginner Explanation

[← Previous: Network ACL Architecture](./network-acl-architecture.md) | [Index](./README.md) | [Next: Security Group Service Internals →](./security-group-service-internals.md)

---

## 📋 Overview

To properly understand IBM Cloud ACL internals, you must stop thinking of ACLs as "simple firewall rules."

ACLs are actually:
- **distributed packet filtering policies**
- **enforced at subnet boundaries**
- **integrated deeply into IBM Cloud networking fabric**

They are part of the infrastructure-level traffic control system.

ACLs operate before traffic reaches:
- VSIs
- Kubernetes workers
- databases
- load balancers

This makes ACLs one of the **earliest enforcement layers** in IBM Cloud VPC networking.

---

## 🎯 What Problem ACLs Solve Internally

Imagine IBM Cloud receives billions of packets continuously:
- internet traffic
- VPN traffic
- TGW traffic
- inter-subnet traffic
- Kubernetes traffic

### Without Early Filtering

- malicious packets reach workloads
- unnecessary traffic consumes resources
- lateral movement becomes easier
- subnet isolation weakens

IBM therefore performs filtering early in the packet lifecycle.

**ACLs provide this early-stage filtering mechanism.**

### Conceptually

```
Packet Arrives
      ↓
ACL Inspection
      ↓
Allow or Drop
      ↓
Only Allowed Traffic Reaches Workload
```

---

## 🔀 Where ACLs Exist in Networking Stack

### Traffic Hierarchy

```
External Source
      ↓
VPC Routing
      ↓
Subnet Boundary
      ↓
ACL Engine
      ↓
Security Group
      ↓
Workload
```

ACLs exist:
> **at subnet boundary**

This is extremely important.

### ACLs Do NOT Belong To

- VSI
- pod
- application

### They Belong To

> **subnet**

Everything inside subnet inherits ACL behavior automatically.

---

## 🔧 What Terraform Actually Creates

### Terraform Example

```hcl
resource "ibm_is_network_acl" "app_acl" {
  name = "app-acl"
}
```

Terraform creates:
> **ACL object**

Then rules added:
- allow SSH from management subnet
- deny internet inbound

Terraform sends API calls to IBM Cloud control plane.

### IBM Internally

- registers ACL metadata
- distributes ACL policies
- associates ACL with subnet
- updates enforcement systems

The actual packet filtering happens inside IBM's distributed networking infrastructure.

---

## ⚠️ Important Beginner Understanding

**ACL is NOT:**
- Linux iptables
- firewall VM
- dedicated appliance

**ACL is:**
> **cloud-native distributed filtering system**

IBM internally embeds ACL enforcement into:
- virtual networking fabric
- routing enforcement systems
- SDN packet processing layers

This allows:
- scalable filtering
- high-speed enforcement
- subnet-wide protection

---

## 📦 ACL Objects

ACL object itself is just:
> **container for rules**

### Example

```
app-acl
```

This alone does nothing.

**Rules define actual filtering behavior.**

---

## 📋 ACL Rules

ACL rules define:
- packet matching conditions
- filtering action

### Each Rule Generally Contains

| Field | Purpose |
|-------|---------|
| Source CIDR | Where traffic comes from |
| Destination CIDR | Where traffic going |
| Protocol | TCP/UDP/ICMP |
| Source Port | Origin port |
| Destination Port | Target port |
| Direction | Inbound/Outbound |
| Action | Allow/Deny |
| Priority | Rule evaluation order |

---

## 🔍 Packet Inspection Process

Suppose packet arrives:

**Source:**
```
203.0.113.10
```

**Destination:**
```
10.0.3.15
```

**Protocol:**
```
TCP
```

**Port:**
```
22
```

IBM ACL engine evaluates packet against rules sequentially.

### Example

**Rule 1:**
```
Allow SSH from management subnet
```

**Rule 2:**
```
Deny all inbound internet
```

Packet does not match Rule 1.

Then Rule 2 matches.

### Result

**Packet Dropped**

Packet never reaches workload.

---

## 📝 Ordered Rule Processing

ACL rules are evaluated:
> **top to bottom**

This is called:
> **ordered evaluation**

ACL engine stops processing:
> **at first match**

This is extremely important.

---

## 🚨 Example of Bad Rule Order

**Rule 1:**
```
Deny all inbound
```

**Rule 2:**
```
Allow HTTPS
```

**HTTPS never works.**

Because:
> traffic matched Rule 1 already

### Correct Order

**Rule 1:**
```
Allow HTTPS
```

**Rule 2:**
```
Deny all inbound
```

**Now HTTPS succeeds.**

Rule ordering is one of the most common beginner mistakes.

---

## ⚡ What "Stateless" Actually Means

This is the most important ACL concept.

ACLs are:
> **stateless**

**Meaning:**
> ACL does NOT remember traffic sessions

Every packet evaluated independently.

---

## 🔄 Example of Stateful Firewall

Suppose laptop opens HTTPS connection:

```
Laptop
   ↓
HTTPS Request
   ↓
Server
```

Stateful firewall remembers:
> **connection established**

So return traffic automatically allowed.

---

## 🔀 ACL Stateless Behavior

ACL does NOT remember anything.

### Example

**Inbound packet:**
```
Laptop → Server TCP 443
```

allowed.

**But response packet:**
```
Server → Laptop
```

is treated as completely separate traffic.

ACL requires:
> **explicit outbound allow rule too**

Without outbound rule:
> **return traffic blocked**

This confuses many beginners initially.

---

## 🚀 Why Stateless Design Exists

Stateless filtering is:
- simpler
- faster
- highly scalable

IBM Cloud networking processes enormous traffic volumes.

### Stateless Inspection Reduces

- memory overhead
- connection tracking complexity
- scaling bottlenecks

ACLs therefore focus on:
> **coarse infrastructure filtering**

Detailed connection-aware filtering handled later by:
> **Security Groups**

---

## 🌐 Subnet-Scoped Enforcement

ACL attached to subnet:

```
10.0.2.0/24
```

**Means:**
> every workload inside subnet affected

### Example

- VSI-A
- VSI-B
- Kubernetes Worker
- Load Balancer Interface

all inherit ACL behavior.

This makes ACLs:
> **infrastructure-wide security layer**

---

## 📥 Incoming Traffic Flow

Suppose internet packet arrives.

### Flow

```
Internet
   ↓
IBM Edge Network
   ↓
VPC Routing
   ↓
Subnet Boundary
   ↓
ACL Engine
   ↓
Permit or Drop
```

If denied:
> **packet discarded immediately**

Workload never sees traffic.

---

## 📤 Outgoing Traffic Flow

Traffic leaving subnet also inspected.

### Flow

```
Workload
   ↓
Subnet Boundary
   ↓
ACL Engine
   ↓
Internet / VPN / TGW
```

This allows:
- outbound restriction
- malware control
- exfiltration prevention

---

## 🎯 ACL Use Case — Deny Unwanted CIDRs

### Example

Block known malicious network:

```
203.0.113.0/24
```

**ACL rule:**
```
Deny inbound from 203.0.113.0/24
```

Traffic blocked before reaching workloads.

---

## 🏗️ ACL Use Case — Isolate Subnet Tiers

### Example Architecture

```
Management Subnet
Application Subnet
Database Subnet
```

**Database ACL:**
```
Allow DB traffic only from app subnet
Deny everything else
```

**Result:**
> database isolated

---

## 🚫 ACL Use Case — Block Internet Exposure

### Example

Database subnet should never receive public traffic

**ACL:**
```
Deny all inbound internet traffic
```

Even accidental SG mistakes later cannot expose database easily.

---

## 📏 Why ACLs Are Called Coarse-Grained Firewalls

ACLs operate broadly.

They filter:
> **entire subnet traffic**

not:
> **individual application logic**

This makes them:
> **infrastructure-level security**

### Example ACL Goals

- block internet
- isolate subnet tiers
- restrict broad communication paths

Detailed workload-level security handled separately.

---

## 🏗️ IBM Internal ACL Enforcement Architecture

IBM internally distributes ACL rules across:
- SDN systems
- virtual routing enforcement
- subnet gateways
- packet processing engines

### Conceptually

```
Terraform
   ↓
IBM API
   ↓
Control Plane
   ↓
Distributed ACL Enforcement
   ↓
Packet Filtering Active
```

ACL enforcement is:
- distributed
- scalable
- regional

This avoids:
> **centralized bottlenecks**

---

## 🛡️ Why ACLs Improve Security

### Without ACLs

- unwanted traffic enters subnet
- workloads exposed unnecessarily
- attack surface larger

### ACLs Reduce

- exposure radius
- subnet visibility
- lateral movement opportunities

This is foundational for:
- zero trust networking
- segmentation architecture
- compliance environments

---

## 📊 ACL vs Security Group

This distinction is critical.

| Feature | ACL | Security Group |
|---------|-----|----------------|
| Scope | Subnet | Workload |
| Stateful | No | Yes |
| Rule Order | Important | Less critical |
| Connection Tracking | No | Yes |
| Broad Segmentation | Yes | Limited |
| Workload Specific | No | Yes |

**ACL:**
> infrastructure perimeter security

**Security Group:**
> workload-level security

Both used together in enterprise environments.

---

## 🏢 Enterprise Security Layering

Typical production design:

**ACL:**
```
Block internet
```

**Security Group:**
```
Allow app traffic only
```

**Application:**
```
Authentication Layer
```

Multiple security layers reduce risk.

This is called:
> **defense in depth**

---

## 🏦 Real Enterprise Example

Suppose banking environment.

### Architecture

```
Internet
   ↓
Load Balancer Subnet
   ↓
Application Subnet
   ↓
Database Subnet
```

**Database ACL:**
```
Allow DB traffic only from app subnet
Deny everything else
```

Even if attacker compromises frontend:
> **direct database access still heavily restricted**

---

## 🔧 Terraform Variables

Relevant variables:

```hcl
network_acls
acl_rules
```

These define:
- subnet security boundaries
- traffic filtering behavior
- infrastructure segmentation

Terraform converts them into:
> **actual distributed ACL enforcement inside IBM Cloud networking fabric**

---

## 🧠 Complete Beginner Mental Model

Think of subnet like:
> **airport terminal**

ACL acts like:
> **airport security checkpoint**

Every person entering:
- inspected
- evaluated
- allowed or denied

### Mapping

| Real World | IBM Cloud |
|------------|-----------|
| Airport Terminal | Subnet |
| Security Checkpoint | ACL |
| Passenger | Packet |
| Security Rules | ACL Rules |
| Allowed Entry | Permit |
| Rejected Passenger | Drop |

**ACL protects:**
> **the entire terminal perimeter**

before passengers reach:
> **individual gates (workloads)**

---

[← Previous: Network ACL Architecture](./network-acl-architecture.md) | [Index](./README.md) | [Next: Security Group Service Internals →](./security-group-service-internals.md)

---

## 🔧 IBM Cloud Internal ACL Rules

IBM Cloud infrastructure requires certain internal communication paths to function correctly. The VPC module can automatically add these required rules to your ACLs.

### What Are IBM Cloud Internal Rules

> **Pre-configured ACL rules that allow essential IBM Cloud service communication**

These rules enable:
- IBM Cloud service endpoints
- Infrastructure management traffic
- Health checking systems
- Monitoring and logging services
- Platform operations

---

## 🎯 Why Internal Rules Are Needed

### Service Connectivity Requirements

IBM Cloud workloads need to communicate with:

| Service | Purpose |
|---------|---------|
| DNS Resolvers | Name resolution |
| NTP Servers | Time synchronization |
| Package Repositories | Software updates |
| IBM Cloud Services | Platform APIs |
| Health Checkers | Load balancer health checks |
| Monitoring Agents | Telemetry collection |

### Without Internal Rules

**Problems:**
- ❌ DNS resolution fails
- ❌ Time synchronization breaks
- ❌ Package updates fail
- ❌ Health checks timeout
- ❌ Monitoring gaps

---

## 🔧 Variables: add_ibm_cloud_internal_rules

### Variable Configuration

```hcl
add_ibm_cloud_internal_rules = true
```

### What This Does

When enabled, the module automatically adds ACL rules for:

**1. IBM Cloud DNS (161.26.0.0/16)**
```
Allow DNS queries to IBM resolvers
```

**2. IBM Cloud Services (166.8.0.0/14)**
```
Allow access to IBM Cloud service endpoints
```

**3. Load Balancer Health Checks**
```
Allow health check traffic
```

**4. NTP Services**
```
Allow time synchronization
```

---

## 🔧 Variables: prepend_ibm_rules

### Variable Configuration

```hcl
prepend_ibm_rules = true
```

### What This Does

Controls rule ordering:

**When true:**
```
IBM internal rules added at the beginning
```

**When false:**
```
IBM internal rules added at the end
```

### Why Rule Order Matters

Remember: ACLs evaluate rules sequentially.

**Example Problem:**

```
Rule 1: Deny all inbound
Rule 2: Allow IBM Cloud services (never evaluated!)
```

**Solution with prepend_ibm_rules = true:**

```
Rule 1: Allow IBM Cloud services
Rule 2: Deny all inbound
```

---

## 📊 IBM Cloud Internal CIDR Ranges

### Key IBM Cloud Ranges

| CIDR | Purpose |
|------|---------|
| 161.26.0.0/16 | IBM Cloud private services |
| 166.8.0.0/14 | IBM Cloud service endpoints |
| 10.0.0.0/8 | Private network space |

### Example Internal Rules

```hcl
# DNS Resolution
{
  name        = "allow-ibm-dns"
  action      = "allow"
  direction   = "outbound"
  destination = "161.26.0.0/16"
  protocol    = "udp"
  port_min    = 53
  port_max    = 53
}

# IBM Cloud Services
{
  name        = "allow-ibm-services"
  action      = "allow"
  direction   = "outbound"
  destination = "166.8.0.0/14"
  protocol    = "tcp"
}
```

---

## 🏗️ Service Connectivity Implications

### What Services Depend On These Rules

**1. Virtual Server Instances (VSI)**
```
- Package installation
- OS updates
- Time sync
```

**2. Kubernetes/OpenShift**
```
- Image pulls
- Service discovery
- Cluster operations
```

**3. Load Balancers**
```
- Health checks
- Backend monitoring
```

**4. Databases**
```
- Backup operations
- Monitoring
```

**5. Monitoring/Logging**
```
- Metrics collection
- Log forwarding
```

---

## ⚠️ When to Use Internal Rules

### Always Enable When

**1. Production Workloads**
```
Services must function reliably
```

**2. Kubernetes/OpenShift Clusters**
```
Cluster operations require IBM services
```

**3. Load Balancer Deployments**
```
Health checks must work
```

**4. Managed Services**
```
Databases, monitoring, etc.
```

### Consider Disabling When

**1. Highly Restricted Environments**
```
Custom security requirements
Manual rule management preferred
```

**2. Air-Gapped Scenarios**
```
No IBM Cloud service connectivity needed
```

**Note:** Disabling is rare and requires careful planning.

---

## 🔒 Security Considerations

### Internal Rules Are Safe

**Why:**
- ✅ IBM-managed infrastructure
- ✅ Private network ranges
- ✅ Essential services only
- ✅ No public internet exposure

### Defense in Depth

Internal rules work with other security layers:

```
Internet Traffic
    ↓
Public Gateway (if needed)
    ↓
ACL (with internal rules)
    ↓
Security Group
    ↓
Workload
```

---

## 🎯 Complete ACL Configuration Example

### Recommended Configuration

```hcl
# Enable IBM Cloud internal rules
add_ibm_cloud_internal_rules = true

# Prepend rules for correct ordering
prepend_ibm_rules = true

# Clean default ACL
clean_default_sg_acl = true

# Custom ACL rules
network_acls = [
  {
    name = "app-acl"
    rules = [
      # Application-specific rules
      {
        name        = "allow-https"
        action      = "allow"
        direction   = "inbound"
        source      = "0.0.0.0/0"
        protocol    = "tcp"
        port_min    = 443
        port_max    = 443
      },
      # Deny all other inbound
      {
        name      = "deny-all-inbound"
        action    = "deny"
        direction = "inbound"
        source    = "0.0.0.0/0"
      }
    ]
  }
]
```

### Resulting Rule Order

```
1. Allow IBM Cloud DNS (prepended)
2. Allow IBM Cloud services (prepended)
3. Allow HTTPS (custom rule)
4. Deny all inbound (custom rule)
```

---

## 🏢 Enterprise Pattern

### Multi-Tier Application

```
Management Subnet ACL:
├── IBM internal rules (prepended)
├── Allow SSH from bastion
└── Deny all other

Application Subnet ACL:
├── IBM internal rules (prepended)
├── Allow HTTPS from internet
├── Allow app traffic from management
└── Deny all other

Database Subnet ACL:
├── IBM internal rules (prepended)
├── Allow DB traffic from app subnet
└── Deny all other
```

### Benefits

- ✅ Services function correctly
- ✅ Security maintained
- ✅ Consistent pattern
- ✅ Easy troubleshooting

---

## 🚨 Common Mistakes

### 1. Forgetting Internal Rules

**Problem:**
```
add_ibm_cloud_internal_rules = false
```

**Impact:**
```
- DNS fails
- Health checks timeout
- Services break
```

**Solution:**
```hcl
add_ibm_cloud_internal_rules = true
```

### 2. Wrong Rule Order

**Problem:**
```
prepend_ibm_rules = false
Deny-all rule comes first
```

**Impact:**
```
IBM services blocked
```

**Solution:**
```hcl
prepend_ibm_rules = true
```

### 3. Blocking IBM Ranges Manually

**Problem:**
```
Custom rule denies 161.26.0.0/16
```

**Impact:**
```
Platform services fail
```

**Solution:**
```
Don't block IBM internal ranges
```

---

## 💡 Best Practices

### 1. Always Enable Internal Rules

```hcl
add_ibm_cloud_internal_rules = true
```

Unless you have specific reasons not to.

### 2. Prepend for Safety

```hcl
prepend_ibm_rules = true
```

Ensures internal rules evaluated first.

### 3. Document Custom Rules

```
Clearly document why custom rules exist
```

### 4. Test Thoroughly

```
Verify services work after ACL changes
```

### 5. Monitor Connectivity

```
Alert on service connectivity issues
```

---

## 🔍 Troubleshooting

### DNS Not Working

**Check:**
```
Are IBM internal rules enabled?
Is 161.26.0.0/16 allowed outbound?
```

### Health Checks Failing

**Check:**
```
Are internal rules prepended?
Is health check traffic allowed?
```

### Package Updates Failing

**Check:**
```
Is 166.8.0.0/14 allowed outbound?
Are IBM service endpoints reachable?
```

---

## 🧠 Mental Model

Think of IBM internal rules like:
> **utility connections to a building**

| Real World | IBM Cloud |
|------------|-----------|
| Building | Subnet |
| Water Supply | DNS Service |
| Electricity | IBM Cloud Services |
| Gas Line | Monitoring/Logging |
| Utility Rules | IBM Internal ACL Rules |

**Without utility connections:**
```
Building cannot function
```

**Without IBM internal rules:**
```
Workloads cannot function properly
```

---

## 🔑 Key Takeaways

### 1. Internal Rules Are Essential

Required for IBM Cloud services to function.

### 2. Enable by Default

Use `add_ibm_cloud_internal_rules = true`.

### 3. Prepend for Correct Order

Use `prepend_ibm_rules = true`.

### 4. Don't Block IBM Ranges

Avoid denying 161.26.0.0/16 or 166.8.0.0/14.

### 5. Test Service Connectivity

Verify DNS, health checks, and monitoring work.

---

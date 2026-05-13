# 🔒 Security Group Service Internals — Deep Beginner Explanation

[← Previous: Network ACLs](./network-acl-architecture.md) | [Index](./index.md) | [Next: Route Table Service →](./route-table-service.md)

---

## 📋 Overview

After understanding ACLs, the next major security concept is:
> **Security Groups**

This is one of the most important concepts in cloud networking.

Beginners often confuse:
- ACLs
- Security Groups

because both filter traffic.

But internally they operate very differently.

### Key Distinction

**ACLs protect:**
> **subnet boundaries**

**Security Groups protect:**
> **individual workloads**

This distinction is critical.

---

## 🎯 Why Security Groups Exist

Imagine an application subnet:

```
10.0.2.0/24
```

### Inside Subnet

- Web Server A
- Web Server B
- API Server
- Monitoring Agent

Suppose ACL allows:
```
HTTPS traffic into subnet
```

**Without Security Groups:**
> all workloads inside subnet could potentially receive traffic

This is dangerous.

### Example Problems

- monitoring server accidentally exposed
- SSH reachable publicly
- database reachable internally

Security Groups solve this problem by providing:
> **workload-level firewalling**

Each workload can now define:
> **exactly what traffic allowed**

---

## 🛡️ What Security Groups Actually Are

IBM Security Groups are:
> **virtual stateful firewalls**

They operate:
> **at network interface level**

### Attached Directly To

- VSI NICs
- load balancers
- OpenShift workers
- VPEs
- VPN interfaces

This means filtering happens:
> **very close to workload itself**

### 📊 Security Group Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         VPC Subnet                          │
│                       10.0.2.0/24                           │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Web VSI    │    │   App VSI    │    │    DB VSI    │ │
│  │              │    │              │    │              │ │
│  │  ┌────────┐  │    │  ┌────────┐  │    │  ┌────────┐  │ │
│  │  │  eth0  │  │    │  │  eth0  │  │    │  │  eth0  │  │ │
│  │  └───┬────┘  │    │  └───┬────┘  │    │  └───┬────┘  │ │
│  └──────┼───────┘    └──────┼───────┘    └──────┼───────┘ │
│         │                   │                   │          │
│    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐    │
│    │ Web-SG  │         │ App-SG  │         │  DB-SG  │    │
│    │ 🔒      │         │ 🔒      │         │ 🔒      │    │
│    │ Port 443│         │ Port    │         │ Port    │    │
│    │ Inbound │         │ 8080    │         │ 5432    │    │
│    └─────────┘         └─────────┘         └─────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

> **Legend:** Security Groups attach directly to network interfaces (NICs), providing workload-level protection. Each VSI can have different security policies even within the same subnet.

---

## ⚠️ Important Beginner Understanding

**Security Groups are NOT:**
- hardware firewalls
- firewall appliances
- subnet filters

**They are:**
> **software-defined workload firewalls**

IBM internally implements them using:
- distributed networking enforcement
- SDN policy engines
- connection tracking systems

---

## 🔀 Where Security Groups Exist in Traffic Flow

### Traffic Hierarchy

```
Internet / VPN / TGW
        ↓
VPC Routing
        ↓
Subnet ACL
        ↓
Security Group
        ↓
Workload
```

**Important:**
> traffic already passed:
- routing
- subnet boundary
- ACL filtering

Security Group becomes:
> **final workload protection layer**

---

## 🔧 What Terraform Actually Creates

### Example

```hcl
resource "ibm_is_security_group" "web_sg" {
  name = "web-sg"
}
```

Terraform creates:
> **security group object**

Then rules added:
- allow HTTPS inbound
- allow SSH from bastion

### IBM Internally

- registers SG metadata
- distributes rules
- associates SG with NICs
- updates connection tracking systems

---

## 🔗 Security Groups Attach to Network Interfaces

This is extremely important.

**Security Groups do NOT attach directly to:**
- subnet
- VPC

**They attach to:**
> **NICs (network interfaces)**

### Example

```
VSI
 ↓
eth0
 ↓
Security Group Attached
```

This allows:
> **different workloads inside same subnet to have different firewall policies**

---

## 🎯 Example

### Same Subnet

```
10.0.2.0/24
```

### Workloads

- Web Server
- Database Server
- Monitoring Server

### Security Groups

**Web SG:**
```
Allow HTTPS
```

**Database SG:**
```
Allow DB traffic only
```

**Monitoring SG:**
```
Allow telemetry traffic only
```

Even though same subnet:
> **workload protections differ**

This is impossible using only ACLs.

---

## 📥 Ingress and Egress Rules

Security Groups have:
- **ingress rules**
- **egress rules**

### Ingress Rules

Control:
> **inbound traffic to workload**

**Example:**
```
Allow:
TCP 443 inbound
```

**Meaning:**
> clients can access HTTPS service

### Egress Rules

Control:
> **outbound traffic from workload**

**Example:**
```
Allow:
Outbound HTTPS
```

**Meaning:**
> server can access internet APIs

---

## ⚡ Stateful Firewalling — Most Important Concept

Security Groups are:
> **stateful**

This is the biggest difference from ACLs.

**Stateful means:**
> Security Group remembers active connections

---

## 🔄 Example Connection Flow

Suppose browser opens HTTPS connection.

### Request

```
Client
 ↓
Server TCP 443
```

Security Group allows inbound HTTPS.

### Now Server Responds

```
Server
 ↓
Response Traffic
 ↓
Client
```

**Security Group automatically allows response traffic.**

### Why?

Because:
> **connection already tracked**

### 📊 Rule Evaluation Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│           Stateful Connection Tracking Flow                 │
└─────────────────────────────────────────────────────────────┘

Step 1: Inbound Request
┌──────────┐
│  Client  │ ──────────────────────────────────────┐
│ (Random) │  SYN: src=52000, dst=443              │
└──────────┘                                        │
                                                    ▼
                                          ┌──────────────────┐
                                          │  Security Group  │
                                          │   Rule Check     │
                                          └────────┬─────────┘
                                                   │
                                          ┌────────▼─────────┐
                                          │ Allow TCP 443?   │
                                          │   ✓ YES          │
                                          └────────┬─────────┘
                                                   │
                                          ┌────────▼─────────┐
                                          │ Create State     │
                                          │ Entry in Table   │
                                          │ src:52000→443    │
                                          └────────┬─────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │   Web Server     │
                                          │   Port 443       │
                                          └──────────────────┘

Step 2: Outbound Response (Automatic)
┌──────────────────┐
│   Web Server     │ ──────────────────────────────────────┐
│   Port 443       │  SYN-ACK: src=443, dst=52000          │
└──────────────────┘                                        │
                                                            ▼
                                                  ┌──────────────────┐
                                                  │  Security Group  │
                                                  │   State Check    │
                                                  └────────┬─────────┘
                                                           │
                                                  ┌────────▼─────────┐
                                                  │ Connection in    │
                                                  │ State Table?     │
                                                  │   ✓ YES          │
                                                  └────────┬─────────┘
                                                           │
                                                  ┌────────▼─────────┐
                                                  │ Auto-Allow       │
                                                  │ Response         │
                                                  │ (No Rule Check)  │
                                                  └────────┬─────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │     Client       │
                                                  │   Receives       │
                                                  └──────────────────┘
```

> **Key Insight:** Stateful tracking means you only need to define inbound rules. Return traffic is automatically allowed for established connections.

---

## 📊 State Table

IBM internally maintains:
> **connection tracking table**

This table records:
- source IP
- destination IP
- ports
- protocol
- session state

### Conceptually

```
Connection Table:
Client ↔ Server HTTPS Session
```

Return traffic checked against:
> **state table**

If valid session exists:
> **automatically permitted**

---

## 🚀 Why Stateful Firewalls Matter

Without stateful behavior:
> you would need separate return rules everywhere

This becomes operationally complex.

Stateful filtering simplifies:
- application networking
- dynamic communication
- workload security

---

## 📊 ACL vs Security Group Stateful Difference

### ACL Example

**Inbound:**
```
Allow TCP 443
```

**Outbound:**
```
Must explicitly allow return traffic
```

### Security Group

**Inbound:**
```
Allow TCP 443
```

**Return traffic:**
```
Automatically allowed
```

**Much simpler.**

---

## 🔍 Packet Processing Internals

### 📊 Example Security Group Rule Tables

#### Web Tier Security Group

| Direction | Protocol | Port Range | Source/Destination | Purpose |
|-----------|----------|------------|-------------------|---------|
| Inbound | TCP | 443 | 0.0.0.0/0 | HTTPS from internet |
| Inbound | TCP | 80 | 0.0.0.0/0 | HTTP from internet (redirect to HTTPS) |
| Outbound | TCP | 8080 | app-sg | Forward to app tier |
| Outbound | TCP | 443 | 0.0.0.0/0 | External API calls |
| Outbound | UDP | 53 | 0.0.0.0/0 | DNS resolution |

#### App Tier Security Group

| Direction | Protocol | Port Range | Source/Destination | Purpose |
|-----------|----------|------------|-------------------|---------|
| Inbound | TCP | 8080 | web-sg | Requests from web tier |
| Outbound | TCP | 5432 | db-sg | Database queries |
| Outbound | TCP | 443 | 0.0.0.0/0 | External API calls |
| Outbound | UDP | 53 | 0.0.0.0/0 | DNS resolution |

#### Database Tier Security Group

| Direction | Protocol | Port Range | Source/Destination | Purpose |
|-----------|----------|------------|-------------------|---------|
| Inbound | TCP | 5432 | app-sg | PostgreSQL from app tier only |
| Outbound | TCP | 443 | 0.0.0.0/0 | Backup to COS (minimal) |
| Outbound | UDP | 53 | 0.0.0.0/0 | DNS resolution |

> **Security Note:** Notice how each tier only accepts traffic from the previous tier, implementing the principle of least privilege.


### Traffic Flow

```
Packet Arrives
      ↓
Security Group Rule Match
      ↓
Connection State Check
      ↓
Allow or Deny
```

IBM internally evaluates:
- rule permissions
- active session state

before forwarding traffic to workload.

---

## 🔄 Dynamic Nature of Security Groups

Security Groups are considered:
> **dynamic firewalls**

### Why?

Because they can reference:
- workloads
- SG identities
- changing infrastructure

### Example

```
Allow traffic from SG-App
```

instead of hardcoding:
```
IP addresses
```

If new server added:
> **automatically inherits access**

This is extremely important in:
- Kubernetes
- autoscaling
- cloud-native systems

---

## 🔐 Example — SSH from Bastion Only

Suppose:

**Bastion Server:**
```
10.0.1.5
```

**Application server SG:**
```
Allow SSH only from bastion SG
```

### Now

- admins can SSH through bastion
- internet SSH blocked

This is common enterprise design.

---

## 🌐 Example — HTTPS Web Server

### Security Group

```
Allow TCP 443 from internet
```

### Result

- web application accessible
- all other ports blocked

This follows:
> **least privilege principle**

---

## 🔗 Security Group Attached Resources

Security Groups commonly attach to:

| Resource | Purpose |
|----------|---------|
| VSI NIC | Protect servers |
| Load Balancer | Protect frontend traffic |
| OpenShift Workers | Protect Kubernetes nodes |
| VPE | Protect private endpoints |
| VPN Gateway | Restrict tunnel traffic |

> **For VSI security group configuration:** See [VSI Security Groups](../vsi/vsi-security-groups.md)

---

## ☸️ OpenShift Security Groups

Kubernetes clusters heavily depend on Security Groups.

### Workers Require

- API communication
- pod traffic
- ingress traffic
- monitoring traffic

Security Groups dynamically control:
> **allowed cluster communication**

This becomes extremely important at scale.

> **For cluster security group configuration:** See [Cluster Security Groups and Network Isolation](../cluster/base-ocp-vpc/09-security-groups-network-isolation.md)

---

## 🏗️ IBM Internal Enforcement

IBM internally distributes SG policies through:
- SDN controllers
- virtual NIC enforcement
- connection tracking systems

### Conceptually

```
Terraform
   ↓
IBM API
   ↓
Control Plane
   ↓
Distributed Security Enforcement
   ↓
NIC-Level Filtering
```

Enforcement occurs:
> **close to workload**

This improves:
- scalability
- security
- traffic isolation

---

## 📊 Why Security Groups Are More Flexible Than ACLs

### ACLs

- broad subnet controls

### Security Groups

- workload-specific controls

---

### ACLs

- static infrastructure segmentation

### Security Groups

- dynamic application protection

---

### ACLs

- coarse-grained

### Security Groups

- fine-grained

---

## 🏢 Enterprise Layered Security

Production architecture commonly uses both.

### Example

**ACL:**
```
Block internet traffic broadly
```

**Security Group:**
```
Allow HTTPS only to web server
```

**Application:**
```
Require authentication
```

### Multiple Layers Reduce

- misconfiguration risk
- attack surface
- lateral movement

---

## 🏦 Real Enterprise Example

### Banking Application

```
Internet
 ↓
Load Balancer
 ↓
Web Server
 ↓
Application Server
 ↓
Database
```

### Security Groups

**Web SG:**
```
Allow HTTPS
```

**App SG:**
```
Allow traffic only from web SG
```

**DB SG:**
```
Allow DB port only from app SG
```

This creates:
> **tightly controlled communication paths**

Even if one server compromised:
> **attacker movement limited**

---

## 🔗 Security Group Referencing

Advanced feature:

Security Groups can reference:
> **other SGs**

### Example

```
Allow traffic from SG-Web
```

instead of:
```
Allow 10.0.2.0/24
```

### Benefits

- dynamic infrastructure support
- autoscaling compatibility
- Kubernetes compatibility

Very important in cloud-native environments.

---

## 🔧 Terraform Variables

Relevant variables:

```hcl
security_groups
security_group_rules
```

Terraform converts these into:
- distributed firewall policies
- connection tracking rules
- NIC-level security enforcement

inside IBM Cloud networking infrastructure.

---

## 🧠 Complete Beginner Mental Model

Think of subnet like:
> **apartment building**

### ACL

> **building entrance security gate**

### Security Group

> **apartment door lock**

### Mapping

| Real World | IBM Cloud |
|------------|-----------|
| Building | Subnet |
| Main Gate | ACL |
| Apartment Door Lock | Security Group |
| Resident | Workload |
| Visitor | Packet |

**ACL protects:**
> **entire building perimeter**

**Security Group protects:**
> **individual apartments**

This layered security architecture is fundamental to modern cloud networking.

---

[← Previous: Network ACLs](./network-acl-architecture.md) | [Index](./index.md) | [Next: Route Table Service →](./route-table-service.md)

---

## 🧹 Default Security Group Cleanup

When IBM Cloud creates a VPC, it automatically creates a default security group. This default security group has permissive rules that may not align with enterprise security requirements.

### What Is Default Security Group

> **Automatically created security group with default allow rules**

### Default Rules

The default security group typically includes:

```
Inbound:
- Allow all traffic from same security group

Outbound:
- Allow all traffic
```

### Security Concerns

**Problems with defaults:**
- ❌ Too permissive for production
- ❌ May violate security policies
- ❌ Not aligned with zero-trust principles
- ❌ Compliance issues

---

## 🔧 Default Security Group Cleanup

### Variable: clean_default_sg_acl

```hcl
clean_default_sg_acl = true
```

### What This Does

When enabled, the module:
1. Identifies default security group
2. Removes permissive default rules
3. Applies restrictive baseline rules
4. Ensures security hardening

### Terraform Resource Impact

```hcl
# Default SG rules are removed/replaced
resource "ibm_is_security_group_rule" "default_cleanup" {
  group     = data.ibm_is_security_group.default.id
  direction = "inbound"
  # Restrictive rules applied
}
```

---

## 🛡️ Security Hardening Best Practices

### 1. Always Clean Default Resources

**Why:**
```
Default configurations are rarely production-ready
```

**Best Practice:**
```hcl
clean_default_sg_acl = true
```

### 2. Apply Least Privilege

**Instead of:**
```
Allow all traffic
```

**Use:**
```
Allow only required traffic
```

### 3. Explicit Security Groups

**Best Practice:**
```
Create explicit security groups for each workload type
```

**Example:**
```
- web-sg: Allow HTTPS only
- app-sg: Allow app traffic from web-sg
- db-sg: Allow DB traffic from app-sg
```

### 4. Never Use Default SG for Workloads

**Problem:**
```
Workloads attached to default SG
```

**Solution:**
```
Always create and use explicit security groups
```

---

## ⚠️ When to Clean Default Resources

### Always Clean When

**1. Production Environments**
```

### 🔒 Multi-Tier Security Pattern Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    3-Tier Architecture with Security Groups          │
└─────────────────────────────────────────────────────────────────────┘

                              Internet
                                 │
                                 │ HTTPS (443)
                                 ▼
                    ┌────────────────────────┐
                    │   Load Balancer (ALB)  │
                    │   Public Subnet        │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼───────────┐
                    │      Web Tier SG       │
                    │  🔒 Port 443 Inbound   │
                    └────────────┬───────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
   ┌─────────┐            ┌─────────┐            ┌─────────┐
   │ Web VSI │            │ Web VSI │            │ Web VSI │
   │  Zone 1 │            │  Zone 2 │            │  Zone 3 │
   └────┬────┘            └────┬────┘            └────┬────┘
        │                      │                      │
        │         Port 8080    │                      │
        └──────────────────────┼──────────────────────┘
                               │
                  ┌────────────▼───────────┐
                  │      App Tier SG       │
                  │  🔒 Port 8080 from     │
                  │     Web-SG only        │
                  └────────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
   ┌─────────┐            ┌─────────┐            ┌─────────┐
   │ App VSI │            │ App VSI │            │ App VSI │
   │  Zone 1 │            │  Zone 2 │            │  Zone 3 │
   └────┬────┘            └────┬────┘            └────┬────┘
        │                      │                      │
        │         Port 5432    │                      │
        └──────────────────────┼──────────────────────┘
                               │
                  ┌────────────▼───────────┐
                  │       DB Tier SG       │
                  │  🔒 Port 5432 from     │
                  │     App-SG only        │
                  └────────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
   ┌─────────┐            ┌─────────┐            ┌─────────┐
   │  DB VSI │            │  DB VSI │            │  DB VSI │
   │  Zone 1 │            │  Zone 2 │            │  Zone 3 │
   │ Primary │            │ Standby │            │ Standby │
   └─────────┘            └─────────┘            └─────────┘

Traffic Flow Rules:
─────────────────
Internet → Web Tier:     ✓ Allowed (Port 443)
Web Tier → App Tier:     ✓ Allowed (Port 8080, Web-SG only)
App Tier → DB Tier:      ✓ Allowed (Port 5432, App-SG only)
Internet → App Tier:     ✗ Blocked (No direct access)
Internet → DB Tier:      ✗ Blocked (No direct access)
Web Tier → DB Tier:      ✗ Blocked (Must go through App Tier)
```

> **Security Benefits:**
> - **Defense in Depth:** Multiple security layers protect critical data
> - **Least Privilege:** Each tier only accepts traffic from authorized sources
> - **Blast Radius Containment:** Compromise of one tier doesn't expose others
> - **Compliance:** Meets regulatory requirements for data protection

Security requirements are strict
```

**2. Compliance Workloads**
```
FSCloud, FedRAMP, HIPAA, PCI-DSS
```

**3. Zero-Trust Architecture**
```
Explicit deny by default
```

**4. Enterprise Deployments**
```
Standardized security baselines
```

### Consider Keeping When

**1. Development/Testing**
```
Rapid prototyping environments
```

**2. Proof of Concept**
```
Temporary non-production workloads
```

**Note:** Even in these cases, cleaning is recommended.

---

## 🔒 Security Hardening Strategy

### Complete Approach

```
1. Clean default security group
2. Clean default network ACL
3. Create explicit security groups
4. Apply least privilege rules
5. Enable flow logs
6. Monitor security events
```

### Example Hardened Configuration

```hcl
# Clean defaults
clean_default_sg_acl = true

# Explicit security groups
security_groups = [
  {
    name = "web-sg"
    rules = [
      {
        direction = "inbound"
        protocol  = "tcp"
        port_min  = 443
        port_max  = 443
      }
    ]
  },
  {
    name = "app-sg"
    rules = [
      {
        direction = "inbound"
        source_sg = "web-sg"
        protocol  = "tcp"
        port_min  = 8080
        port_max  = 8080
      }
    ]
  }
]
```

---

## 🏢 Enterprise Security Pattern

### Layered Security

```
Internet
    ↓
Load Balancer (Public)
    ↓
Web Tier (web-sg)
    ↓
App Tier (app-sg)
    ↓
Database Tier (db-sg)
```

### Security Group Rules

**Web SG:**
```
Inbound: HTTPS from internet
Outbound: App tier only
```

**App SG:**
```
Inbound: App traffic from web-sg
Outbound: Database tier only
```

**DB SG:**
```
Inbound: DB traffic from app-sg
Outbound: None (or minimal)
```

**Default SG:**
```
Cleaned - no permissive rules
Not used by any workload
```

---

## 🚨 Common Mistakes

### 1. Forgetting to Clean Defaults

**Problem:**
```
Default SG remains permissive
```

**Impact:**
```
Security vulnerability
```

**Solution:**
```hcl
clean_default_sg_acl = true
```

### 2. Using Default SG for Workloads

**Problem:**
```
VSIs attached to default SG
```

**Impact:**
```
Unpredictable security behavior
```

**Solution:**
```
Always use explicit security groups
```

### 3. Cleaning After Workload Deployment

**Problem:**
```
Workloads already using default SG
```

**Impact:**
```
Service disruption when cleaning
```

**Solution:**
```
Clean defaults during VPC creation
```

---

## 💡 Best Practices Summary

### 1. Clean Early

```
Clean default resources during VPC creation
```

### 2. Document Security Baseline

```
Maintain security group standards
```

### 3. Audit Regularly

```
Verify no workloads use default SG
```

### 4. Automate Compliance

```
Use Terraform to enforce standards
```

### 5. Monitor Changes

```
Alert on default SG modifications
```

---

## 🔑 Why Default Cleanup Matters

### Security Benefits

- ✅ Reduces attack surface
- ✅ Enforces least privilege
- ✅ Improves compliance posture
- ✅ Prevents accidental exposure
- ✅ Aligns with zero-trust

### Operational Benefits

- ✅ Clear security boundaries
- ✅ Predictable behavior
- ✅ Easier troubleshooting
- ✅ Better documentation
- ✅ Standardized deployments

---

## 🧠 Mental Model

Think of default security group like:
> **master key that opens all doors**

**Problem:**
```
Too much access by default
```

**Solution:**
```
Remove master key
Create specific keys for each door
```

**In Cloud Terms:**
```
Clean default SG
Create explicit SGs per workload
```

---

## 🔑 Key Takeaways

### 1. Default SG Is Too Permissive

Not suitable for production workloads.

### 2. Always Clean Defaults

Use `clean_default_sg_acl = true`.

### 3. Create Explicit Security Groups

Never rely on default security group.

### 4. Apply Least Privilege

Only allow required traffic.

### 5. Clean During VPC Creation

Avoid disruption by cleaning early.

---

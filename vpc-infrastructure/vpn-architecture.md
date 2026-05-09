# 🔐 VPN Architecture — Deep Beginner Explanation

[← Previous: Route Table Service](./09-route-table-service.md) | [Index](./README.md) | [Next: Hub-Spoke DNS Architecture →](./10a-hub-spoke-dns-architecture.md)

---

> ⚠️ **DEPRECATION NOTICE**
>
> **VPN Gateway functionality in the terraform-ibm-landing-zone-vpc module is being deprecated.**
>
> **Recommended Alternatives:**
> - **Transit Gateway**: For VPC-to-VPC connectivity and multi-cloud integration
> - **Direct Link**: For dedicated, high-performance on-premises connectivity
> - **Client VPN**: For remote user access (separate service)
>
> **Migration Guidance:**
> - Existing VPN Gateways will continue to function
> - New deployments should use Transit Gateway or Direct Link
> - Plan migration during maintenance windows
> - Consult IBM Cloud documentation for detailed migration paths
>
> **Why This Change:**
> - Transit Gateway provides better scalability and performance
> - Direct Link offers more reliable enterprise connectivity
> - Simplified architecture with fewer components
> - Better alignment with modern cloud networking patterns

---

## 📋 Overview

One of the most important enterprise cloud concepts is:
> **hybrid connectivity**

**Hybrid connectivity means:**
> connecting cloud infrastructure with existing enterprise infrastructure

Most large companies do NOT move everything to cloud immediately.

### They Still Have

- physical datacenters
- office networks
- legacy systems
- internal applications
- databases
- firewalls
- enterprise routers

inside their own buildings.

IBM Cloud VPN architecture allows these private enterprise networks to communicate securely with cloud VPC networks.

This creates:
> **hybrid cloud architecture**

---

## 🎯 What Problem VPN Solves

Imagine company infrastructure:

**On-Prem Datacenter:**
```
192.168.0.0/16
```

**Cloud infrastructure:**
```
IBM Cloud VPC
10.0.0.0/16
```

### Suppose

- cloud application needs on-prem database
- employees need access to cloud workloads
- enterprise SAP system communicates with cloud APIs

**Without VPN:**
> traffic must traverse public internet openly

This is insecure.

VPN solves this by creating:
> **encrypted private communication tunnel**

between:
- enterprise network
- IBM Cloud VPC

---

## 🔒 What VPN Actually Is

VPN means:
> **Virtual Private Network**

It creates:
> **encrypted logical tunnel**

across:
> **public internet**

### Important Beginner Understanding

**VPN does NOT create private physical cable.**

Traffic still travels across internet infrastructure.

But traffic becomes:
- encrypted
- authenticated
- protected

So outsiders cannot read packets.

---

## 📮 Real World Analogy

Imagine:
> sending confidential documents through public postal service

**Without protection:**
> anyone intercepting package can read contents

VPN acts like:
> **armored encrypted container**

Even though package travels publicly:
> **contents protected**

Networking VPN works similarly.

---

## 🏗️ IBM Cloud VPN Architecture

IBM Cloud VPN architecture usually involves:

```
On-Prem Router
      ↓
Internet
      ↓
IBM VPN Gateway
      ↓
IBM Cloud VPC
```

IBM VPN Gateway becomes:
> **secure entry point into VPC**

It terminates:
> **encrypted VPN tunnels**

---

## 🔧 What Terraform Creates

Relevant resources:

```hcl
ibm_is_vpn_gateway
```

Terraform creates:
> **VPN Gateway object**

Then:
> **tunnel connections**

### Terraform Variables

```hcl
vpn_gateways
vpn_connections
peer IPs
pre-shared keys
```

Terraform converts these into:
- encrypted tunnel infrastructure
- routing associations
- tunnel negotiation parameters

---

## 🚪 What Is VPN Gateway

VPN Gateway is:
> **IBM-managed VPN endpoint**

It acts like:
> **secure tunnel termination device**

### Purpose

- receive encrypted traffic
- decrypt packets
- forward traffic into VPC

### Conceptually

```
Encrypted Tunnel
      ↓
IBM VPN Gateway
      ↓
Internal VPC Network
```

---

## ⚠️ Important Beginner Understanding

**VPN Gateway is NOT:**
- general-purpose router VM
- customer-managed appliance

IBM internally manages:
- encryption
- tunnel negotiation
- HA
- packet forwarding
- IPSec processing

---

## 🔐 IPSec Tunnel

IBM Cloud VPN uses:
> **IPSec protocol**

### IPSec Provides

- encryption
- authentication
- integrity checking

This ensures:
- packets unreadable during transit
- packets not modified
- communication authenticated

---

## 🔀 What Happens During VPN Communication

Suppose cloud server communicates with on-prem database.

### Flow

```
Cloud Server
    ↓
Route Table Lookup
    ↓
VPN Gateway
    ↓
IPSec Encryption
    ↓
Public Internet
    ↓
On-Prem VPN Device
    ↓
On-Prem Database
```

Even though internet used:
> **traffic protected cryptographically**

---

## 🌐 Peer IP Address

VPN requires:
> **remote endpoint address**

### Example

```
203.0.113.10
```

This is:
> **on-prem VPN device public IP**

IBM VPN Gateway uses this to:
> **establish tunnel**

Both sides must know:
> **where remote VPN endpoint exists**

---

## 🔑 Pre-Shared Key (PSK)

VPN tunnel requires authentication.

Pre-shared key acts like:
> **shared password**

Both sides configured with:
> **identical secret key**

### Purpose

- authenticate tunnel endpoints
- prevent unauthorized tunnel creation

### Example

**IBM VPN Gateway:**
```
secret123
```

**On-Prem VPN Device:**
```
secret123
```

If keys mismatch:
> **tunnel fails**

---

## 🤝 Tunnel Establishment Process

When VPN starts:

IBM VPN Gateway and on-prem device perform:
- identity verification
- encryption negotiation
- authentication
- tunnel creation

This process called:
> **IPSec negotiation**

If successful:
> **Secure Tunnel Established**

Now encrypted communication possible.

---

## 🔒 Tunnel Encryption

Traffic entering tunnel becomes encrypted.

### Example

**Before encryption:**
```
Database Query
```

**After encryption:**
```
Unreadable Ciphertext
```

Anyone intercepting traffic sees:
> **meaningless encrypted data**

This protects:
- enterprise communication
- sensitive workloads
- private applications

---

## 🔀 VPN Traffic Flow

### Detailed Flow

```
Application Packet
      ↓
Route Lookup
      ↓
VPN Route Match
      ↓
Packet Sent to VPN Gateway
      ↓
IPSec Encryption
      ↓
Internet Transit
      ↓
Remote VPN Device
      ↓
IPSec Decryption
      ↓
Destination Network
```

---

## 🌐 Hybrid Connectivity

This architecture enables:
> **hybrid cloud**

**Meaning:**
> some systems in cloud, some systems on-prem

### Example

```
Cloud Frontend
 ↓
On-Prem Database
```

or:

```
On-Prem SAP
 ↓
Cloud Analytics
```

Very common in enterprises.

---

## 🏢 Why Enterprises Use Hybrid Cloud

### Reasons

- legacy systems difficult to migrate
- compliance restrictions
- existing investments
- migration phases
- data locality requirements

Cloud adoption is usually gradual.

VPN enables:
> **coexistence of cloud and datacenter systems**

---

## 🗺️ Routing Is Critical

This is one of the most important beginner concepts.

**Creating VPN tunnel alone is NOT enough.**

Routing must also exist.

### Example Problem

Tunnel exists successfully.

But route table missing:
```
192.168.0.0/16 → VPN Gateway
```

Now cloud server sends packet:

**Destination:**
```
192.168.1.10
```

Route table does not know:
> **traffic should enter VPN**

**Result:**
```
Packet Dropped
```

Tunnel healthy. Traffic still fails.

This confuses many beginners.

---

## 📊 Why Route Tables Matter

Route tables determine:
> **which traffic should enter VPN tunnel**

Without route:
> IBM networking cannot forward packets correctly

Routing and VPN must work together.

### Example Correct VPN Routing

```
192.168.0.0/16 → VPN Gateway
```

Now traffic flow:

```
Cloud Workload
      ↓
Route Match
      ↓
VPN Gateway
      ↓
Tunnel
      ↓
On-Prem Network
```

Communication succeeds.

---

## 🔄 Bidirectional Routing

Both sides require routing.

**IBM Cloud must know:**
> on-prem routes

**On-prem network must know:**
> cloud routes

Otherwise:
- asymmetric routing occurs
- return traffic fails

### Example Bidirectional Architecture

**Cloud:**
```
10.0.0.0/16
```

**On-Prem:**
```
192.168.0.0/16
```

### Required Routes

**Cloud:**
```
192.168.0.0/16 → VPN Gateway
```

**On-Prem:**
```
10.0.0.0/16 → VPN Device
```

Both directions required.

---

## 🔄 VPN Tunnel Redundancy

Enterprise VPNs often create:
> **multiple tunnels**

### Purpose

- failover
- redundancy
- HA

### Example

```
Tunnel 1 → Active
Tunnel 2 → Backup
```

If one internet path fails:
> **second tunnel continues traffic**

---

## 🛡️ VPN Gateway High Availability

IBM internally provides:
- redundant VPN infrastructure
- distributed tunnel handling
- resilient networking systems

This improves:
- uptime
- failover
- tunnel stability

---

## ⚡ VPN Performance Considerations

VPN traffic requires:
- encryption
- decryption

This introduces:
- CPU overhead
- latency
- throughput limitations

Large enterprises sometimes later migrate to:
- **Direct Link**
- dedicated private connectivity

for higher performance.

---

## 🎯 VPN Use Cases

### 1. Datacenter Integration

```
Cloud App
 ↓
On-Prem Database
```

### 2. Migration Workloads

During migration:
- some systems remain on-prem
- others move to cloud

VPN keeps communication working.

### 3. Enterprise Internal Access

Employees access:
- cloud internal applications
- without exposing services publicly

### 4. Backup / DR

Cloud used for:
> **disaster recovery environments**

VPN synchronizes:
- backup traffic
- replication traffic

---

## 🌐 VPN vs Public Internet Access

### Without VPN

```
Cloud App
 ↓
Public Internet
 ↓
On-Prem API
```

**Problems:**
- exposure
- security risk
- compliance issues

### With VPN

```
Cloud App
 ↓
Encrypted Tunnel
 ↓
On-Prem API
```

Much more secure.

---

## 🏗️ IBM Internal VPN Processing

### Conceptually

```
Terraform
   ↓
IBM API
   ↓
VPN Control Plane
   ↓
Tunnel Negotiation
   ↓
Encryption Policies Applied
   ↓
Traffic Forwarding Enabled
```

IBM internally manages:
- IPSec sessions
- tunnel state
- failover handling
- encrypted packet forwarding

---

## 🌐 VPN and Subnets

VPN traffic ultimately reaches:
> **VPC subnets**

### Example

```
On-Prem
 ↓
VPN Gateway
 ↓
App Subnet
 ↓
Application Server
```

Subnets still protected by:
- ACLs
- Security Groups

VPN only provides:
> **transport path**

---

## 🏦 Real Enterprise Example

### Architecture

```
Corporate Datacenter
      ↓
VPN Tunnel
      ↓
IBM Cloud VPN Gateway
      ↓
Management VPC
      ↓
Application VPC
      ↓
Database Subnet
```

Employees and applications now communicate privately across environments.

---

## 🔧 Terraform Variables

Relevant variables:

```hcl
vpn_gateways
vpn_connections
peer_address
pre_shared_key
```

Terraform converts these into:
- VPN gateways
- encrypted IPSec tunnels
- route integrations
- hybrid networking connectivity

inside IBM Cloud infrastructure.

---

## 🧠 Complete Beginner Mental Model

Think of VPN like:
> **secure underground tunnel between cities**

| Real World | IBM Cloud |
|------------|-----------|
| City | Network |
| Underground Tunnel | VPN Tunnel |
| Tunnel Entrance | VPN Gateway |
| Tunnel Password | Pre-Shared Key |
| Road Sign | Route Table |
| Protected Cargo | Encrypted Packets |

Even though cities connected through dangerous public territory:
> **tunnel protects traffic safely**

VPN architecture is the foundation of enterprise hybrid cloud networking.

---

[← Previous: Route Table Service](./09-route-table-service.md) | [Index](./README.md) | [Next: Transit Gateway Integration →](./11-transit-gateway-integration.md)
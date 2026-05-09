# 🗺️ Route Table Service — Deep Beginner Explanation

[← Previous: Security Group Service Internals](./security-group-service-internals.md) | [Index](./README.md) | [Next: VPN Architecture →](./vpn-architecture.md)

---

## 📋 Overview

Routing is one of the most fundamental concepts in all networking.

### Without Routing

- packets cannot move between networks
- internet access fails
- VPN communication fails
- VPC communication fails
- Kubernetes clusters fail
- hybrid cloud fails

Everything in networking eventually depends on:
> **routing decisions**

This is why routing is called:
> **the decision engine of networking**

---

## 🎯 What Is Routing

At the most basic level, routing answers one question:
> **Where should this packet go next?**

Every packet contains:
- source IP
- destination IP

### Example

**Source:**
```
10.0.1.5
```

**Destination:**
```
10.0.3.10
```

The network must determine:
- where destination exists
- which path leads there
- which next device should receive packet

This decision process is:
> **routing**

---

## 📮 Real World Analogy

Imagine sending physical mail.

Envelope contains:
- source address
- destination address

Postal system checks:
> **where package should go next**

Maybe:
- local office
- airport
- regional center
- international route

Networking routing works similarly.

Packet travels:
- hop by hop
- based on destination lookup

---

## 📊 What Is a Route Table

A route table is basically:
> **a decision map for traffic**

It tells network:
```
If destination matches X,
send traffic to Y
```

### Example

```
10.0.0.0/16 → Local
0.0.0.0/0 → Public Gateway
192.168.0.0/16 → VPN Gateway
```

### Meaning

| Destination | Next Hop |
|-------------|----------|
| Local VPC traffic | Local routing |
| Internet traffic | Public Gateway |
| On-prem traffic | VPN Gateway |

---

## ⚠️ Important Beginner Understanding

**Routing does NOT:**
- inspect application data
- understand websites
- understand users

**Routing only understands:**
> **destination networks**

Everything routing does is based on:
> **IP addresses**

---

## 🏗️ What IBM VPC Routing Actually Does

IBM Cloud VPC internally maintains:
> **distributed routing systems**

**Purpose:**
> determine packet forwarding paths

### IBM Internally Tracks

- subnet ownership
- reachable networks
- gateway locations
- tunnel destinations
- VPC attachments

### When Packet Arrives

IBM performs:
- route lookup
- next-hop selection
- forwarding decision

---

## 🌐 What "Distributed Routing" Means

Traditional networking often used:
> **centralized physical routers**

Cloud networking scales too large for this.

IBM instead uses:
> **distributed routing fabric**

**Meaning:**
> routing intelligence spread across infrastructure

No single router handles all traffic.

Instead:
> **routing decisions distributed regionally**

### Benefits

- scalability
- redundancy
- low latency
- fault tolerance

---

## 🔀 Example Distributed Routing Flow

Suppose:

**VSI-A:**
```
10.0.1.5
```

**VSI-B:**
```
10.0.3.10
```

### Traffic Flow

```
VSI-A
   ↓
Subnet Router
   ↓
Distributed VPC Routing Fabric
   ↓
Destination Subnet
   ↓
VSI-B
```

IBM internally forwards packet using:
> **distributed software routers**

---

## 📦 What Happens When Packet Is Sent

Suppose workload sends packet:

**Destination:**
```
8.8.8.8
```

### IBM Networking System Performs

**Step 1:**
> Read destination IP

**Step 2:**
> Check route table

**Step 3:**
> Find matching route

**Step 4:**
> Choose next hop

**Step 5:**
> Forward packet

This entire process happens extremely quickly.

### 📊 Routing Decision Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              Packet Routing Logic Flow                          │
└─────────────────────────────────────────────────────────────────┘

                    Packet Arrives
                         │
                         ▼
              ┌──────────────────────┐
              │  Extract Destination │
              │  IP Address          │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Query Route Table   │
              │  for Matches         │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Multiple Routes     │
              │  Match?              │
              └──────────┬───────────┘
                         │
                    ┌────┴────┐
                    │         │
                   YES       NO
                    │         │

### 📊 Route Priority Table

| Priority | Route Type | Destination | Next Hop | Modifiable | Use Case |
|----------|------------|-------------|----------|------------|----------|
| 1 (Highest) | System Route | VPC CIDR | Local | ❌ No | Intra-VPC communication |
| 2 | System Route | Subnet CIDRs | Local | ❌ No | Inter-subnet routing |
| 3 | Custom Route | Specific /32 | Gateway/Appliance | ✅ Yes | Host-specific routing |
| 4 | Custom Route | Specific /24 | VPN/TGW | ✅ Yes | Network-specific routing |
| 5 | Custom Route | Aggregate /16 | VPN/TGW | ✅ Yes | Regional routing |
| 6 (Lowest) | Default Route | 0.0.0.0/0 | Public Gateway | ✅ Yes | Internet access |

> **Longest Prefix Match Rule:** When multiple routes match, the route with the longest prefix (most specific) is chosen, regardless of route type.

#### System Routes vs Custom Routes

| Aspect | System Routes | Custom Routes |
|--------|---------------|---------------|
| **Creation** | Automatic (IBM creates) | Manual (user creates) |
| **Modification** | Cannot be changed | Can be modified/deleted |
| **Purpose** | VPC internal routing | External connectivity |
| **Examples** | 10.0.0.0/16 → Local | 192.168.0.0/16 → VPN |
| **Deletion** | Cannot be deleted | Can be deleted |
| **Priority** | Always evaluated first | Evaluated after system routes |

                    ▼         ▼
         ┌──────────────┐  ┌──────────────┐
         │ Apply Longest│  │ Use Default  │
         │ Prefix Match │  │ Route (if    │
         │ Algorithm    │  │ exists)      │
         └──────┬───────┘  └──────┬───────┘
                │                 │
                └────────┬────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Resolve Next Hop    │
              │  - Gateway           │
              │  - Interface         │
              │  - Tunnel            │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Check Next Hop      │
              │  Availability        │
              └──────────┬───────────┘
                         │
                    ┌────┴────┐
                    │         │
                Available  Unavailable
                    │         │
                    ▼         ▼
         ┌──────────────┐  ┌──────────────┐
         │ Forward      │  │ Drop Packet  │
         │ Packet to    │  │ (Blackhole)  │
         │ Next Hop     │  │              │
         └──────────────┘  └──────────────┘
```

> **Key Point:** Routing decisions happen in microseconds, but understanding this flow is critical for troubleshooting connectivity issues.


---

## 🎯 Route Matching Logic

Routing uses:
> **longest prefix match**

**Meaning:**
> most specific route wins

### Example Routes

```
10.0.0.0/16
10.0.1.0/24
```

**Destination:**
```
10.0.1.25
```

**Chosen route:**
```
10.0.1.0/24
```

because:
> **more specific**

This is foundational networking behavior.

---

## 🗺️ Destination CIDR

Routes always contain:
> **destination network**

### Example

```
192.168.0.0/16
```

**Meaning:**
> this route applies for packets destined to:
```
192.168.x.x
```

Destination CIDR defines:
> **traffic matching criteria**

---

## 🚪 Next Hop

Next hop defines:
> **where packet should go next**

### Possible Next Hops Include

- local subnet
- public gateway
- VPN gateway
- Transit Gateway
- virtual appliance

---

## 🏠 Local Routing

### Example

```
10.0.0.0/16 → Local
```

**Meaning:**
> traffic remains inside VPC

Packet routed internally between subnets.

### Example

```
App Server
 ↓
Database Server
```

Traffic never leaves IBM internal network fabric.

---

## 🌍 Public Gateway Route

### Example

```
0.0.0.0/0 → Public Gateway
```

`0.0.0.0/0` means:
- all unknown destinations
- internet traffic

### Traffic Flow

```
VSI
 ↓
Public Gateway
 ↓
Internet
```

Without this route:
> **internet access fails**

---

## 🔐 VPN Gateway Route

### Example

```
192.168.0.0/16 → VPN Gateway
```

**Meaning:**
> on-prem traffic routed into VPN tunnel

### Flow

```
VPC
 ↓
VPN Gateway
 ↓
Encrypted Tunnel
 ↓
On-Prem Datacenter
```

Without VPN route:
> **packet never enters tunnel**

---

## 🔄 Transit Gateway Route

### Example

```
10.20.0.0/16 → TGW
```

**Meaning:**
> traffic destined for another VPC

### Flow

```
VPC A
 ↓
Transit Gateway
 ↓
VPC B
```

TGW acts like:
> **central routing hub**

---

## 🛡️ Appliance Route

Traffic can also route through:
- firewalls
- inspection appliances
- IDS/IPS systems

### Example

```
Internet Traffic
 ↓
Security Appliance
 ↓
Destination
```

**Used for:**
- deep packet inspection
- enterprise security
- compliance architectures

---

## 📡 Route Propagation

IBM internally distributes routing information throughout infrastructure.

### Example

```
10.0.2.0/24 reachable via Zone 2
```

All routing systems learn:
- where subnet exists
- how traffic reaches it

This is:
> **route propagation**

Without propagation:
- routing inconsistent
- packets lost

---

## 🌐 Subnet Routing Tables

Every subnet effectively depends on routing behavior.

IBM internally associates:
- subnet reachability
- route lookup logic
- forwarding decisions

Traffic entering subnet must know:
> **where next destination exists**

---

## 🔍 Next-Hop Resolution

After matching route, IBM determines:
> **actual forwarding target**

### Example

**Destination:**
```
192.168.1.10
```

### 🗺️ Custom Routing Examples with Diagrams

#### Example 1: Route to On-Premises via VPN

```
┌─────────────────────────────────────────────────────────────────┐
│                  VPN Routing Architecture                        │
└─────────────────────────────────────────────────────────────────┘

IBM Cloud VPC (10.0.0.0/16)
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │  App Server  │────────▶│  VPN Gateway │                     │
│  │  10.0.1.10   │         │              │                     │
│  └──────────────┘         └──────┬───────┘                     │
│                                   │                              │
│  Route Table Entry:               │                              │
│  192.168.0.0/16 → VPN Gateway     │                              │
│                                   │                              │
└───────────────────────────────────┼──────────────────────────────┘
                                    │
                          Encrypted IPsec Tunnel
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              On-Premises Datacenter (192.168.0.0/16)            │
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │ VPN Device   │────────▶│  SAP Server  │                     │
│  │              │         │ 192.168.1.50 │                     │
│  └──────────────┘         └──────────────┘                     │
│                                                                  │
│  Route Table Entry:                                             │
│  10.0.0.0/16 → VPN Device                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Traffic Flow:
1. App Server sends packet to 192.168.1.50
2. Route table matches 192.168.0.0/16 → VPN Gateway
3. VPN Gateway encrypts packet
4. Packet travels through IPsec tunnel
5. On-prem VPN device decrypts packet
6. Packet delivered to SAP Server
```

**Terraform Configuration:**
```hcl
routes = [
  {
    destination = "192.168.0.0/16"
    next_hop    = "vpn-gateway-id"
    zone        = "us-south-1"
  }
]
```

#### Example 2: Route to Another VPC via Transit Gateway

```
┌─────────────────────────────────────────────────────────────────┐
│              Transit Gateway Routing Architecture                │
└─────────────────────────────────────────────────────────────────┘

VPC-A (10.10.0.0/16)                    VPC-B (10.20.0.0/16)
┌──────────────────────┐                ┌──────────────────────┐
│                      │                │                      │
│  ┌────────────┐      │                │      ┌────────────┐ │
│  │ Web Server │      │                │      │  Database  │ │
│  │ 10.10.1.10 │──────┼────┐      ┌────┼──────│ 10.20.1.50 │ │
│  └────────────┘      │    │      │    │      └────────────┘ │
│                      │    │      │    │                      │
│  Route Table:        │    │      │    │  Route Table:        │
│  10.20.0.0/16 → TGW  │    │      │    │  10.10.0.0/16 → TGW  │
│                      │    │      │    │                      │
└──────────────────────┘    │      │    └──────────────────────┘
                            │      │
                            ▼      ▼
                    ┌────────────────────┐
                    │  Transit Gateway   │
                    │   (Regional Hub)   │
                    │                    │
                    │  Routing Table:    │
                    │  10.10.0.0/16→VPC-A│
                    │  10.20.0.0/16→VPC-B│
                    └────────────────────┘

Traffic Flow:
1. Web Server (10.10.1.10) sends to Database (10.20.1.50)
2. VPC-A route table: 10.20.0.0/16 → Transit Gateway
3. Transit Gateway receives packet
4. TGW routing: 10.20.0.0/16 → VPC-B
5. Packet forwarded to VPC-B
6. VPC-B delivers to Database
```

**Terraform Configuration:**
```hcl
routes = [
  {
    destination = "10.20.0.0/16"
    next_hop    = "transit-gateway-id"
    zone        = "us-south-1"
  }
]
```

#### Example 3: Route to Internet via Public Gateway

```
┌─────────────────────────────────────────────────────────────────┐
│              Internet Routing Architecture                       │
└─────────────────────────────────────────────────────────────────┘

IBM Cloud VPC (10.0.0.0/16)
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Private Subnet (10.0.1.0/24)                                   │
│  ┌──────────────────────────────────────────┐                  │
│  │                                           │                  │
│  │  ┌────────────┐      ┌────────────┐      │                  │
│  │  │  App VSI   │      │  App VSI   │      │                  │
│  │  │ 10.0.1.10  │      │ 10.0.1.11  │      │                  │
│  │  └─────┬──────┘      └─────┬──────┘      │                  │
│  │        │                   │              │                  │
│  │        └───────────┬───────┘              │                  │
│  │                    │                      │                  │
│  │  Route Table:      │                      │                  │
│  │  0.0.0.0/0 → Public Gateway               │                  │
│  │                    │                      │                  │
│  └────────────────────┼──────────────────────┘                  │
│                       │                                          │
│                       ▼                                          │
│              ┌─────────────────┐                                │
│              │ Public Gateway  │                                │
│              │  (NAT Service)  │                                │
│              └────────┬────────┘                                │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        │ Source NAT Applied
                        │ (Private IP → Public IP)
                        │
                        ▼
                   ┌─────────┐
                   │ Internet│
                   │         │
                   │ ☁️ APIs │
                   │ 🌐 CDNs │
                   └─────────┘

Traffic Flow:
1. App VSI sends packet to internet (e.g., api.github.com)
2. Route table matches 0.0.0.0/0 → Public Gateway
3. Public Gateway performs Source NAT
4. Packet sent to internet with public IP
5. Response returns to Public Gateway
6. Public Gateway forwards to original VSI
```

**Terraform Configuration:**
```hcl
routes = [
  {
    destination = "0.0.0.0/0"
    next_hop    = "public-gateway-id"
    zone        = "us-south-1"
  }
]
```

> **Key Differences:**
> - **VPN Route:** Encrypted tunnel to on-premises (192.168.0.0/16)
> - **TGW Route:** Inter-VPC communication within IBM Cloud (10.20.0.0/16)
> - **Internet Route:** Default route for all external traffic (0.0.0.0/0)


**Matched Route:**
```
VPN Gateway
```

IBM now resolves:
- which VPN gateway
- tunnel status
- forwarding interface

This is:
> **next-hop resolution**

---

## 🌍 Internet Routing Example

Suppose workload runs:

```bash
curl google.com
```

### Flow

```
VSI
 ↓
Route Table Lookup
 ↓
0.0.0.0/0 Route Match
 ↓
Public Gateway
 ↓
Internet
```

Without default route:
> **internet unreachable**

---

## 🔄 Inter-Subnet Routing Example

Suppose:

**App Server:**
```
10.0.2.10
```

**Database:**
```
10.0.3.20
```

### Flow

```
App Server
 ↓
Local Route Match
 ↓
VPC Routing Fabric
 ↓
Database Subnet
 ↓
Database
```

Traffic stays entirely inside IBM infrastructure.

---

## 🏢 Hybrid Connectivity Example

Suppose enterprise datacenter connected through VPN.

### Flow

```
Cloud App
 ↓
VPN Route Match
 ↓
VPN Gateway
 ↓
Encrypted Tunnel
 ↓
On-Prem SAP Server
```

Routing makes hybrid cloud possible.

---

## 🕳️ What Is Packet Blackholing

One of the most important networking failure concepts.

**Blackhole means:**
> packet has nowhere valid to go

### Example

**Destination:**
```
192.168.1.10
```

No matching route exists.

**Result:**
```
Packet Dropped
```

Traffic disappears silently.

This is called:
> **blackholing**

### Common Causes

- missing route
- wrong next hop
- failed gateway
- tunnel down

---

## 🚨 Why Routing Problems Are Difficult

Routing failures often look like:
- application failure
- DNS issue
- timeout
- server unreachable

But actual problem:
> **packet path broken**

Networking troubleshooting often starts with:
> **route verification**

---

## 🏢 Enterprise Routing Complexity

Large enterprises manage:
- hundreds of routes
- multiple VPCs
- VPN tunnels
- TGWs
- cloud providers

Routing architecture becomes extremely important.

### Poor Routing Design Causes

- asymmetric routing
- traffic loops
- blackholes
- latency problems

---

## ☸️ Kubernetes and Routing

Kubernetes heavily depends on routing.

### Traffic Includes

- pod communication
- service communication
- ingress traffic
- node traffic

IBM Cloud VPC routing becomes:
> **underlay network**

Kubernetes SDN becomes:
> **overlay network**

Understanding routing is mandatory for OpenShift networking.

---

## 🏗️ IBM Internal Routing Infrastructure

IBM internally maintains:
- routing databases
- route propagation systems
- forwarding engines
- next-hop resolution systems

### Conceptually

```
Terraform
   ↓
IBM API
   ↓
Control Plane
   ↓
Distributed Route Programming
   ↓
Forwarding Fabric Updated
```

Traffic forwarding now follows:
> **updated routing policies**

---

## 🔧 Terraform Variables

Relevant variables:

```hcl
routes
destination_cidr
next_hop
```

Terraform converts these into:
- actual route entries
- forwarding rules
- gateway associations

inside IBM Cloud routing fabric.

---

## 🏦 Real Enterprise Example

### Architecture

```
Internet
 ↓
Public Gateway
 ↓
Web Subnet
 ↓
App Subnet
 ↓
Database Subnet
 ↓
VPN Gateway
 ↓
On-Prem Network
```

Routing decides:
- which traffic stays local
- which traffic goes internet
- which traffic enters VPN
- which traffic goes TGW

Everything depends on routing decisions.

---

## 🧠 Complete Beginner Mental Model

Think of networking like road navigation.

| Real World | IBM Cloud |
|------------|-----------|
| Road Map | Route Table |
| Destination Address | Destination CIDR |
| Highway Exit | Next Hop |
| GPS Decision | Route Lookup |
| Wrong Road | Blackhole |
| Traffic Router | VPC Routing Fabric |

Routing is basically:
> **the navigation system of cloud networking**

Every packet depends on routing decisions to reach its destination correctly.

---

[← Previous: Security Group Service Internals](./security-group-service-internals.md) | [Index](./README.md) | [Next: VPN Architecture →](./vpn-architecture.md)
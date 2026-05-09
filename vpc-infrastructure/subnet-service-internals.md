# 🌐 Subnet Service Internals — Deep Beginner Explanation

[← Previous: CIDR Planning & IPAM](./04-cidr-planning-ipam.md) | [Index](./README.md) | [Next: Network ACL Architecture →](./06-network-acl-architecture.md)

---

## 📋 Overview

After the VPC is created, the next major networking construct is the **subnet**.

**A subnet is where actual workloads live.**

This is one of the most important beginner concepts in cloud networking.

The VPC itself is only the large isolated networking container.

But workloads cannot attach directly to a VPC.

They attach to:
> **subnets**

### Without Subnets

- no VSI networking
- no Kubernetes worker networking
- no load balancer frontend networking
- no application communication

**Subnets are the actual runtime network segments inside the VPC.**

---

## 🎯 What Problem Subnets Solve

Imagine one huge flat network:

```
10.0.0.0/16
```

Suppose everything exists inside this single network:
- web servers
- databases
- monitoring systems
- VPN appliances
- Kubernetes nodes
- bastion hosts

### Problems Immediately Occur

- no isolation
- difficult firewalling
- security complexity
- broadcast noise
- routing confusion
- operational chaos

**Subnets solve this by dividing the large network into smaller logical sections.**

### Example

```
Management Subnet:
10.0.1.0/24

Application Subnet:
10.0.2.0/24

Database Subnet:
10.0.3.0/24
```

Now workloads are separated logically.

This improves:
- organization
- routing
- security
- scalability
- operational management

---

## 🏗️ What a Subnet Actually Represents

A subnet is:
> **a smaller IP network inside a larger VPC network**

### 🌐 Subnet Architecture Diagram

See diagram below showing how subnets fit within the VPC architecture:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VPC: prod-vpc (10.0.0.0/16)                      │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Zone: us-south-1                            │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  Subnet: app-subnet-1 (10.0.1.0/24)                      │ │ │
│  │  │  ┌────────────────────────────────────────────────────┐  │ │ │
│  │  │  │  Network ACL (Subnet-Level Firewall)              │  │ │ │
│  │  │  │  - Inbound Rules                                   │  │ │ │
│  │  │  │  - Outbound Rules                                  │  │ │ │
│  │  │  └────────────────────────────────────────────────────┘  │ │ │
│  │  │                                                            │ │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │ │
│  │  │  │ VSI-1        │  │ VSI-2        │  │ VSI-3        │   │ │ │
│  │  │  │ 10.0.1.5     │  │ 10.0.1.6     │  │ 10.0.1.7     │   │ │ │
│  │  │  │              │  │              │  │              │   │ │ │
│  │  │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │   │ │ │
│  │  │  │ │Security  │ │  │ │Security  │ │  │ │Security  │ │   │ │ │
│  │  │  │ │Group     │ │  │ │Group     │ │  │ │Group     │ │   │ │ │
│  │  │  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │   │ │ │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │ │
│  │  │                                                            │ │ │
│  │  │  Gateway: 10.0.1.1 (IBM Reserved)                         │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  Subnet: db-subnet-1 (10.0.2.0/24)                       │ │ │
│  │  │  - Network ACL                                            │ │ │
│  │  │  - Workloads (DB instances)                               │ │ │
│  │  │  - Gateway: 10.0.2.1                                      │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Public Gateway (Optional)                                     │ │
│  │  - Provides outbound internet access                           │ │
│  │  - NAT functionality                                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                              ┌──────────┐
                              │ Internet │
                              └──────────┘
```

> **Key Components:**
> - **Subnet**: IP range where workloads attach (e.g., 10.0.1.0/24)
> - **Network ACL**: Subnet-level stateless firewall
> - **Security Groups**: Workload-level stateful firewall
> - **Gateway IP**: First usable IP (e.g., 10.0.1.1) - IBM reserved
> - **Public Gateway**: Optional NAT for outbound internet access

### Example

**VPC:**
```
10.0.0.0/16
```

**Inside it:**
```
Subnet:
10.0.1.0/24
```

The subnet owns:
- that IP range
- workloads using those IPs
- traffic entering/leaving that network segment

IBM internally maps:
- subnet CIDR
- subnet routes
- workload ownership
- ACL associations

---

## ⚠️ Important Beginner Understanding

**Subnets are NOT just "IP ranges."**

Subnets are:
- traffic segmentation boundaries
- routing boundaries
- workload placement boundaries
- security boundaries

**Everything in cloud networking eventually depends on subnet architecture.**

---

## 🔄 Traditional Datacenter VLAN vs Cloud Subnet

This is critical.

Beginners often think:
> cloud subnet = traditional VLAN

**Not exactly.**

### 📊 Subnet Types Comparison

| Feature | Public Subnet | Private Subnet |
|---------|---------------|----------------|
| **Internet Access** | ✅ Via Public Gateway | ❌ No direct access |
| **Inbound Traffic** | ✅ Via Floating IP/LB | ❌ Not accessible |
| **Outbound Traffic** | ✅ Via Public Gateway | ❌ Blocked (unless VPN/TGW) |
| **Use Cases** | Web servers, bastion hosts | Databases, app servers |
| **Security Posture** | Higher risk | Lower risk |
| **Public Gateway** | Attached | Not attached |
| **Floating IPs** | Can assign | Can assign (but no route) |
| **Cost** | Gateway charges apply | No gateway charges |
| **Best Practice** | Minimize usage | Preferred for most workloads |

### 📊 Traditional VLAN vs IBM Cloud Subnet

| Aspect | Traditional VLAN | IBM Cloud Subnet |
|--------|------------------|------------------|
| **Layer** | Layer 2 (Ethernet) | Layer 3 (IP routing) |
| **Broadcast** | Required | Not required |
| **Forwarding** | MAC-based | IP-based |
| **Scalability** | Limited | Highly scalable |
| **Infrastructure** | Physical switches | Software-defined |
| **Spanning Tree** | Required | Not applicable |
| **ARP Flooding** | Yes | Minimal/optimized |
| **Multi-tenancy** | Complex | Native support |

### Traditional VLAN Networking

Traditional datacenters commonly used:
- layer 2 switching
- VLAN segmentation

**Example:**

```
Switch
 ↓
VLAN 10
 ↓
Servers
```

Traffic depended heavily on:
- broadcast domains
- ARP flooding
- MAC learning
- physical switches

### Problems

- scaling limitations
- broadcast overhead
- complex spanning tree
- operational complexity

---

## 🌐 IBM Cloud VPC Subnet Model

IBM Cloud VPC subnets are **NOT traditional VLANs**.

They are:
> **software-defined routed network segments**

IBM internally uses:
- distributed routing
- overlay networking
- SDN forwarding
- virtual subnet ownership

**There is no exposed layer-2 broadcast dependency like traditional datacenters.**

This is one of the biggest shifts in cloud networking.

---

## 📊 What "Layer 3 Segmentation" Means

IBM VPC networking primarily operates at:
> **Layer 3 (IP routing)**

instead of:
> **Layer 2 switching**

Traffic forwarding is based on:
> **IP routes**

not:
> **Ethernet broadcasts**

### Example

**Destination IP:**
```
10.0.2.15
```

IBM internally determines:
- which subnet owns this IP
- where workload exists
- how packet should route

This improves:
- scalability
- performance
- cloud automation

---

## 🚀 Why Cloud Providers Prefer Layer 3 Networking

Layer 2 broadcast-based networking scales poorly.

Large cloud environments contain:
- millions of workloads
- thousands of tenants
- massive traffic volumes

**Traditional broadcast-heavy networking would collapse.**

So IBM uses:
- routed networking fabric
- distributed forwarding systems

### Benefits

- reduced broadcast overhead
- easier scaling
- simplified routing
- better isolation

---

## 🔧 What Happens When Terraform Creates a Subnet

### Example

```hcl
resource "ibm_is_subnet" "app" {
  name = "app-subnet"
  ipv4_cidr_block = "10.0.2.0/24"
  zone = "us-south-1"
}
```

Terraform calls IBM Cloud APIs.

IBM internally performs multiple operations.

### 1. CIDR Ownership Registration

IBM registers:
```
10.0.2.0/24
```

as belonging to:
- this subnet
- this VPC
- this zone

This becomes part of IBM's distributed routing system.

### 2. Route Propagation

IBM updates internal route tables.

**Purpose:**
> ensure traffic can reach subnet

Regional routing fabric learns:
```
10.0.2.0/24 reachable in us-south-1
```

Now traffic can route correctly.

### 3. Zone Placement Mapping

Subnet becomes tied to one zone.

**Example:**
```
app-subnet → us-south-1
```

**Important:**
> subnet cannot span multiple zones

This is because workloads physically exist in datacenters.

### 4. ACL Association

IBM associates subnet with:
> **Network ACL**

**Purpose:**
> control traffic entering/leaving subnet

**Example:**

```
app-subnet
  ↓
app-acl
```

ACL rules now protect entire subnet.

### 5. Gateway Association

Subnet may also associate with:
> **Public Gateway**

**Purpose:**
> internet access

### 🔄 Public Gateway Flow Diagram

See diagram below showing how public gateway provides outbound internet access:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Private Subnet (10.0.1.0/24)                 │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ VSI-1        │    │ VSI-2        │    │ VSI-3        │      │
│  │ 10.0.1.5     │    │ 10.0.1.6     │    │ 10.0.1.7     │      │
│  │              │    │              │    │              │      │
│  │ Needs to:    │    │ Needs to:    │    │ Needs to:    │      │
│  │ - apt update │    │ - yum update │    │ - wget file  │      │
│  │ - pull image │    │ - curl API   │    │ - git clone  │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                   │
│                             ▼                                   │
│                    ┌─────────────────┐                          │
│                    │ Subnet Gateway  │                          │
│                    │   10.0.1.1      │                          │
│                    └────────┬────────┘                          │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Public Gateway     │
                    │  (NAT Service)      │
                    │                     │
                    │  Private: 10.0.1.x  │
                    │  Public: 52.x.x.x   │
                    └──────────┬──────────┘
                               │
                               │ Source NAT Translation
                               │ 10.0.1.5 → 52.x.x.x
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Internet        │
                    │                     │
                    │  - Package repos    │
                    │  - Container reg    │
                    │  - External APIs    │
                    └─────────────────────┘
```

> **Flow Steps:**
> 1. **VSI initiates outbound request** (e.g., apt update)
> 2. **Traffic routes to subnet gateway** (10.0.1.1)
> 3. **Gateway forwards to Public Gateway**
> 4. **Public Gateway performs NAT** (10.0.1.5 → 52.x.x.x)
> 5. **Traffic reaches internet** with public IP
> 6. **Return traffic follows reverse path**

> **Important Notes:**
> - Public Gateway provides **outbound-only** access
> - VSIs remain **not directly accessible** from internet
> - All outbound traffic appears from **same public IP**
> - No inbound connections possible (use Floating IP or Load Balancer for that)

**Example:**

```
Subnet
  ↓
Public Gateway
  ↓
Internet
```

---

## 🔗 Subnets Are Workload Attachment Points

This is extremely important.

**Actual workloads attach to subnets.**

### Examples

| Resource | Attaches to Subnet |
|----------|-------------------|
| VSI NIC | Yes |
| OpenShift Worker | Yes |
| Load Balancer Frontend | Yes |
| Virtual Appliance | Yes |
| VPE Gateway | Yes |

**Without subnet:**
> **workload has no network location**

---

## 💻 VSI Networking Example

Suppose VSI created:

```
VSI:
app-server-1
```

IBM creates:
> **virtual NIC**

NIC attaches to subnet:

```
app-server-1
   ↓
eth0
   ↓
app-subnet
```

Subnet allocates:
- private IP
- routing ownership
- connectivity path

---

## ☸️ OpenShift Networking Example

OpenShift workers also attach to subnets.

### Example

```
Worker Node
   ↓
Worker Subnet
```

Kubernetes pods later communicate through:
- worker networking
- VPC underlay network

Subnets become foundational for:
- Kubernetes networking
- pod communication
- ingress traffic

---

## ⚖️ Load Balancer Example

Load balancer frontend interfaces also attach to subnets.

### Example

```
Public LB
   ↓
Frontend Subnet
```

Traffic enters through subnet routing fabric.

---

## 🔀 Understanding Traffic Flow Inside Subnet

### Example

**VSI:**
```
10.0.2.15
```

### Packet Flow

```
VSI NIC
   ↓
Subnet Router
   ↓
VPC Routing Fabric
   ↓
Destination
```

IBM internally handles:
- packet forwarding
- subnet routing
- next-hop resolution

**There is no physical router visible to customer.**

---

## 🚪 What Is "Subnet Router"

Every subnet logically has:
> **gateway/router behavior**

**Purpose:**
> allow traffic to:
- other subnets
- internet
- VPN
- TGW

### Conceptually

```
Subnet
   ↓
Logical Gateway
   ↓
Other Networks
```

This routing is implemented through:
> **distributed software routers**

not:
> **dedicated physical routers**

---

## 📡 Broadcast Domains in Traditional Networking

Traditional VLANs heavily relied on:
- ARP broadcasts
- Ethernet flooding
- MAC discovery

### Example

```
Who owns IP 10.0.1.5?
```

Broadcast sent to:
> **entire VLAN**

Large broadcast domains become inefficient.

---

## 🌐 IBM Cloud Avoids Broadcast Dependency

IBM VPC networking minimizes:
- layer 2 exposure
- broadcast dependency

Instead:
- routing intelligence maintained centrally
- forwarding handled through SDN systems

### Benefits

- massive scalability
- cleaner architecture
- simpler operations

This is why cloud networking feels fundamentally different from traditional enterprise networking.

---

## 🎯 Why Subnet Design Matters

Bad subnet architecture creates:
- security issues
- routing complexity
- operational confusion

Good subnet architecture separates:
- management traffic
- application traffic
- database traffic
- Kubernetes traffic
- VPN traffic

### Example

```
10.0.1.0/24 → Management
10.0.2.0/24 → Applications
10.0.3.0/24 → Databases
```

This improves:
- ACL management
- SG management
- compliance
- observability
- troubleshooting

---

## 🏢 Enterprise Multi-Zone Subnet Design

Production architectures usually create:
> **separate subnet per zone**

### Example

```
Zone 1:
10.0.1.0/24

Zone 2:
10.0.2.0/24

Zone 3:
10.0.3.0/24
```

### Purpose

- high availability
- workload distribution
- fault isolation

---

## 🔧 Terraform Implementation

### Subnet Resource Creation

The `terraform-ibm-landing-zone-vpc` module creates subnets using the following Terraform code:

**File:** [`subnet.tf`](https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone-vpc/blob/main/subnet.tf)

```terraform
##############################################################################
# Multizone subnets
##############################################################################

locals {
  # Get the subnet map from dynamic_values module
  subnet_object = module.dynamic_values.subnet_map
  
  # Determine which subnets to use: created or existing
  subnets = var.create_subnets ?
    ibm_is_subnet.subnet :  # Use created subnets
    {                        # Or use existing subnets
      for subnet in data.ibm_is_subnet.subnet :
      subnet.name => subnet
    }
}

##############################################################################
# Create new address prefixes for subnets (if needed)
##############################################################################

resource "ibm_is_vpc_address_prefix" "subnet_prefix" {
  # Only create if:
  # 1. Subnet doesn't have no_prefix flag
  # 2. We're creating subnets
  # 3. No explicit address prefixes were provided
  for_each = {
    for k, v in local.subnet_object : k => v
    if (v.no_prefix == false &&
        var.create_subnets == true &&
        length(local.address_prefixes) == 0)
  }
  
  name = each.value.prefix_name  # e.g., "vpc-name-subnet-a-prefix"
  zone = each.value.zone_name    # e.g., "us-south-1"
  vpc  = local.vpc_id
  cidr = each.value.cidr         # Subnet's CIDR becomes the prefix
}

##############################################################################
# Create Subnets
##############################################################################

resource "ibm_is_subnet" "subnet" {
  # Only create if create_subnets is true
  for_each = var.create_subnets ? local.subnet_object : {}
  
  vpc            = local.vpc_id
  name           = each.key              # Full subnet name from dynamic_values
  zone           = each.value.zone_name  # e.g., "us-south-1"
  resource_group = var.resource_group_id
  
  # CIDR Block Logic:
  # - If no explicit prefixes AND subnet doesn't have no_prefix flag:
  #   Use the auto-created prefix's CIDR
  # - Otherwise: Use the subnet's CIDR directly
  ipv4_cidr_block = (
    length(keys(local.address_prefixes)) == 0 && !each.value.no_prefix
  ) ? ibm_is_vpc_address_prefix.subnet_prefix[each.value.prefix_name].cidr
    : each.value.cidr
  
  # Attach to Network ACL (created in network_acls.tf)
  network_acl = ibm_is_network_acl.network_acl[each.value.acl].id
  
  # Attach to Public Gateway (if configured)
  public_gateway = each.value.public_gateway  # Gateway ID or null
  
  # Tagging
  tags        = var.tags
  access_tags = var.access_tags
  
  # Ensure address prefixes are created first
  depends_on = [ibm_is_vpc_address_prefix.address_prefixes]
}
```

### Key Implementation Details

#### 1. Dynamic Values Module
```terraform
subnet_object = module.dynamic_values.subnet_map
```
- Transforms zone-based subnet lists into a flat map
- Handles zone distribution automatically
- Prepares subnet names with VPC prefix

**Input:**
```terraform
subnets = {
  zone-1 = [{ name = "app", cidr = "10.0.1.0/24", acl_name = "app-acl" }]
  zone-2 = [{ name = "app", cidr = "10.0.2.0/24", acl_name = "app-acl" }]
}
```

**Output:**
```terraform
subnet_map = {
  "vpc-name-app-zone-1" = { zone_name = "us-south-1", cidr = "10.0.1.0/24", ... }
  "vpc-name-app-zone-2" = { zone_name = "us-south-2", cidr = "10.0.2.0/24", ... }
}
```

#### 2. Flexible CIDR Management
```terraform
ipv4_cidr_block = (
  length(keys(local.address_prefixes)) == 0 && !each.value.no_prefix
) ? ibm_is_vpc_address_prefix.subnet_prefix[each.value.prefix_name].cidr
  : each.value.cidr
```

Three CIDR assignment methods:
1. **Explicit Address Prefixes**: Use predefined VPC-level prefixes
2. **Auto-Generated Prefixes**: Create prefix from subnet CIDR
3. **Direct CIDR**: Use subnet CIDR without prefix (when `no_prefix = true`)

#### 3. Network ACL Attachment
```terraform
network_acl = ibm_is_network_acl.network_acl[each.value.acl].id
```
- **Every subnet MUST be attached to an ACL** (IBM Cloud requirement)
- ACL name is specified in subnet configuration
- See [`network-acl-architecture.md`](network-acl-architecture.md) for details

#### 4. Public Gateway Attachment
```terraform
public_gateway = each.value.public_gateway  # Gateway ID or null
```
- Optional: Only if subnet needs outbound internet access
- Gateway must exist in the same zone as the subnet
- See [`subnet-service-internals.md`](subnet-service-internals.md#public-gateway-attachment) for details

### Usage Example

```terraform
module "vpc" {
  source = "terraform-ibm-modules/landing-zone-vpc/ibm"
  
  # VPC Configuration
  create_vpc        = true
  name              = "production"
  region            = "us-south"
  resource_group_id = "abc123..."
  
  # Subnet Configuration
  create_subnets = true
  subnets = {
    zone-1 = [
      {
        name           = "app-subnet"
        cidr           = "10.10.1.0/24"
        acl_name       = "app-acl"
        public_gateway = true  # Enable internet access
      },
      {
        name           = "db-subnet"
        cidr           = "10.10.4.0/24"
        acl_name       = "db-acl"
        public_gateway = false  # Private only
      }
    ]
    zone-2 = [
      {
        name           = "app-subnet"
        cidr           = "10.10.2.0/24"
        acl_name       = "app-acl"
        public_gateway = true
      },
      {
        name           = "db-subnet"
        cidr           = "10.10.5.0/24"
        acl_name       = "db-acl"
        public_gateway = false
      }
    ]
    zone-3 = [
      {
        name           = "app-subnet"
        cidr           = "10.10.3.0/24"
        acl_name       = "app-acl"
        public_gateway = true
      },
      {
        name           = "db-subnet"
        cidr           = "10.10.6.0/24"
        acl_name       = "db-acl"
        public_gateway = false
      }
    ]
  }
  
  # Public Gateway Configuration
  use_public_gateways = {
    zone-1 = true
    zone-2 = true
    zone-3 = true
  }
  
  # Network ACL Configuration
  network_acls = [
    {
      name = "app-acl"
      rules = [
        {
          name        = "allow-http"
          action      = "allow"
          direction   = "inbound"
          source      = "0.0.0.0/0"
          destination = "0.0.0.0/0"
          tcp = {
            port_min = 80
            port_max = 80
          }
        }
      ]
    },
    {
      name = "db-acl"
      rules = [
        {
          name        = "allow-postgres"
          action      = "allow"
          direction   = "inbound"
          source      = "10.10.0.0/16"  # Only from VPC
          destination = "0.0.0.0/0"
          tcp = {
            port_min = 5432
            port_max = 5432
          }
        }
      ]
    }
  ]
}
```

**Result:** Creates 6 subnets (2 per zone) with appropriate ACLs and public gateway attachments.

### Existing Subnet Support

The module also supports using existing subnets:

```terraform
module "vpc" {
  source = "terraform-ibm-modules/landing-zone-vpc/ibm"
  
  create_vpc     = false
  existing_vpc_id = "r006-abc123..."
  
  create_subnets = false
  existing_subnets = [
    {
      id             = "0717-abc123..."
      public_gateway = true  # Attach gateway to existing subnet
    },
    {
      id             = "0717-def456..."
      public_gateway = false
    }
  ]
  
  # Public gateways will be created and attached
  use_public_gateways = {
    zone-1 = true
    zone-2 = false
    zone-3 = true
  }
}
```

**Use Case:** When integrating with pre-existing VPC infrastructure.

---

## 🧠 Complete Beginner Mental Model

Think of VPC networking like a city.

| Concept | Mapping |
|---------|---------|
| Country | VPC |
| District | Zone |
| Neighborhood | Subnet |
| House | VSI |
| Road System | Routing Fabric |
| Traffic Police | ACL / Security Group |

The subnet is basically:
> **the neighborhood where workloads live**

It determines:
- where workloads are placed
- how traffic reaches them
- what security policies apply
- how routing behaves

**Subnets are the foundational workload placement layer inside IBM Cloud VPC networking.**

---

[← Previous: CIDR Planning & IPAM](./04-cidr-planning-ipam.md) | [Index](./README.md) | [Next: Network ACL Architecture →](./06-network-acl-architecture.md)
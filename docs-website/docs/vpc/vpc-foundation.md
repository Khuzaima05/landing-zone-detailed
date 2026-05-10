# IBM Cloud VPC — Complete Beginner Foundation

## Overview

IBM Cloud VPC is a virtual private network environment created inside IBM Cloud datacenters. To understand it properly, first understand the problem cloud providers were trying to solve.

---

## The Problem: Traditional Datacenter Limitations

Before cloud computing existed, companies built their own physical datacenters. They purchased:
- Routers
- Switches
- Firewalls
- Servers
- Storage devices
- Power systems
- Cooling systems

**Networking was entirely hardware-based.** If a company needed a new subnet, engineers manually configured VLANs on switches. If they needed firewall rules, they configured hardware firewalls. Scaling required purchasing more hardware, cabling it physically, configuring routing manually, and maintaining the infrastructure continuously.

### The Challenges

This process was:
- ❌ **Expensive** - Capital investment in hardware
- ❌ **Slow** - Weeks or months to provision
- ❌ **Error-prone** - Manual configuration mistakes
- ❌ **Difficult to scale globally** - Physical limitations

---

## The Cloud Solution: Shared Infrastructure with Isolation

Cloud computing fundamentally changed this model. Instead of customers owning physical infrastructure, cloud providers such as IBM built enormous global datacenters containing millions of shared hardware components.

### The Challenge: Multi-Tenancy

Multiple customers would now use the same physical infrastructure simultaneously. IBM needed a way to ensure that one customer's servers, traffic, storage, and applications remained completely isolated from another customer's environment, even though both workloads physically existed inside the same datacenter building.

---

## What is a VPC?

A **VPC (Virtual Private Cloud)** is essentially a logically isolated software-defined network created for a customer inside the IBM Cloud infrastructure.

### The Key Word: "Virtual"

The network is not created using dedicated physical routers and switches for each customer. Instead, IBM uses software-defined networking technologies to create virtual networking layers on top of shared hardware infrastructure.

### Technologies Used

Internally, IBM Cloud uses technologies such as:
- **SDN controllers** - Centralized network management
- **Overlay networking** - Virtual networks over physical infrastructure
- **VXLAN encapsulation** - Network virtualization protocol
- **Distributed virtual routers** - Software-based routing
- **Programmable routing planes** - Dynamic route management

### 🌐 VPC Isolation Architecture

See diagram below showing how VPCs provide logical isolation on shared infrastructure:

```
┌─────────────────────────────────────────────────────────────────┐
│                    IBM Cloud Physical Infrastructure             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Software-Defined Networking Layer             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────┐      │
│  │   Customer A VPC     │         │   Customer B VPC     │      │
│  │   CIDR: 10.0.0.0/16  │         │   CIDR: 10.0.0.0/16  │      │
│  │  ┌────────────────┐  │         │  ┌────────────────┐  │      │
│  │  │ Subnet 1       │  │         │  │ Subnet 1       │  │      │
│  │  │ 10.0.1.0/24    │  │         │  │ 10.0.1.0/24    │  │      │
│  │  │ ┌──────────┐   │  │         │  │ ┌──────────┐   │  │      │
│  │  │ │ VSI-A1   │   │  │         │  │ │ VSI-B1   │   │  │      │
│  │  │ └──────────┘   │  │         │  │ └──────────┘   │  │      │
│  │  └────────────────┘  │         │  └────────────────┘  │      │
│  │                      │         │                      │      │
│  │  ┌────────────────┐  │         │  ┌────────────────┐  │      │
│  │  │ Subnet 2       │  │         │  │ Subnet 2       │  │      │
│  │  │ 10.0.2.0/24    │  │         │  │ 10.0.2.0/24    │  │      │
│  │  └────────────────┘  │         │  └────────────────┘  │      │
│  └──────────────────────┘         └──────────────────────┘      │
│           ↑                                    ↑                 │
│           │                                    │                 │
│      Isolated                             Isolated               │
│      Routing                              Routing                │
│      Domain                               Domain                 │
└─────────────────────────────────────────────────────────────────┘
```

> **Note:** Even with identical CIDR ranges, VPCs remain completely isolated through software-defined network segmentation.

### Traffic Isolation

Even if two customers use the exact same CIDR ranges, such as `10.0.0.0/16`, their traffic remains isolated because IBM tracks ownership and routing context internally through software-defined network segmentation. The customer never sees the underlying complexity. From the customer perspective, it appears as if they own an entirely private datacenter network.

---

## What Happens When Terraform Creates a VPC

When Terraform creates an IBM Cloud VPC resource, IBM does not physically install hardware for the user. Instead, IBM allocates a new virtual routing domain inside its distributed networking control plane.

### The Process

The system creates:
1. **Logical network isolation boundaries** - Separate your traffic from others
2. **Distributed route management** - Handle packet forwarding
3. **Subnet ownership mappings** - Track which subnets belong to your VPC
4. **Virtual traffic segmentation rules** - Enforce isolation

This process happens almost instantly because everything is software controlled rather than hardware controlled.

---

## VPC as a Foundational Container

### What a VPC Is NOT

A VPC itself is not:
- ❌ A server
- ❌ A subnet
- ❌ A firewall

### What a VPC IS

✅ **The foundational networking container** that holds all networking resources

It defines the overall routing boundary within which communication occurs.

### 📊 VPC Component Relationship Diagram

See diagram below showing how VPC components relate to each other:

```
                        ┌─────────────────────────────────────┐
                        │         IBM Cloud VPC               │
                        │    (Regional Container)             │
                        │                                     │
                        │  ┌───────────────────────────────┐  │
                        │  │     Route Tables              │  │
                        │  │  (Traffic Direction)          │  │
                        │  └───────────────────────────────┘  │
                        │                                     │
                        │  ┌───────────────────────────────┐  │
                        │  │     Network ACLs              │  │
                        │  │  (Subnet-Level Firewall)      │  │
                        │  └───────────────────────────────┘  │
                        │                                     │
    ┌───────────────────┼─────────────────────────────────────┼───────────────────┐
    │                   │                                     │                   │
    │  Zone 1           │         Zone 2                      │      Zone 3       │
    │                   │                                     │                   │
    │  ┌─────────────┐  │      ┌─────────────┐               │  ┌─────────────┐  │
    │  │  Subnet 1   │  │      │  Subnet 2   │               │  │  Subnet 3   │  │
    │  │  10.0.1.0/24│  │      │  10.0.2.0/24│               │  │  10.0.3.0/24│  │
    │  │             │  │      │             │               │  │             │  │
    │  │  ┌────────┐ │  │      │  ┌────────┐ │               │  │  ┌────────┐ │  │
    │  │  │  SG    │ │  │      │  │  SG    │ │               │  │  │  SG    │ │  │
    │  │  │ ┌────┐ │ │  │      │  │ ┌────┐ │ │               │  │  │ ┌────┐ │ │  │
    │  │  │ │VSI │ │ │  │      │  │ │VSI │ │ │               │  │  │ │VSI │ │ │  │
    │  │  │ └────┘ │ │  │      │  │ └────┘ │ │               │  │  │ └────┘ │ │  │
    │  │  └────────┘ │  │      │  └────────┘ │               │  │  └────────┘ │  │
    │  └─────────────┘  │      └─────────────┘               │  └─────────────┘  │
    │         ↓         │             ↓                       │         ↓         │
    │  ┌─────────────┐  │      ┌─────────────┐               │  ┌─────────────┐  │
    │  │Public       │  │      │Public       │               │  │Public       │  │
    │  │Gateway      │  │      │Gateway      │               │  │Gateway      │  │
    │  └─────────────┘  │      └─────────────┘               │  └─────────────┘  │
    └───────────────────┴─────────────────────────────────────┴───────────────────┘
                                        ↓
                                  ┌──────────┐
                                  │ Internet │
                                  └──────────┘
```

> **Legend:**
> - **VPC**: Regional container spanning all zones
> - **Subnets**: Zonal resources where workloads attach
> - **SG**: Security Groups (workload-level firewall)
> - **VSI**: Virtual Server Instance (compute resource)

### Resources That Belong to a VPC

Every resource eventually belongs to a VPC:
- Subnets
- Security groups
- Route tables
- VPN connections
- Public gateways
- Compute resources (VSIs, containers, etc.)

**Without a VPC**, IBM Cloud workloads cannot communicate privately because there is no isolated networking scope available.

---

## Regional Architecture

The IBM Cloud VPC service is **regional**. A region is a large geographic area such as:

| Region Code | Location |
|-------------|----------|
| `us-south` | Dallas, USA |
| `us-east` | Washington DC, USA |
| `eu-de` | Frankfurt, Germany |
| `eu-gb` | London, UK |
| `jp-tok` | Tokyo, Japan |
| `au-syd` | Sydney, Australia |

### Availability Zones

Inside every region are multiple **availability zones**. These zones are physically separate datacenters connected using IBM's private backbone network infrastructure.

**Example:** The `us-south` region contains:
- `us-south-1`
- `us-south-2`
- `us-south-3`

### Zone Independence

Each zone has independent:
- ⚡ Power systems
- ❄️ Cooling systems
- 🌐 Networking hardware
- 💻 Compute infrastructure

### Purpose of Multi-Zone Architecture

This architecture exists to provide:
- **High availability** - Continue operating during failures
- **Fault tolerance** - Isolate failures to single zones
- **Disaster recovery** - Survive datacenter-level incidents

If one datacenter experiences failure, workloads in the other zones continue functioning. IBM Cloud VPC networking automatically spans these zones using distributed regional networking.

---

## Subnets and Zonal Placement

When a user creates subnets inside a VPC, those subnets are attached to specific zones.

### Critical Concept

This is an extremely important beginner concept:
- ✅ **The VPC itself spans the region** (regional resource)
- ✅ **Actual workloads are created inside zonal subnets** (zonal resources)

This means workloads physically exist in datacenters even though the network abstraction appears regional.

### Example Architecture

```
VPC: prod-vpc (Regional)
├── us-south-1
│   ├── app-subnet-1 (10.0.1.0/24)
│   └── db-subnet-1 (10.0.4.0/24)
├── us-south-2
│   ├── app-subnet-2 (10.0.2.0/24)
│   └── db-subnet-2 (10.0.5.0/24)
└── us-south-3
    ├── app-subnet-3 (10.0.3.0/24)
    └── db-subnet-3 (10.0.6.0/24)
```

---

## CIDR Planning Fundamentals

Every VPC requires IP address ranges. IBM Cloud VPC networking uses private RFC1918 address spaces.

### Private IP Ranges

| CIDR Block | Address Range | Total IPs |
|------------|---------------|-----------|
| `10.0.0.0/8` | 10.0.0.0 - 10.255.255.255 | 16,777,216 |
| `172.16.0.0/12` | 172.16.0.0 - 172.31.255.255 | 1,048,576 |
| `192.168.0.0/16` | 192.168.0.0 - 192.168.255.255 | 65,536 |

### Example VPC CIDR

```
VPC CIDR: 10.0.0.0/16 (65,536 addresses)
```

This range is then subdivided into smaller subnet CIDRs:

```
Management Subnet: 10.0.1.0/24 (256 addresses)
Application Subnet: 10.0.2.0/24 (256 addresses)
Database Subnet: 10.0.3.0/24 (256 addresses)
```

### Why CIDR Planning Matters

Each subnet represents a smaller isolated network segment. IBM internally maps these CIDRs to distributed routing tables so packets can be directed correctly across the infrastructure.

⚠️ **Good CIDR planning is extremely important** because overlapping networks later cause:
- VPN failures
- Transit Gateway conflicts
- Kubernetes networking issues
- Hybrid cloud routing problems

---

## Subnets: Where Workloads Connect

Subnets are where actual workloads connect to the network. A subnet is essentially a logically isolated IP segment within the VPC.

### 📊 VPC Features Comparison

| Feature | Traditional Datacenter | IBM Cloud VPC Gen2 |
|---------|------------------------|-------------------|
| **Network Type** | Layer-2 VLAN-based | Layer-3 routed |
| **Broadcast Domains** | Required | Not required |
| **Infrastructure** | Physical switches | Software-defined |
| **Forwarding** | MAC learning | IP-based routing |
| **Scalability** | Hardware limited | Software scalable |
| **Provisioning Time** | Weeks/months | Minutes |
| **Multi-zone Support** | Manual setup | Built-in |
| **Security** | Hardware firewalls | Software SG + ACLs |
| **Cost Model** | CapEx (purchase) | OpEx (pay-as-you-go) |
| **Global Reach** | Complex/expensive | Multi-region ready |

### Traditional vs Cloud Subnets

| Traditional Datacenter | IBM Cloud VPC |
|------------------------|---------------|
| Layer-2 VLAN-based | Layer-3 routed |
| Broadcast domains | No broadcast dependency |
| Physical switches | Software-defined routing |
| MAC learning | IP-based forwarding |

In IBM Cloud VPC, subnets are **software-defined layer-3 routed constructs**. There is no traditional broadcast-domain dependency exposed to the user. IBM internally handles routing using distributed software routers rather than customer-managed hardware switches.

### Workload Attachment

Every compute resource attaches to a subnet through a network interface card:

| Resource Type | Attachment Method |
|---------------|-------------------|
| VSI | Network interface (eth0) |
| OpenShift worker | Worker interface |
| Load balancer | Frontend interface |
| Virtual appliance | Virtual NIC |

When traffic reaches a subnet, IBM Cloud determines which workload owns the destination IP and forwards traffic internally through the VPC routing fabric.

---

## Internet Connectivity

One of the biggest beginner misconceptions is around internet connectivity.

### Default Behavior

⚠️ **By default, workloads inside IBM Cloud VPC are private.** They cannot access the internet automatically.

Internet access requires additional services:
- Public Gateways
- Floating IPs
- Load Balancers

### Public Gateway (Outbound Only)

A Public Gateway is primarily used for **outbound internet connectivity**. IBM internally implements scalable NAT infrastructure for this service.

**Traffic Flow:**
```
Private VSI (10.0.2.15)
        ↓
Public Gateway (NAT)
        ↓
Internet
```

**Use Cases:**
- ✅ Install packages
- ✅ Download updates
- ✅ Access external APIs
- ✅ Pull container images

**Important:** The workload still remains inaccessible from the internet directly. Public Gateway enables outbound communication only.

### Inbound Internet Access

Inbound internet access requires either:

#### Option 1: Floating IP
- Directly maps a public IP to a workload interface
- Creates direct internet exposure
- ⚠️ Security risk - use sparingly
- Common for bastion hosts only

#### Option 2: Public Load Balancer (Recommended)
- Controlled entry point with health checks
- Distributes traffic across backend servers
- SSL/TLS termination
- ✅ Better security
- ✅ High availability
- ✅ Scalability

**Enterprise Best Practice:** Use Load Balancers instead of Floating IPs for production workloads.

---

## Traffic Filtering: Two Security Layers

IBM Cloud VPC networking uses two major security layers working together.

### Layer 1: Network ACLs (Subnet-Level)

| Characteristic | Description |
|----------------|-------------|
| **Scope** | Subnet boundary |
| **Type** | Stateless firewall |
| **Evaluation** | Every packet independently |
| **Return Traffic** | Requires explicit rules |
| **Use Case** | Coarse-grained subnet protection |

**What ACLs Check:**
- Source IP
- Destination IP
- Protocol (TCP/UDP/ICMP)
- Port
- Direction (inbound/outbound)

### Layer 2: Security Groups (Workload-Level)

| Characteristic | Description |
|----------------|-------------|
| **Scope** | Network interface (NIC) |
| **Type** | Stateful firewall |
| **Evaluation** | Connection-aware |
| **Return Traffic** | Automatic |
| **Use Case** | Fine-grained workload protection |

**Key Difference:** Security Groups automatically track connection state. If inbound traffic is allowed, return traffic is automatically permitted.

### 🔒 Comprehensive ACL vs Security Groups Comparison

| Feature | Network ACL | Security Group |
|---------|-------------|----------------|
| **Stateful** | ❌ No (Stateless) | ✅ Yes (Stateful) |
| **Applies to** | Subnet boundary | Network interface (NIC) |
| **Rule order** | ✅ Yes (sequential) | ❌ No (all evaluated) |
| **Return traffic** | Manual rules required | Automatic tracking |
| **Granularity** | Coarse (subnet-level) | Fine (per-workload) |
| **Default behavior** | Allow all | Deny all |
| **Rule limit** | 100 per ACL | 25 per security group |
| **Direction** | Inbound + Outbound | Inbound + Outbound |
| **Protocol support** | TCP, UDP, ICMP, ALL | TCP, UDP, ICMP, ALL |
| **Source/Dest** | IP addresses/CIDR | IP, CIDR, or SG reference |
| **Use case** | Subnet protection | Workload protection |
| **Best for** | Broad network policies | Application-specific rules |
| **Performance impact** | Minimal | Minimal |
| **Modification scope** | Affects all subnet resources | Affects specific workloads |

---

## Traffic Flow Hierarchy

Traffic inside IBM Cloud VPC generally follows this layered path:

```
External Source (Internet/VPN/TGW)
            ↓
    Public Gateway / VPN / TGW
            ↓
    VPC Routing Domain
            ↓
        Route Table
            ↓
          Subnet
            ↓
      Network ACL ← Stateless filtering
            ↓
    Security Group ← Stateful filtering
            ↓
    Compute Resource
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| **VPC** | Isolation boundaries |
| **Route Tables** | Packet path decisions |
| **Subnets** | Workload segmentation |
| **ACLs** | Subnet filtering |
| **Security Groups** | Workload protection |

---

## Routing Fundamentals

IBM Cloud VPC maintains distributed route tables internally. Whenever traffic arrives, the route table determines the next hop.

### Example Routes

| Destination | Next Hop | Purpose |
|-------------|----------|---------|
| `0.0.0.0/0` | Public Gateway | Internet traffic |
| `10.0.0.0/16` | Local | VPC internal traffic |
| `192.168.0.0/16` | VPN Gateway | On-premises traffic |
| `10.20.0.0/16` | Transit Gateway | Other VPC traffic |

**Without valid routes, packets are dropped.** Routing essentially determines where traffic travels.

---

## Hybrid Cloud Connectivity

Hybrid cloud environments introduce VPN and Transit Gateway architectures.

### VPN Gateways

**Purpose:** Create encrypted IPSec tunnels between on-premises datacenters and IBM Cloud VPC networks.

**Use Cases:**
- Connect corporate datacenters
- Secure remote access
- Disaster recovery connectivity
- Migration workloads

### Transit Gateways

**Purpose:** Provide centralized routing between multiple VPCs and external networks.

**Use Cases:**
- Multi-VPC connectivity
- Hub-and-spoke architectures
- Shared services
- Centralized security inspection

### Enterprise Architecture Pattern

```
                Transit Gateway
                /      |      \
               /       |       \
              /        |        \
    Management    Production   Observability
        VPC          VPC            VPC
         |            |              |
         |            |              |
    VPN Gateway      |              |
         |            |              |
    On-Premises   Internet      Monitoring
    Datacenter    Traffic         Tools
```

Large enterprises often build hub-and-spoke architectures where management, security, observability, and workloads exist in separate VPCs connected through Transit Gateway services.

---

## DNS Services

DNS is another hidden but extremely important networking component.

### Purpose

IBM Cloud DNS services allow workloads to resolve private service names internally. Without DNS, applications would require hardcoded IP addresses.

### Critical For

- 🔧 Kubernetes service discovery
- 🔧 OpenShift routing
- 🔧 Microservices communication
- 🔧 Enterprise service discovery architectures

---

## Virtual Private Endpoints (VPE)

Modern IBM Cloud architectures also heavily rely on **Virtual Private Endpoints (VPE)**.

### What VPE Provides

VPE allows workloads to privately access IBM Cloud services such as:
- Cloud Object Storage
- Secrets Manager
- Container Registry
- Key Protect
- Databases

**without traversing the public internet.**

### Benefits

- ✅ Traffic stays inside IBM's private backbone network
- ✅ No public internet exposure
- ✅ Better security
- ✅ Lower latency
- ✅ Compliance-friendly

This is critical for regulated environments such as:
- FSCloud
- FedRAMP deployments
- HIPAA workloads
- PCI-DSS environments

---

## Observability: Flow Logs

Finally, observability becomes essential for production environments.

### What Flow Logs Capture

IBM Flow Logs capture network metadata such as:

| Field | Description |
|-------|-------------|
| Source IP | Who sent traffic |
| Destination IP | Who received traffic |
| Protocol | TCP/UDP/ICMP |
| Port | Communication port |
| Status | Accepted or rejected |
| Interface | Which NIC used |
| Timestamp | When traffic occurred |

### Use Cases

These logs are exported to services such as Cloud Object Storage and SIEM platforms for:
- 🔍 Auditing
- 📋 Compliance validation
- 🚨 Incident investigation
- 🛡️ Threat analysis
- 🔧 Troubleshooting

---

## The terraform-ibm-landing-zone-vpc Module

The terraform-ibm-landing-zone-vpc module automates creation of this entire networking ecosystem.

### What the Module Defines

The variables inside the module define the blueprint for:

| Category | Components |
|----------|------------|
| **Segmentation** | VPCs, subnets, zones |
| **Routing** | Route tables, gateways |
| **Security** | ACLs, security groups |
| **Connectivity** | VPNs, Transit Gateway |
| **Internet** | Public gateways, floating IPs |
| **Observability** | Flow logs, monitoring |
| **Services** | DNS, VPE |

### How It Works

Terraform then converts these variables into actual IBM Cloud infrastructure resources through APIs. The module is essentially an **enterprise network factory** that programmatically builds secure cloud networking foundations.

---
## 🔧 Terraform Implementation

### VPC Resource Creation

The `terraform-ibm-landing-zone-vpc` module creates VPC resources using the following Terraform code:

**File:** [`main.tf`](https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone-vpc/blob/main/main.tf)

```terraform
##############################################################################
# Create new VPC
##############################################################################

resource "ibm_is_vpc" "vpc" {
  count          = var.create_vpc == true ? 1 : 0  # Conditional creation
  
  # Naming: Use prefix if provided, otherwise just the name
  name           = var.prefix != null ? "${var.prefix}-${var.name}" : var.name
  
  resource_group = var.resource_group_id
  
  # Address prefix management: "manual" if we're providing prefixes or subnets
  # "auto" (null) if IBM Cloud should manage it automatically
  address_prefix_management = (
    length([for prefix in values(coalesce(var.address_prefixes, {})) : prefix if prefix != null]) != 0
  ) || (
    length([for subnet in values(coalesce(var.subnets, {})) : subnet if subnet != null]) != 0
  ) ? "manual" : null
  
  # Default resource names (can be customized)
  default_network_acl_name    = var.default_network_acl_name
  default_security_group_name = var.default_security_group_name
  default_routing_table_name  = var.default_routing_table_name
  
  # Tagging for organization and cost tracking
  tags        = var.tags
  access_tags = var.access_tags
  
  # Clean default security group and ACL rules if requested
  no_sg_acl_rules = var.clean_default_sg_acl

  # Lifecycle validation: Ensures VPC region matches var.region
  lifecycle {
    postcondition {
      # Extract region from CRN using regex
      condition = regex(
        "^crn(\\:\\w+\\:\\w+\\:\\w+\\:\\w+)\\:([\\w-\\.]+)\\:\\w\\/([\\w-\\.]*\\:[\\w-\\.]*\\:[\\w-\\.]*\\:)[\\w-\\.]*$",
        self.crn
      )[1] == var.region
      
      error_message = "The region in the VPC CRN and the region specified in `var.region` must be the same"
    }
  }

  # DNS Configuration Block
  dns {
    enable_hub = var.enable_hub  # Enable this VPC as a DNS hub
    
    # Dynamic resolver configuration based on type
    dynamic "resolver" {
      for_each = var.resolver_type != null ? [1] : []
      content {
        type = var.resolver_type  # "delegated", "manual", or "system"
        # Additional resolver configuration...
      }
    }
  }
}
```

### Key Implementation Details

#### 1. Conditional Creation
```terraform
count = var.create_vpc == true ? 1 : 0
```
- Allows the module to work with existing VPCs
- When `create_vpc = false`, uses `var.existing_vpc_id` instead

#### 2. Address Prefix Management
```terraform
address_prefix_management = (
  length([for prefix in values(coalesce(var.address_prefixes, {})) : prefix if prefix != null]) != 0
) || (
  length([for subnet in values(coalesce(var.subnets, {})) : subnet if subnet != null]) != 0
) ? "manual" : null
```
- **"manual"**: When you provide explicit address prefixes or subnets
- **"auto" (null)**: When IBM Cloud should auto-generate prefixes
- This automatic detection prevents configuration errors

#### 3. Lifecycle Postcondition
```terraform
lifecycle {
  postcondition {
    condition = regex("...", self.crn)[1] == var.region
    error_message = "The region in the VPC CRN and the region specified in `var.region` must be the same"
  }
}
```
- **Validates at plan time** that the VPC region matches the configured region
- Prevents deployment errors caused by provider/variable mismatches
- Uses regex to extract region from the VPC's CRN

#### 4. DNS Configuration
```terraform
dns {
  enable_hub = var.enable_hub
  dynamic "resolver" {
    for_each = var.resolver_type != null ? [1] : []
    content {
      type = var.resolver_type
    }
  }
}
```
- Supports three resolver types: **delegated** (hub-spoke), **manual** (custom DNS), **system** (IBM default)
- Uses `dynamic` blocks for conditional configuration
- See [`hub-spoke-dns-architecture.md`](hub-spoke-dns-architecture.md) for details

### Local Values for VPC Reference

```terraform
locals {
  # Determine which VPC ID to use throughout the module
  vpc_id   = var.create_vpc ? resource.ibm_is_vpc.vpc[0].id : var.existing_vpc_id
  vpc_name = var.create_vpc ? resource.ibm_is_vpc.vpc[0].name : data.ibm_is_vpc.vpc.name
  vpc_crn  = var.create_vpc ? resource.ibm_is_vpc.vpc[0].crn : data.ibm_is_vpc.vpc.crn
}
```

**Why locals?**
- Provides a single source of truth for VPC identifiers
- Simplifies conditional logic in other resources
- All downstream resources reference `local.vpc_id` instead of conditional expressions

### Usage Example

```terraform
module "vpc" {
  source = "terraform-ibm-modules/landing-zone-vpc/ibm"
  
  # Basic Configuration
  create_vpc        = true
  name              = "production"
  prefix            = "acme"
  region            = "us-south"
  resource_group_id = "abc123..."
  
  # Address Management
  address_prefixes = {
    zone-1 = ["10.10.0.0/18"]
    zone-2 = ["10.10.64.0/18"]
    zone-3 = ["10.10.128.0/18"]
  }
  
  # DNS Configuration
  enable_hub    = false
  resolver_type = "system"
  
  # Tagging
  tags = ["env:prod", "team:platform"]
}
```

**Result:** Creates a VPC named `acme-production` in `us-south` with manual address prefix management.

---


## Key Takeaways

### 1. VPC is a Container
The VPC is not infrastructure itself—it's the logical container that holds all your networking resources.

### 2. Everything is Software-Defined
No physical hardware is provisioned for you. Everything runs on shared infrastructure with software-based isolation.

### 3. Regional with Zonal Workloads
VPCs span regions, but workloads run in specific zones for high availability.

### 4. Private by Default
Workloads are private unless you explicitly add internet connectivity through gateways or load balancers.

### 5. Layered Security
Use both ACLs (subnet-level) and Security Groups (workload-level) for defense in depth.

### 6. Plan Your CIDRs Carefully
Bad IP planning causes problems later with VPNs, Transit Gateway, and Kubernetes.

### 7. Observability is Essential
Flow logs and monitoring are not optional—they're critical for security and troubleshooting.

## 📝 Knowledge Check: Test Your Understanding

Test your knowledge of IBM Cloud VPC foundations with these questions, progressing from basic concepts to advanced scenarios.

---

### Easy Level Questions

??? question "1. What does VPC stand for?"
    - [ ] Virtual Private Connection
    - [x] Virtual Private Cloud
    - [ ] Virtual Public Cloud
    - [ ] Virtual Protected Container

    **Explanation:** VPC stands for Virtual Private Cloud - a logically isolated network environment in the cloud.

??? question "2. What is the primary purpose of a VPC?"
    - [ ] To provide physical servers
    - [x] To create an isolated network environment
    - [ ] To store data
    - [ ] To manage user accounts

    **Explanation:** A VPC creates a logically isolated software-defined network for your cloud resources.

??? question "3. In traditional datacenters, what type of infrastructure was used for networking?"
    - [x] Hardware-based (routers, switches, firewalls)
    - [ ] Software-only solutions
    - [ ] Cloud-based services
    - [ ] Virtual machines

    **Explanation:** Traditional datacenters relied entirely on physical hardware like routers, switches, and firewalls.

??? question "4. What is the default internet connectivity for workloads in IBM Cloud VPC?"
    - [ ] Full internet access
    - [ ] Inbound only
    - [ ] Outbound only
    - [x] No internet access (private by default)

    **Explanation:** By default, workloads in IBM Cloud VPC are private and cannot access the internet without additional services.

??? question "5. Which RFC1918 address range provides the most IP addresses?"
    - [x] 10.0.0.0/8 (16,777,216 addresses)
    - [ ] 172.16.0.0/12 (1,048,576 addresses)
    - [ ] 192.168.0.0/16 (65,536 addresses)
    - [ ] All provide the same number

    **Explanation:** The 10.0.0.0/8 range provides 16,777,216 addresses, the largest of the three private ranges.

---

### Medium Level Questions

??? question "6. What is the scope of an IBM Cloud VPC?"
    - [ ] Global (spans all regions)
    - [x] Regional (spans one region)
    - [ ] Zonal (limited to one zone)
    - [ ] Account-wide

    **Explanation:** A VPC is a regional resource that spans all availability zones within a single region.

??? question "7. Where do actual workloads physically run in a VPC?"
    - [ ] At the VPC level
    - [ ] At the regional level
    - [x] In zonal subnets
    - [ ] In the cloud globally

    **Explanation:** While VPCs are regional, actual workloads run in specific availability zones within subnets.

??? question "8. What technology does IBM Cloud use to create virtual networks?"
    - [ ] Physical VLANs
    - [ ] Hardware switches
    - [x] Software-Defined Networking (SDN)
    - [ ] Traditional routing protocols

    **Explanation:** IBM Cloud uses SDN technologies like VXLAN encapsulation and distributed virtual routers.

??? question "9. What is the main difference between Network ACLs and Security Groups?"
    - [ ] ACLs are faster
    - [x] ACLs are stateless, Security Groups are stateful
    - [ ] Security Groups are subnet-level
    - [ ] They are the same thing

    **Explanation:** Network ACLs are stateless (require explicit return rules), while Security Groups are stateful (automatically allow return traffic).

??? question "10. Which service provides outbound-only internet access?"
    - [ ] Floating IP
    - [x] Public Gateway
    - [ ] Load Balancer
    - [ ] VPN Gateway

    **Explanation:** Public Gateway provides outbound internet connectivity through NAT, but workloads remain inaccessible from the internet.

??? question "11. Can two different customers use the same CIDR range (e.g., 10.0.0.0/16) in their VPCs?"
    - [x] Yes, VPCs are isolated through software-defined segmentation
    - [ ] No, CIDR ranges must be globally unique
    - [ ] Only if they're in different regions
    - [ ] Only with special permission

    **Explanation:** VPCs remain completely isolated through software-defined network segmentation, even with identical CIDR ranges.

??? question "12. What type of subnet architecture does IBM Cloud VPC Gen2 use?"
    - [ ] Layer-2 VLAN-based
    - [x] Layer-3 routed
    - [ ] Layer-4 application-based
    - [ ] Hybrid Layer-2/Layer-3

    **Explanation:** IBM Cloud VPC Gen2 uses Layer-3 routed subnets, not traditional Layer-2 VLAN-based subnets.

---

### Hard Level Questions

??? question "13. Why is careful CIDR planning critical in IBM Cloud VPC?"
    - [ ] To save IP addresses
    - [ ] To improve performance
    - [x] To avoid conflicts with VPNs, Transit Gateway, and Kubernetes networking
    - [ ] To reduce costs

    **Explanation:** Poor CIDR planning causes routing conflicts with VPNs, Transit Gateway connections, Kubernetes pod networks, and hybrid cloud scenarios.

??? question "14. In a multi-zone VPC architecture, what happens if one availability zone fails?"
    - [ ] The entire VPC becomes unavailable
    - [ ] All zones restart automatically
    - [x] Workloads in other zones continue functioning
    - [ ] Traffic is automatically rerouted to remaining zones

    **Explanation:** Each zone has independent infrastructure. If one fails, workloads in other zones continue operating, but automatic failover requires proper application architecture.

??? question "15. What is the recommended approach for production workload internet access?"
    - [ ] Assign Floating IPs to all servers
    - [ ] Use Public Gateway for all traffic
    - [x] Use Public Load Balancers with backend servers
    - [ ] Disable internet access completely

    **Explanation:** Public Load Balancers provide controlled entry points with health checks, SSL termination, and better security than direct Floating IPs.

??? question "16. When Terraform creates a VPC, what actually happens in IBM Cloud?"
    - [ ] Physical hardware is installed
    - [ ] A dedicated router is provisioned
    - [x] A logical routing domain is allocated in the distributed control plane
    - [ ] A new datacenter is created

    **Explanation:** IBM allocates a virtual routing domain in its software-defined networking control plane - no physical hardware is provisioned.

??? question "17. Which statement about Network ACL rule evaluation is correct?"
    - [ ] All rules are evaluated simultaneously
    - [x] Rules are evaluated sequentially in order
    - [ ] Only the first matching rule is applied
    - [ ] Rules are evaluated randomly

    **Explanation:** Network ACL rules are evaluated sequentially in order, and the first matching rule determines the action.

??? question "18. What is the primary difference between traditional datacenter subnets and IBM Cloud VPC subnets?"
    - [ ] VPC subnets are slower
    - [ ] Traditional subnets are more secure
    - [x] VPC subnets are software-defined Layer-3 constructs without broadcast domain dependency
    - [ ] There is no difference

    **Explanation:** IBM Cloud VPC subnets are Layer-3 routed constructs managed by distributed software routers, not Layer-2 broadcast domains.

??? question "19. In the us-south region with zones us-south-1, us-south-2, and us-south-3, where does a VPC exist?"
    - [ ] Only in us-south-1
    - [ ] In whichever zone you choose
    - [x] Spans all three zones (regional resource)
    - [ ] In a separate management zone

    **Explanation:** VPCs are regional resources that automatically span all availability zones in the region.

??? question "20. What is the correct security architecture for defense in depth?"
    - [ ] Use only Security Groups
    - [ ] Use only Network ACLs
    - [x] Use both Network ACLs (subnet-level) and Security Groups (workload-level)
    - [ ] Use Floating IPs with firewalls

    **Explanation:** Defense in depth requires layered security: Network ACLs for coarse-grained subnet protection and Security Groups for fine-grained workload protection.

---

### Expert Level Questions

??? question "21. A company needs to connect their VPC (10.0.0.0/16) to an on-premises datacenter (10.0.0.0/16). What is the problem?"
    - [ ] No problem, VPCs are isolated
    - [ ] The connection will be slow
    - [x] Overlapping CIDR ranges will cause routing conflicts
    - [ ] It requires special IBM approval

    **Explanation:** Overlapping CIDR ranges between VPC and on-premises networks cause routing conflicts. While VPCs are isolated from each other, VPN/Transit Gateway connections require non-overlapping address spaces.

??? question "22. An application in subnet 10.0.1.0/24 needs to access a database in subnet 10.0.2.0/24 within the same VPC. What is required?"
    - [ ] A VPN connection
    - [ ] A Public Gateway
    - [ ] A Load Balancer
    - [x] Proper Security Group and ACL rules allowing the traffic

    **Explanation:** Traffic within a VPC is routed automatically, but Security Groups and Network ACLs must permit the traffic between subnets.

??? question "23. What happens to return traffic in a stateless Network ACL?"
    - [ ] It's automatically allowed
    - [ ] It's automatically blocked
    - [x] It requires explicit allow rules for both directions
    - [ ] It uses a different path

    **Explanation:** Stateless ACLs don't track connections, so you must explicitly allow both inbound and outbound traffic for bidirectional communication.

??? question "24. A VSI with a Public Gateway can access the internet. Can the internet access the VSI directly?"
    - [ ] Yes, through the Public Gateway
    - [x] No, Public Gateway only provides outbound NAT
    - [ ] Yes, but only on specific ports
    - [ ] Yes, if Security Groups allow it

    **Explanation:** Public Gateway provides outbound-only connectivity through NAT. The VSI remains inaccessible from the internet. Inbound access requires Floating IP or Load Balancer.

??? question "25. Why does IBM Cloud VPC use distributed virtual routers instead of centralized hardware routers?"
    - [ ] To reduce costs
    - [ ] To simplify management
    - [x] To provide scalability, eliminate single points of failure, and enable software-defined control
    - [ ] To improve security

    **Explanation:** Distributed virtual routers provide horizontal scalability, eliminate single points of failure, enable instant provisioning, and allow software-defined network control at scale.

---

### Scoring Guide

- **20-25 correct**: 🏆 **Expert** - You have mastered VPC foundations!
- **15-19 correct**: 🌟 **Advanced** - Strong understanding, review missed topics
- **10-14 correct**: 📚 **Intermediate** - Good foundation, continue learning
- **5-9 correct**: 🌱 **Beginner** - Review the material and try again
- **0-4 correct**: 📖 **Start Here** - Read through the guide carefully

---

---

## Next Steps

Now that you understand the VPC foundation, continue to:

- **[VPC Service Internals](02-vpc-service-internals.md)** - Deep dive into how VPCs work internally
- **[Zones and Datacenter Architecture](03-zones-datacenter-architecture.md)** - Understand physical infrastructure
- **[CIDR Planning and IPAM](04-cidr-planning-ipam.md)** - Master IP address planning

---

[← Back to Main Guide](README.md) | [Next: VPC Service Internals →](vpc-service-internals.md)
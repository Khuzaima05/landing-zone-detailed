# 🌉 Transit Gateway Integration — Overview

[← Previous: Hub-Spoke DNS Architecture](./hub-spoke-dns-architecture.md) | [Index](./README.md) | [Next: Floating IP Architecture →](./floating-ip-architecture.md)

---

> 📌 **NOTE**: Transit Gateway is **separate infrastructure** managed independently from VPC. This document covers integration patterns between VPC and Transit Gateway for multi-VPC connectivity.

---

## 📋 Overview

As cloud environments grow, enterprises typically deploy multiple VPCs for segmentation, security, and organizational boundaries. Transit Gateway provides centralized connectivity between these VPCs and external networks.

### Key Concepts

**What Transit Gateway Does:**
- Connects multiple VPCs through a central hub
- Provides centralized routing between networks
- Enables hub-and-spoke architectures
- Simplifies multi-VPC connectivity

**Why It Matters:**
- Avoids complex mesh networking
- Centralizes network management
- Enables shared services architectures
- Scales efficiently

---

## 🎯 What Is Transit Gateway

Transit Gateway is:
> **A centralized network interconnect service that connects multiple VPCs and external networks**

### Architecture Pattern

```
              Transit Gateway
              /      |      \
             /       |       \
            /        |        \
    Management   Production   Observability
        VPC          VPC          VPC
```

**Instead of connecting every VPC to every other VPC**, all VPCs connect to one central gateway.

---

## 🔗 VPC Integration Points

### How VPCs Connect to Transit Gateway

**VPC Attachment:**
```
VPC
  ↓
Attachment
  ↓
Transit Gateway
```

**VPC Route Tables:**
```
Destination: 10.20.0.0/16
Next Hop: Transit Gateway
```

### What VPC Module Provides

The terraform-ibm-landing-zone-vpc module creates:

**VPC Module Handles:**
- VPC creation
- Subnet configuration
- Route table management
- Routes pointing to Transit Gateway

**Transit Gateway Module Handles:**
- Transit Gateway creation
- VPC attachments
- Route propagation
- Connection management

---

## 🏗️ Hub-and-Spoke Architecture

### Common Enterprise Pattern

```
                Transit Gateway (Hub)
                /       |        \
               /        |         \
              /         |          \
      Management    Production   Development
          VPC          VPC           VPC
       (Spoke)      (Spoke)       (Spoke)
```

### Benefits

- ✅ Centralized routing
- ✅ Simplified management
- ✅ Easy scaling (add new VPCs)
- ✅ Shared services architecture
- ✅ Reduced complexity

---

## 🔄 Traffic Flow

### Cross-VPC Communication

```
Application in VPC A
        ↓
VPC A Route Table
        ↓
Transit Gateway
        ↓
VPC B Route Table
        ↓
Service in VPC B
```

**Key Point:** Both routing and attachment are required for connectivity.

---

## 🎯 Common Use Cases

### 1. Shared Services

```
Shared Services VPC
├── DNS
├── Monitoring
├── Logging
└── Security Tools
        ↓
Transit Gateway
        ↓
All Workload VPCs
```

### 2. Environment Segmentation

```
Production VPC
Development VPC
Testing VPC
        ↓
Transit Gateway
        ↓
Management VPC
```

### 3. Multi-Region Connectivity

```
US Region VPCs
        ↓
Transit Gateway
        ↓
EU Region VPCs
```

### 4. Hybrid Cloud

```
On-Premises Network
        ↓
VPN/Direct Link
        ↓
Transit Gateway
        ↓
Cloud VPCs
```

---

## 🆚 Transit Gateway vs VPN

| Feature | Transit Gateway | VPN |
|---------|----------------|-----|
| **Purpose** | VPC-to-VPC connectivity | External/on-prem connectivity |
| **Scope** | Cloud-native | Hybrid cloud |
| **Performance** | High | Moderate |
| **Use Case** | Multi-VPC architecture | On-premises integration |

**Note:** Transit Gateway can also integrate VPN connections for hybrid scenarios.

---

## 🆚 Transit Gateway vs VPC Peering

| Feature | Transit Gateway | VPC Peering |
|---------|----------------|-------------|
| **Scalability** | Many VPCs | Two VPCs only |
| **Architecture** | Hub-and-spoke | Point-to-point |
| **Management** | Centralized | Distributed |
| **Enterprise Use** | Preferred | Limited |

---

## 🔧 VPC Module Integration

### Terraform Configuration

**VPC Module Variables:**
```hcl
# Enable Transit Gateway integration
enable_transit_gateway = true

# Transit Gateway ID
transit_gateway_id = "tgw-xxxxx"

# Routes to other VPCs
transit_gateway_connections = [
  {
    vpc_id = "vpc-other"
    routes = ["10.20.0.0/16"]
  }
]
```

### What Gets Created

**VPC Module Creates:**
- Routes pointing to Transit Gateway
- Route table associations
- Network connectivity configuration

**Transit Gateway Module Creates:**
- Transit Gateway resource
- VPC attachments
- Route propagation rules

---

## ⚠️ Important Considerations

### 1. Routing Is Critical

**Transit Gateway attachment alone is NOT enough.**

You must also configure:
```
VPC Route Tables → Transit Gateway
```

### 2. CIDR Planning

**Avoid overlapping IP ranges:**
```
VPC A: 10.10.0.0/16
VPC B: 10.20.0.0/16  ✅ No overlap
VPC C: 10.10.0.0/16  ❌ Overlaps with VPC A
```

### 3. Security Still Applies

Transit Gateway provides connectivity, but:
- Security Groups still filter traffic
- Network ACLs still apply
- Proper segmentation still required

---

## 🏢 Enterprise Architecture Pattern

### Typical Design

```
                Transit Gateway
                /      |      \
               /       |       \
              /        |        \
      Management   Production   Observability
          VPC          VPC          VPC
           |            |            |
      Bastion      Load Balancer  Monitoring
       Host         Applications    Tools
```

### Shared Services Pattern

```
Hub VPC (Shared Services)
├── DNS Resolvers
├── Monitoring
├── Logging
├── Security Tools
└── Management Tools
        ↓
Transit Gateway
        ↓
Spoke VPCs (Workloads)
├── Production
├── Development
└── Testing
```

---

## 💡 Best Practices

### 1. Plan IP Addressing

```
Allocate non-overlapping CIDR blocks
Document IP allocation strategy
Reserve space for future VPCs
```

### 2. Centralize Shared Services

```
Create dedicated shared services VPC
Connect all workload VPCs via Transit Gateway
Reduce duplication
```

### 3. Implement Proper Segmentation

```
Separate environments (prod/dev/test)
Use Security Groups and ACLs
Apply least privilege
```

### 4. Document Architecture

```
Maintain network diagrams
Document routing decisions
Track VPC attachments
```

### 5. Monitor Connectivity

```
Enable flow logs
Monitor Transit Gateway metrics
Alert on connectivity issues
```

---

## 🔑 Key Takeaways

### 1. Transit Gateway Is Separate Infrastructure

Not part of VPC module, but integrates with VPC networking.

### 2. Enables Multi-VPC Architecture

Essential for enterprise-scale cloud deployments.

### 3. Requires Both Attachment and Routing

Connectivity needs Transit Gateway attachment AND route table configuration.

### 4. Hub-and-Spoke Is Common Pattern

Centralizes connectivity and simplifies management.

### 5. Plan IP Addressing Carefully

Overlapping CIDRs cause routing conflicts.

---

## 📚 Related Resources

- **VPC Route Tables**: Configure routes to Transit Gateway
- **Hub-Spoke DNS Architecture**: DNS resolution across VPCs
- **CIDR Planning**: Avoid IP conflicts
- **Security Groups**: Cross-VPC traffic control

---

[← Previous: Hub-Spoke DNS Architecture](./hub-spoke-dns-architecture.md) | [Index](./README.md) | [Next: Floating IP Architecture →](./floating-ip-architecture.md)
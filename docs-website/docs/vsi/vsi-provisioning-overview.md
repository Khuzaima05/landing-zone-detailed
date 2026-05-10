# VSI Provisioning Overview

> Understanding the complete Virtual Server Instance provisioning flow in IBM Cloud VPC

---

## The VSI Provisioning Flow

The VSI provisioning flow in this module starts at the **account and resource scoping layer**, where `resource_group_id`, `prefix`, `tags`, and `access_tags` define ownership, naming, and governance boundaries. Every resource created—VSI, volumes, network interfaces—gets grouped under a specific resource group and inherits tagging for identification and access control. The prefix enforces consistent naming across all generated resources, ensuring uniqueness and traceability, while access_tags integrate with IAM to control who can operate on the deployed VSI resources.

The next layer is the **network attachment**, which is entirely dependent on pre-existing VPC infrastructure. The `vpc_id` anchors the VSI to a specific virtual network, and the `subnets` list determines exactly where instances are placed. Each subnet object includes id, zone, and optional CIDR, meaning the module distributes VSIs zone-wise. The variable `vsi_per_subnet` drives horizontal scaling: for each subnet provided, that number of VSI instances is created. This establishes the fundamental topology—multi-zone distribution for availability—where each VSI gets deployed inside a specific subnet and inherits its routing, gateway access, and network policies.

The complete flow is strictly layered: resource scoping defines ownership, VPC inputs define network placement, compute variables define the machine, storage variables attach persistence, networking variables expose and connect the instance, security variables restrict traffic, and optional integrations (load balancer, logging, monitoring) extend functionality. Each variable directly maps to a specific API call or resource configuration, and the module enforces constraints through validations to ensure the final VSI deployment is consistent, secure, and reproducible.

---

## Layered Architecture

The VSI infrastructure follows a strict 10-layer architecture:

```
Layer 1: Resource Scoping & Ownership
         ↓
Layer 2: Network Foundation
         ↓
Layer 3: Compute Instantiation
         ↓
Layer 4: Storage Configuration
         ↓
Layer 5: Instance-Level Networking
         ↓
Layer 6: Security Groups
         ↓
Layer 7: Advanced Networking (Secondary Interfaces)
         ↓
Layer 8: Load Balancer Integration
         ↓
Layer 9: Observability & Monitoring
         ↓
Layer 10: Lifecycle Management & Recovery
```

> **Rule:** Nothing skips layers. Each layer builds upon the previous one.

---

## Key Principles

### 1. Dependency Chain
Every VSI deployment follows this strict order:

```
Resource Group
    ↓
VPC
    ↓
Subnet
    ↓
Network Interface
    ↓
VSI
    ↓
Storage
    ↓
Security
    ↓
Public Exposure
    ↓
Observability
    ↓
Recovery
```

### 2. Resource Composition
A VSI is **NOT** just a VM. A VSI is:

```
Compute
  + Storage
  + Networking
  + Security
  + Routing
  + Persistence
  + Observability
  + Recovery

...inside a VPC
```

### 3. Independent Resources
Everything in cloud infrastructure is actually **independent resources attached together**:

```
VSI
 ├── NIC
 ├── Security Group
 ├── Boot Volume
 ├── Floating IP
 ├── SSH Keys
 ├── Monitoring Agent
 └── Load Balancer Membership
```

The VM is just the center attachment point.

---

## Terraform Mental Model

**Terraform does NOT create infrastructure directly.**

**Flow:**
```
Variables
   ↓
Terraform Module
   ↓
IBM Provider
   ↓
IBM Cloud APIs
   ↓
Actual Resources
```

Each variable in the module directly maps to a specific API call or resource configuration.

---

## Next Steps

Explore each layer in detail:

1. [Resource Scoping & Ownership](vsi-resource-scoping.md)
2. [Network Foundation](vsi-network-foundation.md)
3. [Compute Instantiation](vsi-compute-instantiation.md)
4. [Storage Configuration](vsi-storage-configuration.md)
5. [Instance Networking](vsi-instance-networking.md)
6. [Security Groups](vsi-security-groups.md)
7. [Secondary Interfaces](vsi-secondary-interfaces.md)
8. [Load Balancer Integration](vsi-load-balancer.md)
9. [Observability & Monitoring](vsi-observability.md)
10. [Lifecycle & Recovery](vsi-lifecycle-recovery.md)

---
# IBM Cloud VPC Infrastructure — Complete Guide

> **A comprehensive guide to understanding IBM Cloud Virtual Private Cloud (VPC) networking from the ground up**

---

## 📚 Guide Structure

This guide is organized into 15 comprehensive topics covering all aspects of IBM Cloud VPC infrastructure. Each topic is detailed in its own document for better readability and maintainability.

---

## 📑 Table of Contents

### Core Concepts

1. **[VPC Foundation](vpc-foundation.md)**
   - Understanding the problem cloud providers solve
   - What is a VPC and how it works
   - Regional architecture and availability zones
   - CIDR planning fundamentals
   - Internet connectivity basics
   - Traffic filtering overview

2. **[VPC Service Internals](vpc-service-internals.md)**
   - What Terraform actually does
   - Software Defined Networking (SDN)
   - Virtual network boundaries
   - Distributed routing domains
   - Overlay networking
   - Control plane vs data plane

3. **[Zones and Datacenter Architecture](zones-datacenter-architecture.md)**
   - Understanding regions vs zones
   - Physical infrastructure reality
   - High availability architecture
   - Multi-zone deployment strategies
   - IBM internal regional networking

### Network Planning

4. **[CIDR Planning and IPAM](cidr-planning-ipam.md)**
   - IP address fundamentals
   - Public vs private IPs
   - CIDR notation explained
   - VPC vs subnet CIDRs
   - **Address Prefixes** 🆕
   - Custom address prefix management
   - Common planning mistakes
   - Enterprise IP strategies
   - Hybrid cloud considerations

5. **[Subnet Service Internals](subnet-service-internals.md)**
   - What subnets actually are
   - Layer 3 vs Layer 2 networking
   - Subnet creation process
   - Workload attachment points
   - Traffic flow within subnets
   - Multi-zone subnet design

### Security

6. **[Network ACL Architecture](network-acl-architecture.md)**
   - Subnet-level security
   - Stateless firewall concepts
   - ACL rule structure
   - Traffic filtering hierarchy
   - Enterprise ACL design patterns

7. **[ACL Service Internals](acl-service-internals.md)**
   - Distributed packet filtering
   - ACL enforcement architecture
   - Rule evaluation process
   - Stateless behavior deep dive
   - **IBM Cloud Internal ACL Rules** 🆕
   - Variables: add_ibm_cloud_internal_rules, prepend_ibm_rules
   - Service connectivity requirements
   - Subnet boundary protection

8. **[Security Group Service Internals](security-group-service-internals.md)**
   - Workload-level security
   - Stateful firewall concepts
   - NIC-level attachment
   - Connection tracking
   - **Default Security Group Cleanup** 🆕
   - Variable: clean_default_sg_acl
   - Security hardening best practices
   - Dynamic security policies
   - Enterprise layered security

### Routing and Connectivity

9. **[Route Table Service](route-table-service.md)**
   - Routing fundamentals
   - Distributed routing fabric
   - Next-hop resolution
   - Route matching logic
   - Common routing patterns
   - Troubleshooting routing issues

10. **[VPN Architecture](vpn-architecture.md)** ⚠️ *Deprecated*
    - Hybrid connectivity concepts
    - IPSec tunnels
    - Migration guidance to alternatives
    - **Note:** VPN Gateway functionality is being deprecated

11. **[Hub-Spoke DNS Architecture](hub-spoke-dns-architecture.md)** 🆕
    - Hub-spoke DNS patterns
    - DNS resolution binding between VPCs
    - Custom DNS resolvers
    - DNS zones and records management
    - Variables: enable_hub, hub_vpc_id, resolver_type, dns_zones, dns_records

12. **[Transit Gateway Integration](transit-gateway-integration.md)**
    - Multi-VPC connectivity overview
    - Hub-and-spoke architecture
    - Integration patterns with VPC
    - **Note:** Separate infrastructure, streamlined content

### Advanced Features

13. **[Floating IP Architecture](floating-ip-architecture.md)**
    - Public internet exposure overview
    - Bastion host patterns
    - Security considerations
    - **Note:** Workload-specific, streamlined content

14. **[Load Balancer Architecture](load-balancer-architecture.md)**
    - Traffic distribution overview
    - High availability patterns
    - VPC integration points
    - **Note:** Separate module, streamlined content

### Observability and Integration

15. **[Flow Logs and Observability](flow-logs-observability.md)**
    - Network telemetry
    - Flow log collectors
    - Traffic metadata
    - Security monitoring
    - Compliance and auditing
    - Troubleshooting with logs

16. **[Outputs and Downstream Consumption](outputs-downstream-consumption.md)**
    - Infrastructure metadata
    - Terraform outputs
    - Module dependencies
    - Infrastructure layering
    - Enterprise integration patterns
    - Cross-team collaboration

---

## 🎯 How to Use This Guide

### For Beginners
Start with **[VPC Foundation](vpc-foundation.md)** to understand the basics, then progress through the topics in order. Each document builds on concepts from previous ones.

### For Experienced Users
Jump directly to specific topics of interest. Each document is self-contained with cross-references to related concepts.

### For Terraform Developers
Many documents now include **🔧 Terraform Implementation** sections with:
- Annotated code from the `terraform-ibm-landing-zone-vpc` module
- Line-by-line explanations of resource creation
- Usage examples with real-world configurations
- Best practices and common patterns

**Documents with Terraform sections:**
- [VPC Foundation](vpc-foundation.md#-terraform-implementation) - VPC resource creation
- [Subnet Service Internals](subnet-service-internals.md#-terraform-implementation) - Subnet creation and management
- [Network ACL Architecture](network-acl-architecture.md#-terraform-implementation) - ACL rules and ordering

### For Enterprise Architects
Focus on the enterprise patterns and design considerations highlighted in each section, particularly:
- Multi-zone architecture (Topic 3)
- CIDR planning strategies (Topic 4)
- Security layering (Topics 6-8)
- Hub-and-spoke topology (Topic 11)
- Infrastructure layering (Topic 15)

---

## 🔑 Key Concepts

### The VPC Hierarchy
```
Region
  ↓
VPC (Regional)
  ↓
Availability Zones (Zonal)
  ↓
Subnets (Zonal)
  ↓
Workloads (Zonal)
```

### Security Layers
```
External Source
      ↓
Public Gateway / VPN / TGW
      ↓
VPC Routing Domain
      ↓
Route Table
      ↓
Subnet
      ↓
Network ACL (Stateless)
      ↓
Security Group (Stateful)
      ↓
Compute Resource
```

### Infrastructure Dependencies
```
Landing Zone VPC
      ↓
Compute Infrastructure
      ↓
Container Platforms
      ↓
Applications
      ↓
Observability
```

---

## 📖 Document Conventions

Throughout this guide:
- **Bold text** indicates important concepts
- `Code blocks` show configuration examples
- 📌 Callout boxes highlight critical information
- ⚠️ Warning boxes indicate common pitfalls
- 💡 Tip boxes provide best practices
- Tables summarize comparisons and options
- Diagrams illustrate traffic flows and architectures

---

## 🚀 Quick Start

If you're new to IBM Cloud VPC, follow this learning path:

1. **Day 1**: Read [VPC Foundation](vpc-foundation.md) and [VPC Service Internals](vpc-service-internals.md)
2. **Day 2**: Study [Zones and Datacenter Architecture](zones-datacenter-architecture.md) and [CIDR Planning](cidr-planning-ipam.md) (including Address Prefixes)
3. **Day 3**: Learn [Subnets](subnet-service-internals.md) and security ([ACLs](network-acl-architecture.md) with IBM internal rules and [Security Groups](security-group-service-internals.md) with default cleanup)
   - 📊 **Visual Aid**: Review the [Multi-Tier Security Pattern Diagram](security-group-service-internals.md#-multi-tier-security-pattern-diagram)
4. **Day 4**: Understand [Routing](route-table-service.md) and connectivity ([Hub-Spoke DNS](hub-spoke-dns-architecture.md), [Transit Gateway](transit-gateway-integration.md))
   - 📊 **Visual Aid**: Study the [Custom Routing Examples](route-table-service.md#-custom-routing-examples-with-diagrams) and [Hub-Spoke DNS Topology](hub-spoke-dns-architecture.md#-hub-spoke-topology-diagram)
5. **Day 5**: Explore integration patterns ([Floating IPs](floating-ip-architecture.md), [Load Balancers](load-balancer-architecture.md), [Flow Logs](flow-logs-observability.md))
   - 📊 **Visual Aid**: Examine the [Flow Log Data Flow Diagram](flow-logs-observability.md#-flow-log-data-flow-diagram) and [Observability Architecture](flow-logs-observability.md#-observability-architecture-diagram)

### 🎨 Visual Learning Path

For those who prefer visual learning, start with these key diagrams:
1. [Hub-Spoke Topology](hub-spoke-dns-architecture.md#-hub-spoke-topology-diagram) - Understand VPC relationships
2. [3-Tier Security Architecture](security-group-service-internals.md#-multi-tier-security-pattern-diagram) - See enterprise security patterns
3. [Routing Decision Flow](route-table-service.md#-routing-decision-flow-diagram) - Learn packet routing logic
4. [Resource Dependency Graph](terraform-mapping.md#-resource-dependency-graph) - Understand infrastructure dependencies

---

## 📊 Visual Learning Resources

This guide includes extensive visual aids to help you understand complex networking concepts. Each document contains diagrams, tables, and flowcharts designed for visual learners.

### Key Diagrams by Topic

#### Security Architecture
- **[Security Group Architecture](security-group-service-internals.md#-security-group-architecture-diagram)** - How SGs attach to VSI network interfaces
- **[Rule Evaluation Flow](security-group-service-internals.md#-rule-evaluation-flow-diagram)** - Stateful connection tracking visualization
- **[Multi-Tier Security Pattern](security-group-service-internals.md#-multi-tier-security-pattern-diagram)** - 3-tier architecture with security groups
- **[Security Group Rule Tables](security-group-service-internals.md#-example-security-group-rule-tables)** - Web, App, and DB tier examples

#### Routing and Connectivity
- **[Routing Decision Flow](route-table-service.md#-routing-decision-flow-diagram)** - Packet routing logic visualization
- **[Route Priority Table](route-table-service.md#-route-priority-table)** - System vs custom route precedence
- **[VPN Routing Example](route-table-service.md#-custom-routing-examples-with-diagrams)** - Route to on-premises via VPN
- **[Transit Gateway Routing](route-table-service.md#-custom-routing-examples-with-diagrams)** - Inter-VPC communication
- **[Internet Routing](route-table-service.md#-custom-routing-examples-with-diagrams)** - Public gateway routing

#### DNS Architecture
- **[Hub-Spoke Topology](hub-spoke-dns-architecture.md#-hub-spoke-topology-diagram)** - 1 hub + 3 spoke VPCs architecture
- **[DNS Resolution Flow](hub-spoke-dns-architecture.md#-dns-resolution-flow-diagram)** - Query flow from spoke to hub
- **[DNS Resolver Comparison](hub-spoke-dns-architecture.md#-comparison-table-dns-resolver-types)** - System DNS vs Custom Resolver

#### Observability
- **[Flow Log Data Flow](flow-logs-observability.md#-flow-log-data-flow-diagram)** - VSI → Flow Logs → COS pipeline
- **[Flow Log Format Table](flow-logs-observability.md#-flow-log-format-table)** - All 27+ fields with descriptions
- **[Observability Architecture](flow-logs-observability.md#-observability-architecture-diagram)** - Complete monitoring stack

#### Terraform Implementation
- **[Resource Creation Sequence](terraform-mapping.md#-resource-creation-sequence-diagram)** - Order of resource provisioning
- **[Dependency Graph](terraform-mapping.md#-resource-dependency-graph)** - Resource relationships visualization
- **[Variable Mapping Table](terraform-mapping.md#-comprehensive-variable-to-resource-mapping-table)** - 77+ variables mapped to resources

### Visual Aid Types

| Visual Type | Purpose | Example Documents |
|-------------|---------|-------------------|
| **ASCII Diagrams** | Architecture and flow visualization | All documents |
| **Tables** | Comparison and reference data | Security groups, routing, DNS, flow logs |
| **Flowcharts** | Process and decision flows | Routing, DNS resolution, packet processing |
| **Dependency Graphs** | Resource relationships | Terraform mapping |
| **Rule Tables** | Configuration examples | ACLs, security groups |

### Learning by Visualization

**For Visual Learners:**
1. Start with the [Hub-Spoke Topology Diagram](hub-spoke-dns-architecture.md#-hub-spoke-topology-diagram) to understand VPC relationships
2. Study the [Multi-Tier Security Pattern](security-group-service-internals.md#-multi-tier-security-pattern-diagram) for security architecture
3. Review the [Flow Log Data Flow](flow-logs-observability.md#-flow-log-data-flow-diagram) for observability concepts
4. Examine the [Resource Dependency Graph](terraform-mapping.md#-resource-dependency-graph) for infrastructure relationships

**For Hands-On Learners:**
1. Use the [Security Group Rule Tables](security-group-service-internals.md#-example-security-group-rule-tables) as configuration templates
2. Reference the [Route Priority Table](route-table-service.md#-route-priority-table) when configuring routing
3. Apply the [Flow Log Format Table](flow-logs-observability.md#-flow-log-format-table) when analyzing logs
4. Follow the [Variable Mapping Table](terraform-mapping.md#-comprehensive-variable-to-resource-mapping-table) when writing Terraform

### Quick Reference Diagrams

**Most Referenced Visuals:**
- 🔒 [3-Tier Security Architecture](security-group-service-internals.md#-multi-tier-security-pattern-diagram) - Enterprise security pattern
- 🗺️ [Custom Routing Examples](route-table-service.md#-custom-routing-examples-with-diagrams) - VPN, TGW, and internet routing
- 🌐 [Hub-Spoke DNS Flow](hub-spoke-dns-architecture.md#-dns-resolution-flow-diagram) - Complete DNS query resolution
- 📊 [Flow Log Pipeline](flow-logs-observability.md#-flow-log-data-flow-diagram) - End-to-end observability
- 🔗 [Terraform Dependencies](terraform-mapping.md#-resource-dependency-graph) - Infrastructure provisioning order


---

## 🤝 Related Resources

- **terraform-ibm-landing-zone-vpc module**: The automation tool that implements these concepts
- **IBM Cloud Documentation**: Official IBM Cloud VPC documentation
- **IBM Cloud Architecture Center**: Reference architectures and best practices

---

## 📝 About This Guide

This guide provides deep beginner-friendly explanations of IBM Cloud VPC infrastructure. It's designed for:
- Cloud engineers new to IBM Cloud
- Network engineers transitioning to cloud
- DevOps teams implementing infrastructure as code
- Solution architects designing cloud architectures
- Anyone seeking to understand cloud networking fundamentals

Each topic is written to be accessible to beginners while providing the depth needed for production implementations.

---

**Last Updated**: 2026-05-09

**Guide Version**: 1.0

**Maintained by**: IBM Cloud Landing Zone Team
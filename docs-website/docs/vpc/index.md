# VPC Infrastructure

## Overview

IBM Cloud Virtual Private Cloud (VPC) provides isolated, secure virtual networks for your cloud resources. This comprehensive guide covers all aspects of VPC infrastructure, from foundational concepts to advanced networking features.

## 📚 Documentation Structure

<div class="module-cards">
  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🏗️</div>
      <h3 class="module-card-title">Foundation</h3>
    </div>
    <p class="module-card-description">
      Core VPC concepts, architecture patterns, and foundational setup.
    </p>
    <a href="vpc-foundation/" class="module-card-link">VPC Foundation →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">⚙️</div>
      <h3 class="module-card-title">Service Internals</h3>
    </div>
    <p class="module-card-description">
      Deep dive into VPC service architecture and internal mechanisms.
    </p>
    <a href="vpc-service-internals/" class="module-card-link">Service Internals →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🌍</div>
      <h3 class="module-card-title">Zones & Datacenters</h3>
    </div>
    <p class="module-card-description">
      Multi-zone architecture and datacenter distribution strategies.
    </p>
    <a href="zones-datacenter-architecture/" class="module-card-link">Zones Architecture →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">📊</div>
      <h3 class="module-card-title">CIDR Planning</h3>
    </div>
    <p class="module-card-description">
      IP address management and CIDR block planning strategies.
    </p>
    <a href="cidr-planning-ipam/" class="module-card-link">CIDR Planning →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🔗</div>
      <h3 class="module-card-title">Subnets</h3>
    </div>
    <p class="module-card-description">
      Subnet design, service internals, and best practices.
    </p>
    <a href="subnet-service-internals/" class="module-card-link">Subnet Service →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🛡️</div>
      <h3 class="module-card-title">Network ACLs</h3>
    </div>
    <p class="module-card-description">
      Network Access Control Lists architecture and configuration.
    </p>
    <a href="network-acl-architecture/" class="module-card-link">ACL Architecture →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🔒</div>
      <h3 class="module-card-title">Security Groups</h3>
    </div>
    <p class="module-card-description">
      Security group configuration and service internals.
    </p>
    <a href="security-group-service-internals/" class="module-card-link">Security Groups →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🗺️</div>
      <h3 class="module-card-title">Route Tables</h3>
    </div>
    <p class="module-card-description">
      Custom routing and route table service configuration.
    </p>
    <a href="route-table-service/" class="module-card-link">Route Tables →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🔐</div>
      <h3 class="module-card-title">VPN</h3>
    </div>
    <p class="module-card-description">
      VPN gateway architecture and secure connectivity.
    </p>
    <a href="vpn-architecture/" class="module-card-link">VPN Architecture →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🌐</div>
      <h3 class="module-card-title">Transit Gateway</h3>
    </div>
    <p class="module-card-description">
      Multi-VPC connectivity and Transit Gateway integration.
    </p>
    <a href="transit-gateway-integration/" class="module-card-link">Transit Gateway →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🌊</div>
      <h3 class="module-card-title">Floating IPs</h3>
    </div>
    <p class="module-card-description">
      Public IP addressing and floating IP management.
    </p>
    <a href="floating-ip-architecture/" class="module-card-link">Floating IPs →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">⚖️</div>
      <h3 class="module-card-title">Load Balancers</h3>
    </div>
    <p class="module-card-description">
      Application and network load balancer architecture.
    </p>
    <a href="load-balancer-architecture/" class="module-card-link">Load Balancers →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">📈</div>
      <h3 class="module-card-title">Flow Logs</h3>
    </div>
    <p class="module-card-description">
      Network traffic monitoring and flow log analysis.
    </p>
    <a href="flow-logs-observability/" class="module-card-link">Flow Logs →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🔄</div>
      <h3 class="module-card-title">Hub-Spoke DNS</h3>
    </div>
    <p class="module-card-description">
      DNS architecture for hub-and-spoke network topologies.
    </p>
    <a href="hub-spoke-dns-architecture/" class="module-card-link">Hub-Spoke DNS →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🔧</div>
      <h3 class="module-card-title">Terraform Mapping</h3>
    </div>
    <p class="module-card-description">
      Infrastructure as Code with Terraform configuration.
    </p>
    <a href="terraform-mapping/" class="module-card-link">Terraform Mapping →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">📤</div>
      <h3 class="module-card-title">Outputs</h3>
    </div>
    <p class="module-card-description">
      VPC outputs for downstream service consumption.
    </p>
    <a href="outputs-downstream-consumption/" class="module-card-link">Outputs →</a>
  </div>
</div>

## 🚀 Quick Start

Follow this recommended learning path:

1. **[VPC Foundation](vpc-foundation/)** - Start here to understand core concepts
2. **[CIDR Planning](cidr-planning-ipam/)** - Plan your IP address space
3. **[Zones & Datacenters](zones-datacenter-architecture/)** - Design for high availability
4. **[Subnets](subnet-service-internals/)** - Configure network segments
5. **[Security](network-acl-architecture/)** - Implement security controls

## 🏗️ Architecture Patterns

```mermaid
graph TB
    subgraph "VPC Architecture"
        subgraph "Zone 1"
            SN1[Subnet 1]
            SN2[Subnet 2]
        end
        
        subgraph "Zone 2"
            SN3[Subnet 3]
            SN4[Subnet 4]
        end
        
        subgraph "Zone 3"
            SN5[Subnet 5]
            SN6[Subnet 6]
        end
        
        ACL[Network ACLs]
        SG[Security Groups]
        RT[Route Tables]
        VPN[VPN Gateway]
        LB[Load Balancer]
        FIP[Floating IPs]
        
        ACL --> SN1
        ACL --> SN2
        ACL --> SN3
        ACL --> SN4
        ACL --> SN5
        ACL --> SN6
        
        SG --> SN1
        SG --> SN2
        SG --> SN3
        SG --> SN4
        SG --> SN5
        SG --> SN6
        
        RT --> SN1
        RT --> SN3
        RT --> SN5
        
        VPN --> SN1
        LB --> SN2
        LB --> SN4
        FIP --> LB
    end
    
    style SN1 fill:#0f62fe,color:#fff
    style SN2 fill:#0f62fe,color:#fff
    style SN3 fill:#0f62fe,color:#fff
    style SN4 fill:#0f62fe,color:#fff
    style SN5 fill:#0f62fe,color:#fff
    style SN6 fill:#0f62fe,color:#fff
    style ACL fill:#8a3ffc,color:#fff
    style SG fill:#8a3ffc,color:#fff
    style RT fill:#1192e8,color:#fff
    style VPN fill:#24a148,color:#fff
    style LB fill:#24a148,color:#fff
    style FIP fill:#009d9a,color:#fff
```

## 💡 Key Concepts

!!! info "VPC Isolation"
    Each VPC is completely isolated from other VPCs, providing network-level security and resource separation.

!!! tip "Multi-Zone Deployment"
    Deploy resources across multiple availability zones for high availability and disaster recovery.

!!! warning "CIDR Planning"
    Plan your CIDR blocks carefully - they cannot be changed after VPC creation.

!!! success "Security Layers"
    Use both Network ACLs (subnet-level) and Security Groups (instance-level) for defense in depth.

## 📖 Additional Resources

- [IBM Cloud VPC Documentation](https://cloud.ibm.com/docs/vpc)
- [VPC API Reference](https://cloud.ibm.com/apidocs/vpc)
- [Terraform IBM Provider](https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs)

## 🎯 Common Use Cases

=== "Web Application"
    Deploy a multi-tier web application with:
    
    - Public subnets for load balancers
    - Private subnets for application servers
    - Isolated subnets for databases
    - VPN for administrative access

=== "Hybrid Cloud"
    Connect on-premises infrastructure:
    
    - VPN Gateway for site-to-site connectivity
    - Transit Gateway for multi-VPC routing
    - Direct Link for dedicated connectivity
    - Custom route tables for traffic control

=== "Microservices"
    Container-based architecture:
    
    - Kubernetes/OpenShift clusters (see [Cluster Infrastructure](../cluster/README.md))
    - Service mesh networking
    - Internal load balancing
    - Network policies for pod security
    
    For detailed cluster networking integration, see [VPC Networking Integration](../cluster/base-ocp-vpc/06-vpc-networking-integration.md).

=== "Data Processing"
    Big data and analytics:
    
    - High-bandwidth subnets
    - Storage-optimized instances
    - Private endpoints for Cloud Object Storage
    - Flow logs for traffic analysis
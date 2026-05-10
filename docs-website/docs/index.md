---
title: IBM Cloud Landing Zone - Complete Guide
description: Comprehensive documentation for deploying and managing IBM Cloud Landing Zone infrastructure
hide:
  - navigation
  - toc
---

<div class="hero-section">
  <h1>🚀 IBM Cloud Landing Zone</h1>
  <p>Your Complete Guide to Enterprise-Grade Cloud Infrastructure</p>
  <div class="hero-buttons">
    <a href="getting-started/" class="hero-button">Get Started</a>
    <a href="vpc/" class="hero-button secondary">Explore Modules</a>
  </div>
</div>

<div class="grid cards" markdown>

-   :material-map-marker-path:{ .lg .middle } **🗺️ New to IBM Cloud Landing Zone?**

    ---

    Follow our **[Interactive Learning Path](learning-path.md)** with visual roadmaps and step-by-step guidance!
    
    **✨ Features:**
    
    - 📊 6 structured learning phases
    - ⏱️ 16-22 hours total learning time
    - 🎨 Interactive Mermaid diagrams
    - ✅ Progress tracking checklist
    - 🎯 Clear milestones and objectives
    
    [:octicons-arrow-right-24: Start Your Journey](learning-path.md){ .md-button .md-button--primary }

</div>

## 🎯 Infrastructure Deployment KPI Tree

**Click on any component to navigate to its documentation**

```mermaid
flowchart LR
    OBJ[Objective]
    FOUND[Foundation]
    COMP[Compute]
    DAT[Data]
    
    OBJ --> FOUND
    OBJ --> COMP
    OBJ --> DAT
    
    FOUND --> NET[Network]
    FOUND --> SEC[Security]
    
    NET --> VPC[VPC]
    NET --> SUB[Subnets]
    NET --> RT[Routes]
    NET --> VPN[VPN]
    
    SEC --> ACL[ACLs]
    SEC --> SG[Groups]
    SEC --> IAM[IAM]
    
    COMP --> VS[Servers]
    COMP --> CONT[Containers]
    
    VS --> VSI[VSI]
    VS --> LB[Balancer]
    VS --> FIP[IPs]
    
    CONT --> K8S[K8S]
    CONT --> REG[Registry]
    
    DAT --> STOR[Storage]
    DAT --> DBS[Database]
    
    STOR --> BLK[Block]
    STOR --> OBJ[Object]
    STOR --> FIL[File]
    
    DBS --> DB[DB]
    DBS --> BAK[Backup]
    
    classDef objectiveStyle fill:#2d2d2d,stroke:#E50914,stroke-width:3px,color:#fff
    classDef strategyStyle fill:#8B4513,stroke:#E50914,stroke-width:2px,color:#fff
    classDef tacticStyle fill:#4169E1,stroke:#666,stroke-width:2px,color:#fff
    classDef kpiStyle fill:#90EE90,stroke:#666,stroke-width:1px,color:#000
    
    class OBJ objectiveStyle
    class FOUND,COMP,DAT strategyStyle
    class NET,SEC,VS,CONT,STOR,DBS tacticStyle
    class VPC,SUB,RT,VPN,ACL,SG,IAM,VSI,LB,FIP,K8S,REG,BLK,OBJ,FIL,DB,BAK kpiStyle
    
    click VPC "vpc/vpc-foundation/" "VPC Foundation Guide"
    click SUB "vpc/subnet-service-internals/" "Subnet Service Guide"
    click RT "vpc/route-table-service/" "Route Tables Guide"
    click VPN "vpc/vpn-architecture/" "VPN Architecture Guide"
    click ACL "vpc/network-acl-architecture/" "Network ACL Guide"
    click SG "vpc/security-group-service-internals/" "Security Groups Guide"
    click IAM "iam/" "IAM Infrastructure Guide"
    click VSI "vsi/vsi-provisioning-overview/" "VSI Infrastructure Guide"
    click LB "vpc/load-balancer-architecture/" "Load Balancer Guide"
    click FIP "vpc/floating-ip-architecture/" "Floating IP Guide"
    click K8S "cluster/" "Cluster Infrastructure Guide"
    click BLK "storage/" "Block Storage Guide"
    click FIL "storage/" "File Storage Guide"
    click DB "database/" "Database Infrastructure Guide"

### 📋 Dependency Rules

!!! tip "Understanding Dependencies"
    **Foundation First:** Always deploy in this order:
    
    1. **Resource Groups** → Organizational container
    2. **VPC** → Network foundation
    3. **Subnets** → Network segments
    4. **Security** → ACLs & Security Groups
    5. **Compute** → VSI or Kubernetes
    6. **Storage & Data** → Persistent storage and databases
    7. **Observability** → Logging and monitoring
    8. **Advanced** → Load balancers, VPN, Transit Gateway

!!! warning "Critical Dependencies"
    - 🚫 **Cannot create VSI without VPC and Subnet**
    - 🚫 **Cannot attach Floating IP without VSI**
    - 🚫 **Cannot create Load Balancer without VSI pool members**
    - 🚫 **Cannot configure Security Groups without VPC**

---

## Welcome to IBM Cloud Landing Zone

IBM Cloud Landing Zone provides a comprehensive, production-ready foundation for deploying enterprise workloads on IBM Cloud. This documentation covers all aspects of infrastructure deployment, configuration, and management across 11 core modules.

<div class="stats-section">
  <div class="stat-item">
    <span class="stat-number" data-target="11">11</span>
    <span class="stat-label">Infrastructure Modules</span>
  </div>
  <div class="stat-item">
    <span class="stat-number" data-target="100">100+</span>
    <span class="stat-label">Configuration Options</span>
  </div>
  <div class="stat-item">
    <span class="stat-number" data-target="50">50+</span>
    <span class="stat-label">Best Practices</span>
  </div>
  <div class="stat-item">
    <span class="stat-number" data-target="24">24/7</span>
    <span class="stat-label">Enterprise Support</span>
  </div>
</div>

## 🎯 Core Infrastructure Modules

<div class="module-cards">
  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🌐</div>
      <h3 class="module-card-title">VPC Infrastructure</h3>
    </div>
    <p class="module-card-description">
      Build secure, isolated virtual networks with advanced networking capabilities including subnets, ACLs, security groups, and routing.
    </p>
    <div class="module-card-tags">
      <span class="module-tag">Networking</span>
      <span class="module-tag">Security</span>
      <span class="module-tag">Isolation</span>
    </div>
    <a href="vpc/" class="module-card-link">
      Explore VPC →
    </a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">💻</div>
      <h3 class="module-card-title">VSI Infrastructure</h3>
    </div>
    <p class="module-card-description">
      Deploy and manage Virtual Server Instances with flexible compute resources, storage options, and network configurations.
    </p>
    <div class="module-card-tags">
      <span class="module-tag">Compute</span>
      <span class="module-tag">Scalability</span>
      <span class="module-tag">Performance</span>
    </div>
    <a href="vsi/" class="module-card-link">
      Explore VSI →
    </a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">☸️</div>
      <h3 class="module-card-title">Cluster Infrastructure</h3>
    </div>
    <p class="module-card-description">
      Orchestrate containerized applications with Kubernetes and OpenShift clusters for modern cloud-native workloads.
    </p>
    <div class="module-card-tags">
      <span class="module-tag">Kubernetes</span>
      <span class="module-tag">OpenShift</span>
      <span class="module-tag">Containers</span>
    </div>
    <a href="cluster/" class="module-card-link">
      Explore Clusters →
    </a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🔒</div>
      <h3 class="module-card-title">Security Infrastructure</h3>
    </div>
    <p class="module-card-description">
      Implement comprehensive security with Key Management, Secrets Manager, and Security & Compliance Center integration.
    </p>
    <div class="module-card-tags">
      <span class="module-tag">Encryption</span>
      <span class="module-tag">Compliance</span>
      <span class="module-tag">Secrets</span>
    </div>
    <a href="security/" class="module-card-link">
      Explore Security →
    </a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">📊</div>
      <h3 class="module-card-title">Observability</h3>
    </div>
    <p class="module-card-description">
      Monitor, log, and track your infrastructure with integrated logging, monitoring, and activity tracking services.
    </p>
    <div class="module-card-tags">
      <span class="module-tag">Monitoring</span>
      <span class="module-tag">Logging</span>
      <span class="module-tag">Tracking</span>
    </div>
    <a href="observability/" class="module-card-link">
      Explore Observability →
    </a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">💾</div>
      <h3 class="module-card-title">Storage Infrastructure</h3>
    </div>
    <p class="module-card-description">
      Manage persistent storage with Block Storage, Object Storage, and File Storage solutions for diverse workload needs.
    </p>
    <div class="module-card-tags">
      <span class="module-tag">Block Storage</span>
      <span class="module-tag">Object Storage</span>
      <span class="module-tag">File Storage</span>
    </div>
    <a href="storage/" class="module-card-link">
      Explore Storage →
    </a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🗄️</div>
      <h3 class="module-card-title">Database Infrastructure</h3>
    </div>
    <p class="module-card-description">
      Deploy managed database services including PostgreSQL, MySQL, MongoDB, and more with high availability.
    </p>
    <div class="module-card-tags">
      <span class="module-tag">SQL</span>
      <span class="module-tag">NoSQL</span>
      <span class="module-tag">Managed</span>
    </div>
    <a href="database/" class="module-card-link">
      Explore Databases →
    </a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🔗</div>
      <h3 class="module-card-title">Networking</h3>
    </div>
    <p class="module-card-description">
      Configure advanced networking with DNS Services, CDN, Direct Link, and hybrid cloud connectivity options.
    </p>
    <div class="module-card-tags">
      <span class="module-tag">DNS</span>
      <span class="module-tag">CDN</span>
      <span class="module-tag">Direct Link</span>
    </div>
    <a href="networking/" class="module-card-link">
      Explore Networking →
    </a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">👥</div>
      <h3 class="module-card-title">IAM Infrastructure</h3>
    </div>
    <p class="module-card-description">
      Manage identity and access with Access Groups, Service IDs, and fine-grained policy controls.
    </p>
    <div class="module-card-tags">
      <span class="module-tag">Access Control</span>
      <span class="module-tag">Policies</span>
      <span class="module-tag">Identity</span>
    </div>
    <a href="iam/" class="module-card-link">
      Explore IAM →
    </a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">📦</div>
      <h3 class="module-card-title">Resource Management</h3>
    </div>
    <p class="module-card-description">
      Organize and manage resources with Resource Groups, tagging strategies, and cost allocation.
    </p>
    <div class="module-card-tags">
      <span class="module-tag">Organization</span>
      <span class="module-tag">Tagging</span>
      <span class="module-tag">Cost Control</span>
    </div>
    <a href="resource-management/" class="module-card-link">
      Explore Resources →
    </a>
  </div>
</div>

## 🚀 Quick Start Guide

<div class="learning-path">
  <div class="learning-step" data-step="1">
    <h3>📋 Prerequisites</h3>
    <p>Ensure you have an IBM Cloud account, necessary permissions, and required tools installed (Terraform, IBM Cloud CLI).</p>
    <a href="getting-started/prerequisites/">View Prerequisites →</a>
  </div>

  <div class="learning-step" data-step="2">
    <h3>⚙️ Installation</h3>
    <p>Set up your development environment, configure authentication, and prepare your workspace for deployment.</p>
    <a href="getting-started/installation/">Installation Guide →</a>
  </div>

  <div class="learning-step" data-step="3">
    <h3>🌐 Deploy VPC</h3>
    <p>Start with VPC infrastructure as the foundation for all other services. Configure networks, subnets, and security.</p>
    <a href="vpc/vpc-foundation/">VPC Foundation →</a>
  </div>

  <div class="learning-step" data-step="4">
    <h3>💻 Add Compute</h3>
    <p>Deploy Virtual Server Instances or Kubernetes clusters based on your workload requirements.</p>
    <a href="vsi/">VSI Guide →</a> | <a href="cluster/">Cluster Guide →</a>
  </div>

  <div class="learning-step" data-step="5">
    <h3>🔒 Secure & Monitor</h3>
    <p>Implement security controls, enable observability, and configure compliance monitoring.</p>
    <a href="security/">Security Guide →</a> | <a href="observability/">Observability Guide →</a>
  </div>
</div>

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "IBM Cloud Landing Zone"
        subgraph "Network Layer"
            VPC[VPC Infrastructure]
            NET[Networking Services]
        end
        
        subgraph "Compute Layer"
            VSI[Virtual Servers]
            K8S[Kubernetes/OpenShift]
        end
        
        subgraph "Data Layer"
            STORAGE[Storage Services]
            DB[Database Services]
        end
        
        subgraph "Security Layer"
            IAM[Identity & Access]
            SEC[Security Services]
        end
        
        subgraph "Management Layer"
            OBS[Observability]
            RES[Resource Management]
        end
    end
    
    VPC --> VSI
    VPC --> K8S
    NET --> VPC
    VSI --> STORAGE
    K8S --> STORAGE
    VSI --> DB
    K8S --> DB
    IAM --> VPC
    IAM --> VSI
    IAM --> K8S
    SEC --> VPC
    OBS --> VPC
    OBS --> VSI
    OBS --> K8S
    RES --> VPC
    RES --> VSI
    RES --> K8S
    
    style VPC fill:#0f62fe,color:#fff
    style VSI fill:#0f62fe,color:#fff
    style K8S fill:#0f62fe,color:#fff
    style STORAGE fill:#1192e8,color:#fff
    style DB fill:#1192e8,color:#fff
    style IAM fill:#8a3ffc,color:#fff
    style SEC fill:#8a3ffc,color:#fff
    style OBS fill:#24a148,color:#fff
    style RES fill:#24a148,color:#fff
    style NET fill:#009d9a,color:#fff
```

## 💡 Key Features

<div class="feature-grid">
  <div class="feature-card">
    <div class="feature-card-icon">⚡</div>
    <h3>Production-Ready</h3>
    <p>Enterprise-grade infrastructure templates tested and validated for production workloads.</p>
  </div>

  <div class="feature-card">
    <div class="feature-card-icon">🔧</div>
    <h3>Highly Configurable</h3>
    <p>Flexible configuration options to match your specific requirements and use cases.</p>
  </div>

  <div class="feature-card">
    <div class="feature-card-icon">🛡️</div>
    <h3>Security First</h3>
    <p>Built-in security best practices with encryption, access controls, and compliance features.</p>
  </div>

  <div class="feature-card">
    <div class="feature-card-icon">📈</div>
    <h3>Scalable</h3>
    <p>Designed to scale from small deployments to large enterprise environments.</p>
  </div>

  <div class="feature-card">
    <div class="feature-card-icon">🔄</div>
    <h3>Infrastructure as Code</h3>
    <p>Terraform-based automation for consistent, repeatable deployments.</p>
  </div>

  <div class="feature-card">
    <div class="feature-card-icon">📚</div>
    <h3>Comprehensive Docs</h3>
    <p>Detailed documentation covering architecture, configuration, and best practices.</p>
  </div>
</div>

## 📖 Learning Paths

Choose your learning path based on your role and objectives:

=== "Cloud Architect"

    **Focus Areas:**
    
    1. [VPC Architecture](vpc/vpc-foundation/) - Network design and topology
    2. [Security Architecture](security/) - Security controls and compliance
    3. [High Availability](vpc/zones-datacenter-architecture/) - Multi-zone deployments
    4. [Hybrid Cloud](networking/) - Direct Link and VPN connectivity
    
    **Estimated Time:** 8-10 hours

=== "DevOps Engineer"

    **Focus Areas:**
    
    1. [Terraform Configuration](vpc/terraform-mapping/) - Infrastructure as Code
    2. [Cluster Deployment](cluster/) - Kubernetes/OpenShift setup
    3. [CI/CD Integration](observability/) - Monitoring and logging
    4. [Automation](getting-started/) - Deployment automation
    
    **Estimated Time:** 6-8 hours

=== "Security Engineer"

    **Focus Areas:**
    
    1. [IAM Configuration](iam/) - Access control and policies
    2. [Network Security](vpc/network-acl-architecture/) - ACLs and Security Groups
    3. [Encryption](security/) - Key management and secrets
    4. [Compliance](security/) - Security & Compliance Center
    
    **Estimated Time:** 5-7 hours

=== "Platform Engineer"

    **Focus Areas:**
    
    1. [Resource Management](resource-management/) - Organization and tagging
    2. [Storage Configuration](storage/) - Persistent storage setup
    3. [Database Services](database/) - Managed database deployment
    4. [Observability](observability/) - Monitoring and alerting
    
    **Estimated Time:** 6-8 hours

## 🎓 Best Practices

!!! tip "Infrastructure Design"
    - Start with a well-planned VPC architecture
    - Use multiple availability zones for high availability
    - Implement proper network segmentation
    - Follow the principle of least privilege for IAM

!!! success "Security"
    - Enable encryption at rest and in transit
    - Use Key Protect or Hyper Protect Crypto Services
    - Implement network ACLs and security groups
    - Regular security audits and compliance checks

!!! warning "Cost Optimization"
    - Right-size your resources based on actual usage
    - Use resource groups for cost allocation
    - Implement proper tagging strategy
    - Monitor and optimize regularly

!!! info "Operations"
    - Enable comprehensive logging and monitoring
    - Set up automated backups
    - Document your infrastructure
    - Implement disaster recovery procedures

## 🔗 Quick Links

<div class="quick-links">
  <a href="getting-started/" class="quick-link">
    <span class="quick-link-icon">🚀</span>
    <div class="quick-link-text">
      <div class="quick-link-title">Getting Started</div>
      <div class="quick-link-description">Begin your journey</div>
    </div>
  </a>

  <a href="reference/api/" class="quick-link">
    <span class="quick-link-icon">📖</span>
    <div class="quick-link-text">
      <div class="quick-link-title">API Reference</div>
      <div class="quick-link-description">Complete API docs</div>
    </div>
  </a>

  <a href="reference/best-practices/" class="quick-link">
    <span class="quick-link-icon">⭐</span>
    <div class="quick-link-text">
      <div class="quick-link-title">Best Practices</div>
      <div class="quick-link-description">Expert recommendations</div>
    </div>
  </a>

  <a href="reference/troubleshooting/" class="quick-link">
    <span class="quick-link-icon">🔧</span>
    <div class="quick-link-text">
      <div class="quick-link-title">Troubleshooting</div>
      <div class="quick-link-description">Common issues & solutions</div>
    </div>
  </a>
</div>

## 🤝 Contributing

We welcome contributions! Check out our [Contributing Guide](contributing/) to learn how you can help improve this documentation.

## 📞 Support

- **Documentation Issues:** [Open an issue](https://github.com/ibm-cloud/landing-zone/issues)
- **IBM Cloud Support:** [Contact Support](https://cloud.ibm.com/unifiedsupport/supportcenter)
- **Community:** [Join the discussion](https://community.ibm.com/community/user/cloud/home)

---

<div style="text-align: center; margin-top: 3rem; padding: 2rem; background: var(--md-code-bg-color); border-radius: 1rem;">
  <h3>Ready to get started?</h3>
  <p>Deploy your first IBM Cloud Landing Zone infrastructure in minutes.</p>
  <a href="getting-started/" class="hero-button" style="margin-top: 1rem;">Start Building →</a>
</div>
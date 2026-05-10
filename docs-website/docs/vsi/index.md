# VSI Infrastructure

## Overview

Virtual Server Instances (VSI) provide flexible, scalable compute resources in IBM Cloud VPC. This guide covers VSI deployment, configuration, and management for various workload requirements.

## 📚 Documentation

<div class="module-cards">
  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">📖</div>
      <h3 class="module-card-title">Complete Guide</h3>
    </div>
    <p class="module-card-description">
      Comprehensive guide covering all aspects of VSI infrastructure deployment and management.
    </p>
    <a href="vsi-infrastructure-complete-guide/" class="module-card-link">Complete Guide →</a>
  </div>

  <div class="module-card">
    <div class="module-card-header">
      <div class="module-card-icon">🚀</div>
      <h3 class="module-card-title">Quick Start</h3>
    </div>
    <p class="module-card-description">
      Get started quickly with VSI deployment using pre-configured templates and best practices.
    </p>
    <a href="README/" class="module-card-link">Quick Start →</a>
  </div>
</div>

## 🏗️ VSI Architecture

```mermaid
graph TB
    subgraph "VPC"
        subgraph "Public Subnet"
            FIP[Floating IP]
            VSI1[VSI - Web Tier]
        end
        
        subgraph "Private Subnet"
            VSI2[VSI - App Tier]
            VSI3[VSI - App Tier]
        end
        
        subgraph "Data Subnet"
            VSI4[VSI - Database]
        end
        
        LB[Load Balancer]
        SG1[Security Group - Web]
        SG2[Security Group - App]
        SG3[Security Group - DB]
        
        FIP --> VSI1
        LB --> VSI1
        VSI1 --> VSI2
        VSI1 --> VSI3
        VSI2 --> VSI4
        VSI3 --> VSI4
        
        SG1 --> VSI1
        SG2 --> VSI2
        SG2 --> VSI3
        SG3 --> VSI4
    end
    
    style VSI1 fill:#0f62fe,color:#fff
    style VSI2 fill:#0f62fe,color:#fff
    style VSI3 fill:#0f62fe,color:#fff
    style VSI4 fill:#0f62fe,color:#fff
    style LB fill:#24a148,color:#fff
    style FIP fill:#009d9a,color:#fff
```

## 💡 Key Features

- **Flexible Profiles**: Choose from balanced, compute, memory, or storage-optimized profiles
- **Custom Images**: Use stock images or create custom images
- **Auto Scaling**: Scale instances based on demand
- **High Availability**: Deploy across multiple zones
- **Security**: Integrated with VPC security features

## 🎯 Common Use Cases

=== "Web Servers"
    Deploy scalable web server infrastructure with load balancing and auto-scaling.

=== "Application Servers"
    Run business applications with appropriate compute and memory resources.

=== "Database Servers"
    Host databases with storage-optimized profiles and backup strategies.

=== "Development/Test"
    Create isolated environments for development and testing workloads.
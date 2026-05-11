# 🖥️ VSI Infrastructure Module

## Overview

The Virtual Server Instance (VSI) infrastructure module provides comprehensive compute foundation for IBM Cloud Landing Zone deployments. VSIs are the fundamental building blocks for running workloads in IBM Cloud VPC environments.

## 📚 Documentation

For complete VSI infrastructure details, see the chapter-based guides:
- **[Provisioning Overview](vsi-provisioning-overview.md)** - Overview of VSI provisioning architecture
- **[Resource Scoping](vsi-resource-scoping.md)** - Layer 1: Resource groups, tags, and IAM
- **[Network Foundation](vsi-network-foundation.md)** - Layer 2: VPC, subnets, and network setup
- **[Compute Instantiation](vsi-compute-instantiation.md)** - Layer 3: VSI instances and profiles
- **[Storage Configuration](vsi-storage-configuration.md)** - Layer 4: Boot volumes and block storage
- **[Instance Networking](vsi-instance-networking.md)** - Layer 5: Network interfaces and IPs
- **[Security Groups](vsi-security-groups.md)** - Layer 6: Security group configuration
- **[Secondary Interfaces](vsi-secondary-interfaces.md)** - Layer 7: Multi-homed networking
- **[Load Balancer](vsi-load-balancer.md)** - Layer 8: Load balancer integration
- **[Observability](vsi-observability.md)** - Layer 9: Monitoring and logging
- **[Lifecycle & Recovery](vsi-lifecycle-recovery.md)** - Layer 10: Lifecycle management
- **[Architecture Summary](vsi-architecture-summary.md)** - Complete architecture overview

## 🎯 What This Module Covers

### Core Components
- **Virtual Server Instances (VSI)** - Compute resources in VPC
- **Boot Volumes** - Primary storage for VSI instances
- **Block Storage** - Additional persistent storage volumes
- **SSH Keys** - Secure access management
- **Instance Profiles** - CPU, memory, and network configurations
- **Placement Groups** - High availability and performance optimization

### Networking Integration
- **Primary Network Interfaces** - VPC subnet connectivity
- **Secondary Network Interfaces** - Multi-homed configurations
- **Reserved IPs** - Static IP address assignment
- **Floating IPs** - Public internet connectivity
- **Security Groups** - Instance-level firewall rules

### Advanced Features
- **Load Balancer Integration** - Traffic distribution across VSI pools
- **Snapshot Management** - Backup and recovery capabilities
- **Consistency Groups** - Multi-volume snapshot coordination
- **Auto-scaling** - Dynamic capacity management
- **Monitoring & Logging** - Observability integration

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Resource Management                       │
│              (Resource Groups, Tags, IAM)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Network Foundation                        │
│         (VPC, Subnets, Security Groups, ACLs)               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Compute Instantiation                      │
│        (VSI Instances, Profiles, SSH Keys, Images)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Storage Configuration                      │
│      (Boot Volumes, Block Storage, Snapshots, KMS)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Instance-Level Networking                     │
│    (Network Interfaces, Reserved IPs, Floating IPs)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Load Balancer Integration                   │
│         (Backend Pools, Health Checks, Listeners)           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 Observability & Monitoring                   │
│          (Logging Agents, Monitoring Agents, Metrics)       │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- IBM Cloud VPC infrastructure deployed (see [vpc-infrastructure](../vpc-infrastructure/))
- Resource group created
- SSH key pair generated
- Appropriate IAM permissions

### Basic VSI Deployment

```hcl
module "vsi" {
  source = "terraform-ibm-modules/landing-zone-vsi/ibm"
  
  resource_group_id = var.resource_group_id
  vpc_id            = var.vpc_id
  subnet_id         = var.subnet_id
  ssh_key_ids       = [var.ssh_key_id]
  
  image_id          = var.image_id
  profile           = "bx2-2x8"  # 2 vCPU, 8 GB RAM
  
  name              = "my-vsi-instance"
  zone              = "us-south-1"
}
```

## 📖 Key Concepts

### Instance Profiles
Instance profiles define the compute capacity:
- **Balanced (bx2)** - General purpose workloads
- **Compute (cx2)** - CPU-intensive applications
- **Memory (mx2)** - Memory-intensive workloads
- **Ultra High Memory (ux2)** - Large in-memory databases
- **GPU (gx2)** - AI/ML and graphics workloads

### Boot Volume Configuration
```hcl
boot_volume = {
  name       = "my-boot-volume"
  size       = 100  # GB
  profile    = "general-purpose"
  encryption = "provider_managed"  # or customer_managed with KMS
}
```

### Security Groups
Control inbound and outbound traffic:
```hcl
security_group_rules = [
  {
    direction = "inbound"
    protocol  = "tcp"
    port_min  = 22
    port_max  = 22
    source    = "0.0.0.0/0"  # SSH access
  },
  {
    direction = "inbound"
    protocol  = "tcp"
    port_min  = 443
    port_max  = 443
    source    = "0.0.0.0/0"  # HTTPS access
  }
]
```

## 🔐 Security Best Practices

1. **SSH Key Management**
   - Use separate SSH keys per environment
   - Rotate keys regularly
   - Never commit private keys to version control

2. **Encryption**
   - Enable boot volume encryption
   - Use customer-managed keys (BYOK) for sensitive workloads
   - Encrypt data volumes with KMS/HPCS

3. **Network Security**
   - Apply principle of least privilege to security groups
   - Use private subnets for backend workloads
   - Implement network segmentation

4. **Access Control**
   - Use IAM service IDs for automation
   - Enable MFA for user accounts
   - Audit access logs regularly

## 🔄 Integration Points

### Upstream Dependencies
- **VPC Infrastructure** - Network foundation required
- **Resource Groups** - Organizational structure
- **IAM** - Access control and permissions
- **KMS/HPCS** - Encryption key management

### Downstream Consumers
- **Kubernetes/OpenShift** - Worker nodes run on VSIs
- **Application Workloads** - Custom applications
- **Database Servers** - Self-managed databases
- **Middleware** - Integration platforms

## 📊 Common Use Cases

### Web Application Tier
```
Internet → Load Balancer → VSI Pool (Web Servers)
                              ↓
                         Backend Services
```

### Database Cluster
```
Application Tier → VSI Pool (Database Nodes)
                      ↓
                  Shared Storage
```

### Bastion/Jump Host
```
Internet → Floating IP → Bastion VSI → Private Subnet VSIs
```

## 🛠️ Terraform Resources

Key Terraform resources used:
- `ibm_is_instance` - VSI instance
- `ibm_is_volume` - Block storage volumes
- `ibm_is_ssh_key` - SSH key management
- `ibm_is_floating_ip` - Public IP addresses
- `ibm_is_security_group` - Security group configuration
- `ibm_is_security_group_rule` - Security group rules
- `ibm_is_instance_network_interface` - Network interfaces

## 📈 Monitoring & Observability

### Metrics to Monitor
- CPU utilization
- Memory usage
- Disk I/O
- Network throughput
- Instance health status

### Integration Options
- IBM Cloud Monitoring (Sysdig)
- IBM Log Analysis (LogDNA)
- Custom monitoring solutions
- Third-party APM tools

## 🔗 Related Documentation

- [VPC Infrastructure](../vpc-infrastructure/) - Network foundation
- [Security Infrastructure](../security-infrastructure/) - KMS, Secrets Manager
- [Observability Infrastructure](../observability-infrastructure/) - Monitoring setup
- [Storage Infrastructure](../storage-infrastructure/) - Advanced storage options
- [Networking Infrastructure](../networking-infrastructure/) - Advanced networking

## 📚 Additional Resources

- [IBM Cloud VSI Documentation](https://cloud.ibm.com/docs/vpc?topic=vpc-about-advanced-virtual-servers)
- [terraform-ibm-landing-zone-vsi Module](https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone-vsi)
- [Instance Profiles](https://cloud.ibm.com/docs/vpc?topic=vpc-profiles)
- [VSI Best Practices](https://cloud.ibm.com/docs/vpc?topic=vpc-vsi-best-practices)

---

**Navigation:** [← Back to Main Guide](../IBM-CLOUD-LANDING-ZONE-GUIDE.md) | [Next: Security Infrastructure →](../security-infrastructure/)

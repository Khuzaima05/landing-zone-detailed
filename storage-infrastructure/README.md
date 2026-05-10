# 💾 Storage Infrastructure Module

## Overview

The Storage Infrastructure module provides comprehensive storage solutions for IBM Cloud Landing Zone deployments, including object storage, block storage, and file storage services with enterprise-grade features like encryption, replication, and lifecycle management.

## 🎯 What This Module Covers

### Core Storage Services

#### 1. **Cloud Object Storage (COS)**
- S3-compatible object storage
- Multi-region and cross-region replication
- Lifecycle policies and archival
- Encryption at rest and in transit
- Versioning and retention policies
- Direct Link and VPE connectivity

#### 2. **Block Storage**
- High-performance block volumes
- Multiple IOPS profiles
- Volume snapshots and cloning
- Encryption with customer-managed keys
- Volume attachment to VSIs
- Snapshot consistency groups

#### 3. **File Storage**
- NFS-based shared file storage
- Multiple performance profiles
- Mount targets across zones
- Encryption and access control
- Snapshot capabilities
- Replication options

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Storage Management Layer                    │
│         (Resource Groups, IAM, KMS Integration)              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Cloud Object Storage                        │
│    (Buckets, Objects, Lifecycle, Replication, Archive)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Block Storage                             │
│      (Volumes, Snapshots, Profiles, Attachments)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    File Storage                              │
│        (Shares, Mount Targets, Profiles, Replicas)          │
└─────────────────────────────────────────────────────────────┘
```

## ☁️ Cloud Object Storage (COS)

### COS Instance

```hcl
resource "ibm_resource_instance" "cos" {
  name              = "landing-zone-cos"
  service           = "cloud-object-storage"
  plan              = "standard"
  location          = "global"
  resource_group_id = var.resource_group_id
}
```

### Storage Classes

| Class | Use Case | Availability | Cost |
|-------|----------|--------------|------|
| **Standard** | Active data, frequent access | High | Higher |
| **Vault** | Backup, infrequent access | High | Medium |
| **Cold Vault** | Archive, rare access | High | Lower |
| **Smart Tier** | Automatic tiering | High | Variable |

### Bucket Creation

```hcl
resource "ibm_cos_bucket" "standard_bucket" {
  bucket_name          = "landing-zone-data"
  resource_instance_id = ibm_resource_instance.cos.id
  region_location      = "us-south"
  storage_class        = "standard"
  
  # Encryption with KMS
  kms_key_crn = ibm_kms_key.cos_key.crn
  
  # Activity tracking
  activity_tracking {
    read_data_events     = true
    write_data_events    = true
    activity_tracker_crn = ibm_resource_instance.activity_tracker.id
  }
  
  # Metrics monitoring
  metrics_monitoring {
    usage_metrics_enabled   = true
    request_metrics_enabled = true
    metrics_monitoring_crn  = ibm_resource_instance.monitoring.id
  }
}
```

### Cross-Region Bucket

```hcl
resource "ibm_cos_bucket" "cross_region" {
  bucket_name          = "landing-zone-backup"
  resource_instance_id = ibm_resource_instance.cos.id
  cross_region_location = "us"  # us, eu, ap
  storage_class        = "standard"
  
  # Object versioning
  object_versioning {
    enable = true
  }
  
  # Retention policy
  retention_rule {
    default   = 90
    maximum   = 365
    minimum   = 30
    permanent = false
  }
}
```

### Lifecycle Policies

```hcl
resource "ibm_cos_bucket" "lifecycle_bucket" {
  bucket_name          = "landing-zone-archive"
  resource_instance_id = ibm_resource_instance.cos.id
  region_location      = "us-south"
  storage_class        = "smart"
  
  # Archive old objects
  archive_rule {
    rule_id = "archive-old-data"
    enable  = true
    days    = 90
    type    = "GLACIER"  # Move to cold storage after 90 days
  }
  
  # Expire very old objects
  expire_rule {
    rule_id = "expire-ancient-data"
    enable  = true
    days    = 365
    prefix  = "temp/"
  }
}
```

### VPE Gateway for COS

```hcl
resource "ibm_is_virtual_endpoint_gateway" "cos_vpe" {
  name = "cos-vpe"
  vpc  = ibm_is_vpc.vpc.id
  
  target {
    crn           = "crn:v1:bluemix:public:cloud-object-storage:global:::endpoint:s3.direct.us-south.cloud-object-storage.appdomain.cloud"
    resource_type = "provider_cloud_service"
  }
  
  # Bind to subnets
  dynamic "ips" {
    for_each = ibm_is_subnet.subnets
    content {
      subnet = ips.value.id
      name   = "${ips.value.name}-vpe-ip"
    }
  }
}
```

### Replication

```hcl
resource "ibm_cos_bucket_replication_rule" "replication" {
  bucket_crn      = ibm_cos_bucket.source.crn
  bucket_location = ibm_cos_bucket.source.region_location
  
  replication_rule {
    rule_id = "replicate-to-backup"
    enable  = true
    prefix  = "critical/"
    priority = 1
    
    destination_bucket_crn = ibm_cos_bucket.destination.crn
  }
}
```

## 💿 Block Storage

### Volume Profiles

| Profile | IOPS | Use Case |
|---------|------|----------|
| **general-purpose** | 3 IOPS/GB | Balanced workloads |
| **5iops-tier** | 5 IOPS/GB | High-performance apps |
| **10iops-tier** | 10 IOPS/GB | Databases, analytics |
| **custom** | 100-48000 | Specific requirements |

### Block Volume Creation

```hcl
resource "ibm_is_volume" "data_volume" {
  name           = "app-data-volume"
  profile        = "10iops-tier"
  zone           = "us-south-1"
  capacity       = 500  # GB
  resource_group = var.resource_group_id
  
  # Encryption with customer key
  encryption_key = ibm_kms_key.volume_key.crn
  
  tags = ["environment:production", "tier:database"]
}
```

### Volume Attachment

```hcl
resource "ibm_is_instance_volume_attachment" "attachment" {
  instance = ibm_is_instance.vsi.id
  volume   = ibm_is_volume.data_volume.id
  
  name                                = "data-volume-attachment"
  delete_volume_on_instance_delete    = false
  delete_volume_on_attachment_delete  = false
}
```

### Volume Snapshots

```hcl
resource "ibm_is_snapshot" "volume_snapshot" {
  name          = "app-data-snapshot"
  source_volume = ibm_is_volume.data_volume.id
  
  resource_group = var.resource_group_id
  
  tags = ["backup", "daily"]
}
```

### Snapshot Consistency Group

```hcl
resource "ibm_is_snapshot_consistency_group" "consistency_group" {
  name = "multi-volume-snapshot"
  
  snapshots {
    name          = "volume-1-snapshot"
    source_volume = ibm_is_volume.volume_1.id
  }
  
  snapshots {
    name          = "volume-2-snapshot"
    source_volume = ibm_is_volume.volume_2.id
  }
  
  delete_snapshots_on_delete = false
  resource_group            = var.resource_group_id
}
```

### Volume from Snapshot

```hcl
resource "ibm_is_volume" "restored_volume" {
  name           = "restored-data-volume"
  profile        = "10iops-tier"
  zone           = "us-south-1"
  source_snapshot = ibm_is_snapshot.volume_snapshot.id
  
  encryption_key = ibm_kms_key.volume_key.crn
}
```

## 📁 File Storage

### File Share Creation

```hcl
resource "ibm_is_share" "file_share" {
  name    = "shared-storage"
  size    = 1000  # GB
  profile = "dp2"  # Defined performance
  zone    = "us-south-1"
  
  resource_group = var.resource_group_id
  
  # Encryption
  encryption_key = ibm_kms_key.file_key.crn
  
  tags = ["shared", "nfs"]
}
```

### File Share Profiles

| Profile | IOPS | Throughput | Use Case |
|---------|------|------------|----------|
| **dp2** | 100-1000 | 64-128 MB/s | General purpose |
| **tier-3iops** | 3 IOPS/GB | Variable | Balanced |
| **tier-5iops** | 5 IOPS/GB | Variable | High performance |
| **tier-10iops** | 10 IOPS/GB | Variable | Intensive workloads |

### Mount Target

```hcl
resource "ibm_is_share_mount_target" "mount_target" {
  share = ibm_is_share.file_share.id
  name  = "mount-target-1"
  
  virtual_network_interface {
    name            = "share-vni"
    subnet          = ibm_is_subnet.subnet.id
    security_groups = [ibm_is_security_group.file_sg.id]
  }
}
```

### File Share Replication

```hcl
resource "ibm_is_share_replica" "replica" {
  share             = ibm_is_share.file_share.id
  name              = "shared-storage-replica"
  replication_cron_spec = "0 */12 * * *"  # Every 12 hours
  zone              = "us-south-2"
  profile           = "dp2"
  
  resource_group = var.resource_group_id
}
```

### NFS Mount on VSI

```hcl
resource "ibm_is_instance" "vsi" {
  # ... VSI configuration ...
  
  user_data = <<-EOT
    #!/bin/bash
    # Install NFS client
    apt-get update
    apt-get install -y nfs-common
    
    # Create mount point
    mkdir -p /mnt/shared
    
    # Mount file share
    mount -t nfs4 -o sec=sys,vers=4.1 \
      ${ibm_is_share_mount_target.mount_target.mount_path} \
      /mnt/shared
    
    # Add to fstab for persistence
    echo "${ibm_is_share_mount_target.mount_target.mount_path} /mnt/shared nfs4 sec=sys,vers=4.1 0 0" >> /etc/fstab
  EOT
}
```

## 🔐 Storage Security

### Encryption Best Practices

```hcl
# Create KMS key for storage encryption
resource "ibm_kms_key" "storage_key" {
  instance_id  = ibm_resource_instance.kms.guid
  key_name     = "storage-encryption-key"
  standard_key = false
  
  rotation {
    enabled        = true
    interval_month = 3
  }
}

# Grant service authorization
resource "ibm_iam_authorization_policy" "cos_kms" {
  source_service_name         = "cloud-object-storage"
  source_resource_instance_id = ibm_resource_instance.cos.guid
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  roles                       = ["Reader"]
}
```

### Access Control

```hcl
# COS bucket policy
resource "ibm_cos_bucket_policy" "policy" {
  bucket_crn      = ibm_cos_bucket.standard_bucket.crn
  bucket_location = ibm_cos_bucket.standard_bucket.region_location
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          IBM = ["iam-ServiceId-${ibm_iam_service_id.app_service_id.id}"]
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = "${ibm_cos_bucket.standard_bucket.crn}/*"
      }
    ]
  })
}
```

## 📊 Storage Patterns

### Three-Tier Storage Architecture

```
Hot Tier (Standard COS)
    ↓ (30 days)
Warm Tier (Vault)
    ↓ (90 days)
Cold Tier (Cold Vault)
    ↓ (365 days)
Archive/Delete
```

### Backup Strategy

```
Production Data (Block Storage)
    ↓ (Daily Snapshots)
Snapshot Storage
    ↓ (Weekly Copy)
COS Bucket (Regional)
    ↓ (Replication)
COS Bucket (Cross-Region)
```

## 🔄 Integration Points

### Upstream Dependencies
- **Security Infrastructure** - KMS for encryption
- **VPC Infrastructure** - VPE for private connectivity
- **IAM Infrastructure** - Access policies
- **Resource Management** - Resource groups

### Downstream Consumers
- **VSI Infrastructure** - Block storage volumes
- **Database Infrastructure** - Database storage
- **Kubernetes/OpenShift** - Persistent volumes
- **Backup/Recovery** - Backup storage
- **Observability** - Log archival

## 🛠️ Terraform Resources

Key Terraform resources:
- `ibm_resource_instance` - COS instance
- `ibm_cos_bucket` - Object storage buckets
- `ibm_is_volume` - Block storage volumes
- `ibm_is_snapshot` - Volume snapshots
- `ibm_is_share` - File storage shares
- `ibm_is_share_mount_target` - NFS mount targets
- `ibm_cos_bucket_replication_rule` - Replication rules
- `ibm_iam_authorization_policy` - Service-to-service auth

## 📈 Best Practices

### 1. Object Storage
- Use appropriate storage classes
- Implement lifecycle policies
- Enable versioning for critical data
- Use VPE for private connectivity
- Implement replication for DR

### 2. Block Storage
- Choose appropriate IOPS profiles
- Enable encryption with customer keys
- Regular snapshot schedules
- Use consistency groups for multi-volume apps
- Monitor volume performance

### 3. File Storage
- Select appropriate performance profiles
- Implement replication for HA
- Use security groups for access control
- Regular backup schedules
- Monitor mount target health

### 4. General
- Tag all storage resources
- Implement retention policies
- Monitor storage costs
- Regular capacity planning
- Audit access patterns

## 🔗 Related Documentation

- [Security Infrastructure](../security-infrastructure/) - Encryption keys
- [VPC Infrastructure](../vpc-infrastructure/) - VPE connectivity
- [VSI Infrastructure](../vsi-infrastructure/) - Volume attachments
- [Observability Infrastructure](../observability-infrastructure/) - Storage monitoring
- [Database Infrastructure](../database-infrastructure/) - Database storage

## 📚 Additional Resources

- [IBM Cloud Object Storage Documentation](https://cloud.ibm.com/docs/cloud-object-storage)
- [Block Storage for VPC Documentation](https://cloud.ibm.com/docs/vpc?topic=vpc-block-storage-about)
- [File Storage for VPC Documentation](https://cloud.ibm.com/docs/vpc?topic=vpc-file-storage-vpc-about)
- [Storage Best Practices](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-best-practices)

---

**Navigation:** [← Back to Main Guide](../IBM-CLOUD-LANDING-ZONE-GUIDE.md) | [Next: Database Infrastructure →](../database-infrastructure/)
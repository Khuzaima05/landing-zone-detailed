# 🗄️ Database Infrastructure Module

## Overview

The Database Infrastructure module provides managed database services for IBM Cloud Landing Zone deployments, including relational databases, NoSQL databases, caching solutions, and data warehousing with enterprise features like high availability, encryption, and automated backups.

## 🎯 What This Module Covers

### Core Database Services

#### 1. **IBM Cloud Databases**
- PostgreSQL - Relational database
- MySQL - Relational database
- MongoDB - Document database
- Redis - In-memory cache
- Elasticsearch - Search and analytics
- etcd - Distributed key-value store
- RabbitMQ - Message broker
- DataStax - Cassandra database

#### 2. **Db2 on Cloud**
- Enterprise relational database
- OLTP and OLAP workloads
- High availability configurations
- Advanced security features

#### 3. **Database Features**
- Automated backups and point-in-time recovery
- High availability with automatic failover
- Read replicas for scaling
- Encryption at rest and in transit
- Private endpoint connectivity
- Monitoring and alerting

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                           │
│              (Applications, Microservices)                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Connection Layer                            │
│         (Private Endpoints, Service Credentials)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Database Services                           │
│    (PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Storage & Backup                            │
│         (Encrypted Storage, Automated Backups, COS)         │
└─────────────────────────────────────────────────────────────┘
```

## 🐘 PostgreSQL

### Database Instance

```hcl
resource "ibm_database" "postgresql" {
  name              = "landing-zone-postgresql"
  plan              = "standard"
  location          = "us-south"
  service           = "databases-for-postgresql"
  resource_group_id = var.resource_group_id
  
  # Version
  version = "15"
  
  # Resource allocation
  members_memory_allocation_mb = 4096
  members_disk_allocation_mb   = 20480
  members_cpu_allocation_count = 3
  
  # High availability
  members_count = 3
  
  # Backup configuration
  backup_id = var.backup_id  # Optional: restore from backup
  
  # Encryption
  key_protect_key = ibm_kms_key.database_key.crn
  
  # Private endpoint
  service_endpoints = "private"
  
  tags = ["database", "postgresql", "production"]
}
```

### Database Configuration

```hcl
resource "ibm_database" "postgresql" {
  # ... basic configuration ...
  
  # PostgreSQL-specific configuration
  configuration = jsonencode({
    max_connections           = 200
    shared_buffers           = "1GB"
    effective_cache_size     = "3GB"
    maintenance_work_mem     = "256MB"
    checkpoint_completion_target = 0.9
    wal_buffers              = "16MB"
    default_statistics_target = 100
    random_page_cost         = 1.1
    effective_io_concurrency = 200
    work_mem                 = "5MB"
    min_wal_size            = "1GB"
    max_wal_size            = "4GB"
  })
}
```

### Scaling

```hcl
# Scale up resources
resource "ibm_database" "postgresql" {
  # ... basic configuration ...
  
  members_memory_allocation_mb = 8192   # Scale to 8GB
  members_disk_allocation_mb   = 40960  # Scale to 40GB
  members_cpu_allocation_count = 6      # Scale to 6 CPUs
}
```

### Read Replica

```hcl
resource "ibm_database" "postgresql_replica" {
  name              = "landing-zone-postgresql-replica"
  plan              = "standard"
  location          = "us-east"
  service           = "databases-for-postgresql"
  resource_group_id = var.resource_group_id
  
  # Link to primary
  remote_leader_id = ibm_database.postgresql.id
  
  members_memory_allocation_mb = 4096
  members_disk_allocation_mb   = 20480
  members_cpu_allocation_count = 3
}
```

## 🐬 MySQL

### Database Instance

```hcl
resource "ibm_database" "mysql" {
  name              = "landing-zone-mysql"
  plan              = "standard"
  location          = "us-south"
  service           = "databases-for-mysql"
  resource_group_id = var.resource_group_id
  
  version = "8.0"
  
  members_memory_allocation_mb = 4096
  members_disk_allocation_mb   = 20480
  members_cpu_allocation_count = 3
  
  service_endpoints = "private"
  key_protect_key   = ibm_kms_key.database_key.crn
  
  # MySQL configuration
  configuration = jsonencode({
    max_connections        = 200
    innodb_buffer_pool_size = "2G"
    innodb_log_file_size   = "512M"
  })
}
```

## 🍃 MongoDB

### Database Instance

```hcl
resource "ibm_database" "mongodb" {
  name              = "landing-zone-mongodb"
  plan              = "standard"
  location          = "us-south"
  service           = "databases-for-mongodb"
  resource_group_id = var.resource_group_id
  
  version = "6.0"
  
  members_memory_allocation_mb = 4096
  members_disk_allocation_mb   = 20480
  members_cpu_allocation_count = 3
  
  # MongoDB Enterprise features
  members_count = 3  # Replica set
  
  service_endpoints = "private"
  key_protect_key   = ibm_kms_key.database_key.crn
}
```

## 🔴 Redis

### Cache Instance

```hcl
resource "ibm_database" "redis" {
  name              = "landing-zone-redis"
  plan              = "standard"
  location          = "us-south"
  service           = "databases-for-redis"
  resource_group_id = var.resource_group_id
  
  version = "7.0"
  
  members_memory_allocation_mb = 2048
  members_disk_allocation_mb   = 10240
  members_cpu_allocation_count = 3
  
  # High availability
  members_count = 3
  
  service_endpoints = "private"
  
  # Redis configuration
  configuration = jsonencode({
    maxmemory-policy = "allkeys-lru"
    timeout          = 300
  })
}
```

## 🔍 Elasticsearch

### Search Instance

```hcl
resource "ibm_database" "elasticsearch" {
  name              = "landing-zone-elasticsearch"
  plan              = "standard"
  location          = "us-south"
  service           = "databases-for-elasticsearch"
  resource_group_id = var.resource_group_id
  
  version = "8.7"
  
  members_memory_allocation_mb = 8192
  members_disk_allocation_mb   = 40960
  members_cpu_allocation_count = 6
  
  members_count = 3
  
  service_endpoints = "private"
  key_protect_key   = ibm_kms_key.database_key.crn
}
```

## 🔐 Database Security

### Private Endpoints

```hcl
# Service credentials with private endpoint
resource "ibm_resource_key" "database_credentials" {
  name                 = "database-credentials"
  resource_instance_id = ibm_database.postgresql.id
  role                 = "Administrator"
  
  parameters = {
    service-endpoints = "private"
  }
}
```

### VPE Gateway for Databases

```hcl
resource "ibm_is_virtual_endpoint_gateway" "database_vpe" {
  name = "database-vpe"
  vpc  = ibm_is_vpc.vpc.id
  
  target {
    crn           = ibm_database.postgresql.id
    resource_type = "provider_cloud_service"
  }
  
  # Bind to subnets
  dynamic "ips" {
    for_each = var.database_subnets
    content {
      subnet = ips.value.id
      name   = "${ips.value.name}-db-vpe-ip"
    }
  }
  
  security_groups = [ibm_is_security_group.database_sg.id]
}
```

### Database Security Group

```hcl
resource "ibm_is_security_group" "database_sg" {
  name = "database-security-group"
  vpc  = ibm_is_vpc.vpc.id
}

# Allow PostgreSQL from application tier
resource "ibm_is_security_group_rule" "postgresql_inbound" {
  group     = ibm_is_security_group.database_sg.id
  direction = "inbound"
  remote    = ibm_is_security_group.app_sg.id
  
  tcp {
    port_min = 5432
    port_max = 5432
  }
}

# Allow MySQL from application tier
resource "ibm_is_security_group_rule" "mysql_inbound" {
  group     = ibm_is_security_group.database_sg.id
  direction = "inbound"
  remote    = ibm_is_security_group.app_sg.id
  
  tcp {
    port_min = 3306
    port_max = 3306
  }
}
```

### Encryption

```hcl
# KMS key for database encryption
resource "ibm_kms_key" "database_key" {
  instance_id  = ibm_resource_instance.kms.guid
  key_name     = "database-encryption-key"
  standard_key = false
  
  rotation {
    enabled        = true
    interval_month = 3
  }
}

# Service authorization
resource "ibm_iam_authorization_policy" "database_kms" {
  source_service_name         = "databases-for-postgresql"
  source_resource_instance_id = ibm_database.postgresql.id
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  roles                       = ["Reader"]
}
```

## 💾 Backup and Recovery

### Automated Backups

```hcl
resource "ibm_database" "postgresql" {
  # ... basic configuration ...
  
  # Backup configuration
  backup_encryption_key_crn = ibm_kms_key.backup_key.crn
  
  # Point-in-time recovery
  point_in_time_recovery_deployment_id = var.pitr_deployment_id
  point_in_time_recovery_time         = var.pitr_time
}
```

### Manual Backup

```hcl
resource "ibm_database_backup" "manual_backup" {
  deployment_id = ibm_database.postgresql.id
}
```

### Restore from Backup

```hcl
resource "ibm_database" "postgresql_restored" {
  name              = "landing-zone-postgresql-restored"
  plan              = "standard"
  location          = "us-south"
  service           = "databases-for-postgresql"
  resource_group_id = var.resource_group_id
  
  # Restore from backup
  backup_id = ibm_database_backup.manual_backup.backup_id
  
  members_memory_allocation_mb = 4096
  members_disk_allocation_mb   = 20480
  members_cpu_allocation_count = 3
}
```

## 📊 Database Patterns

### Multi-Tier Application

```
Load Balancer
    ↓
Application Tier (VSI/Kubernetes)
    ↓
Redis Cache (Session/Cache)
    ↓
PostgreSQL (Primary Data)
    ↓
Elasticsearch (Search)
```

### High Availability Setup

```
Primary Database (us-south-1)
    ↓ (Synchronous Replication)
Standby Database (us-south-2)
    ↓ (Asynchronous Replication)
Read Replica (us-east)
```

## 🔄 Integration Points

### Upstream Dependencies
- **VPC Infrastructure** - Private connectivity
- **Security Infrastructure** - KMS encryption
- **IAM Infrastructure** - Access credentials
- **Networking Infrastructure** - VPE gateways

### Downstream Consumers
- **Application Workloads** - Database connections
- **Kubernetes/OpenShift** - Stateful applications
- **Analytics Platforms** - Data warehousing
- **Backup Services** - Database backups

## 🛠️ Terraform Resources

Key Terraform resources:
- `ibm_database` - Database instances
- `ibm_resource_key` - Service credentials
- `ibm_database_backup` - Manual backups
- `ibm_is_virtual_endpoint_gateway` - Private endpoints
- `ibm_iam_authorization_policy` - Service authorizations

## 📈 Best Practices

### 1. High Availability
- Deploy with 3 members for HA
- Use read replicas for read scaling
- Implement automatic failover
- Regular backup testing
- Multi-zone deployment

### 2. Security
- Always use private endpoints
- Enable encryption at rest with KMS
- Use TLS for connections
- Implement least privilege access
- Regular security audits

### 3. Performance
- Right-size resources initially
- Monitor and scale as needed
- Use connection pooling
- Implement caching strategies
- Optimize queries regularly

### 4. Backup and Recovery
- Enable automated backups
- Test restore procedures
- Implement PITR where needed
- Archive old backups to COS
- Document recovery procedures

### 5. Monitoring
- Monitor database metrics
- Set up alerting
- Track slow queries
- Monitor connection counts
- Review backup status

## 🔗 Related Documentation

- [VPC Infrastructure](../vpc-infrastructure/) - Network connectivity
- [Security Infrastructure](../security-infrastructure/) - Encryption keys
- [Storage Infrastructure](../storage-infrastructure/) - Backup storage
- [Observability Infrastructure](../observability-infrastructure/) - Database monitoring
- [IAM Infrastructure](../iam-infrastructure/) - Access management

## 📚 Additional Resources

- [IBM Cloud Databases Documentation](https://cloud.ibm.com/docs/databases-for-postgresql)
- [PostgreSQL Best Practices](https://cloud.ibm.com/docs/databases-for-postgresql?topic=databases-for-postgresql-best-practices)
- [MySQL Best Practices](https://cloud.ibm.com/docs/databases-for-mysql?topic=databases-for-mysql-best-practices)
- [MongoDB Best Practices](https://cloud.ibm.com/docs/databases-for-mongodb?topic=databases-for-mongodb-best-practices)
- [Redis Best Practices](https://cloud.ibm.com/docs/databases-for-redis?topic=databases-for-redis-best-practices)

---

**Navigation:** [← Back to Main Guide](../IBM-CLOUD-LANDING-ZONE-GUIDE.md) | [Next: Networking Infrastructure →](../networking-infrastructure/)
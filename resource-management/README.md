# 📦 Resource Management Module

## Overview

The Resource Management module provides organizational structure and governance for IBM Cloud Landing Zone deployments, including resource groups, tagging strategies, cost management, and resource lifecycle management.

## 🎯 What This Module Covers

### Core Management Components

#### 1. **Resource Groups**
- Logical organization of resources
- Access control boundaries
- Cost tracking and allocation
- Lifecycle management
- Multi-environment separation

#### 2. **Tags and Labels**
- Resource categorization
- Cost allocation
- Automation triggers
- Compliance tracking
- Search and filtering

#### 3. **Cost Management**
- Budget tracking
- Cost allocation
- Spending alerts
- Usage monitoring
- Optimization recommendations

#### 4. **Resource Lifecycle**
- Provisioning workflows
- Update management
- Decommissioning processes
- State management
- Drift detection

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    IBM Cloud Account                         │
│                  (Top-Level Container)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Resource Groups                           │
│    (Production, Development, Shared Services, etc.)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Resources                                 │
│    (VPC, VSI, Databases, Storage, Services)                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Tags & Metadata                           │
│    (Environment, Owner, Cost Center, Compliance)            │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Resource Groups

### Resource Group Strategy

```
landing-zone-production
    ├── VPC Infrastructure
    ├── Compute Resources
    ├── Databases
    └── Storage

landing-zone-development
    ├── VPC Infrastructure
    ├── Compute Resources
    ├── Databases
    └── Storage

landing-zone-shared-services
    ├── Security Services (KMS, Secrets Manager)
    ├── Observability (Monitoring, Logging)
    ├── Networking (Transit Gateway, DNS)
    └── IAM Resources

landing-zone-management
    ├── Terraform State Storage
    ├── CI/CD Resources
    └── Backup Storage
```

### Resource Group Creation

```hcl
# Production resource group
resource "ibm_resource_group" "production" {
  name = "landing-zone-production"
  tags = ["environment:production", "managed-by:terraform"]
}

# Development resource group
resource "ibm_resource_group" "development" {
  name = "landing-zone-development"
  tags = ["environment:development", "managed-by:terraform"]
}

# Shared services resource group
resource "ibm_resource_group" "shared_services" {
  name = "landing-zone-shared-services"
  tags = ["environment:shared", "managed-by:terraform"]
}

# Management resource group
resource "ibm_resource_group" "management" {
  name = "landing-zone-management"
  tags = ["environment:management", "managed-by:terraform"]
}
```

### Resource Group Data Source

```hcl
# Reference existing resource group
data "ibm_resource_group" "existing" {
  name = "landing-zone-production"
}

# Use in resource creation
resource "ibm_is_vpc" "vpc" {
  name           = "production-vpc"
  resource_group = data.ibm_resource_group.existing.id
}
```

## 🏷️ Tagging Strategy

### Tag Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **Environment** | Deployment stage | `environment:production`, `environment:development` |
| **Owner** | Team ownership | `owner:platform-team`, `owner:app-team` |
| **Cost Center** | Billing allocation | `cost-center:engineering`, `cost-center:operations` |
| **Compliance** | Regulatory requirements | `compliance:pci-dss`, `compliance:hipaa` |
| **Application** | Application grouping | `app:web-portal`, `app:api-gateway` |
| **Lifecycle** | Resource state | `lifecycle:active`, `lifecycle:deprecated` |
| **Backup** | Backup requirements | `backup:daily`, `backup:weekly` |

### Tagging Implementation

```hcl
# VPC with comprehensive tags
resource "ibm_is_vpc" "vpc" {
  name           = "production-vpc"
  resource_group = ibm_resource_group.production.id
  
  tags = [
    "environment:production",
    "owner:platform-team",
    "cost-center:engineering",
    "compliance:pci-dss",
    "managed-by:terraform",
    "backup:daily"
  ]
}

# VSI with tags
resource "ibm_is_instance" "vsi" {
  name           = "web-server-01"
  vpc            = ibm_is_vpc.vpc.id
  zone           = "us-south-1"
  profile        = "bx2-2x8"
  resource_group = ibm_resource_group.production.id
  
  tags = [
    "environment:production",
    "tier:web",
    "app:web-portal",
    "owner:app-team",
    "cost-center:engineering",
    "backup:daily"
  ]
}

# Database with tags
resource "ibm_database" "postgresql" {
  name              = "production-db"
  service           = "databases-for-postgresql"
  plan              = "standard"
  location          = "us-south"
  resource_group_id = ibm_resource_group.production.id
  
  tags = [
    "environment:production",
    "tier:database",
    "app:web-portal",
    "owner:app-team",
    "cost-center:engineering",
    "compliance:pci-dss",
    "backup:hourly"
  ]
}
```

### Access Tags for ABAC

```hcl
# Create access tag
resource "ibm_iam_access_tag" "production_tag" {
  name = "production-resources"
}

# Attach to resource
resource "ibm_iam_resource_tag" "vpc_tag" {
  resource_id = ibm_is_vpc.vpc.crn
  tag_type    = "access"
  tags        = ["production-resources"]
}

# Policy using access tag
resource "ibm_iam_access_group_policy" "tagged_policy" {
  access_group_id = ibm_iam_access_group.developers.id
  roles           = ["Viewer"]
  
  resources {
    attributes = {
      "access-tag:production-resources" = "*"
    }
  }
}
```

## 💰 Cost Management

### Cost Allocation Tags

```hcl
locals {
  cost_tags = {
    production = [
      "cost-center:engineering",
      "project:platform-modernization",
      "budget:fy2024-q1"
    ]
    
    development = [
      "cost-center:engineering",
      "project:platform-modernization",
      "budget:fy2024-q1-dev"
    ]
  }
}

resource "ibm_is_vpc" "vpc" {
  name = "production-vpc"
  tags = concat(
    ["environment:production"],
    local.cost_tags.production
  )
}
```

### Budget Monitoring

```hcl
# Note: Budget monitoring is typically configured via IBM Cloud Console
# or using IBM Cloud CLI, not directly in Terraform

# Example of tagging for budget tracking
resource "ibm_resource_group" "production" {
  name = "landing-zone-production"
  
  tags = [
    "budget:monthly-10000",
    "alert-threshold:80-percent",
    "cost-center:engineering"
  ]
}
```

### Cost Optimization Tags

```hcl
resource "ibm_is_instance" "vsi" {
  name = "dev-server"
  
  tags = [
    "environment:development",
    "auto-stop:enabled",
    "schedule:weekdays-only",
    "cost-optimization:candidate"
  ]
}
```

## 🔄 Resource Lifecycle Management

### Terraform State Management

```hcl
terraform {
  backend "s3" {
    bucket                      = "landing-zone-terraform-state"
    key                         = "production/terraform.tfstate"
    region                      = "us-south"
    endpoint                    = "s3.us-south.cloud-object-storage.appdomain.cloud"
    skip_credentials_validation = true
    skip_region_validation      = true
  }
}
```

### Resource Naming Convention

```hcl
locals {
  naming_convention = {
    prefix      = "lz"  # landing-zone
    environment = var.environment
    region      = var.region
    separator   = "-"
  }
  
  # Generate consistent names
  vpc_name = join(local.naming_convention.separator, [
    local.naming_convention.prefix,
    local.naming_convention.environment,
    local.naming_convention.region,
    "vpc"
  ])
  # Result: lz-production-us-south-vpc
}

resource "ibm_is_vpc" "vpc" {
  name = local.vpc_name
}
```

### Resource Dependencies

```hcl
# Explicit dependencies
resource "ibm_is_vpc" "vpc" {
  name = "production-vpc"
}

resource "ibm_is_subnet" "subnet" {
  name = "production-subnet"
  vpc  = ibm_is_vpc.vpc.id
  
  # Explicit dependency
  depends_on = [ibm_is_vpc.vpc]
}

# Implicit dependencies through references
resource "ibm_is_instance" "vsi" {
  name   = "web-server"
  vpc    = ibm_is_vpc.vpc.id
  subnet = ibm_is_subnet.subnet.id
  # Implicit dependencies on vpc and subnet
}
```

### Lifecycle Rules

```hcl
resource "ibm_is_vpc" "vpc" {
  name = "production-vpc"
  
  lifecycle {
    # Prevent accidental deletion
    prevent_destroy = true
    
    # Ignore changes to tags
    ignore_changes = [tags]
    
    # Create new before destroying old
    create_before_destroy = true
  }
}
```

## 📊 Resource Organization Patterns

### Multi-Environment Structure

```
Account
├── Resource Group: Production
│   ├── VPC: prod-us-south-vpc
│   ├── VPC: prod-us-east-vpc
│   └── Shared: Transit Gateway
│
├── Resource Group: Development
│   ├── VPC: dev-us-south-vpc
│   └── VPC: dev-us-east-vpc
│
├── Resource Group: Shared Services
│   ├── KMS Instance
│   ├── Secrets Manager
│   ├── Monitoring
│   └── Log Analysis
│
└── Resource Group: Management
    ├── COS (Terraform State)
    ├── COS (Backups)
    └── Activity Tracker
```

### Application-Centric Structure

```
Account
├── Resource Group: Web Application
│   ├── VPC Infrastructure
│   ├── Load Balancers
│   ├── VSI Instances
│   └── PostgreSQL Database
│
├── Resource Group: API Gateway
│   ├── VPC Infrastructure
│   ├── API Gateway Instances
│   ├── Redis Cache
│   └── MongoDB Database
│
└── Resource Group: Shared Platform
    ├── Transit Gateway
    ├── DNS Services
    ├── Security Services
    └── Observability
```

## 🔄 Integration Points

### Upstream Dependencies
- **IBM Cloud Account** - Account-level configuration
- **IAM Infrastructure** - Access control for resource groups

### Downstream Consumers
- **All Infrastructure Modules** - Resource group assignment
- **Cost Management Tools** - Tag-based cost allocation
- **Automation Tools** - Resource organization
- **Compliance Tools** - Tag-based compliance tracking

## 🛠️ Terraform Resources

Key Terraform resources:
- `ibm_resource_group` - Resource groups
- `ibm_resource_tag` - Resource tagging
- `ibm_iam_access_tag` - Access tags for ABAC
- `ibm_resource_instance` - Service instances

## 📈 Best Practices

### 1. Resource Groups
- Plan resource group strategy upfront
- Align with organizational structure
- One resource group per environment
- Separate shared services
- Document resource group purposes

### 2. Tagging
- Establish tagging standards
- Enforce mandatory tags
- Use consistent tag formats
- Regular tag audits
- Automate tag compliance

### 3. Naming Conventions
- Use consistent naming patterns
- Include environment in names
- Use descriptive names
- Avoid special characters
- Document naming standards

### 4. Cost Management
- Tag all resources for cost tracking
- Set up budget alerts
- Regular cost reviews
- Identify optimization opportunities
- Document cost allocation

### 5. Lifecycle Management
- Use Terraform state locking
- Implement change management
- Regular state backups
- Document dependencies
- Plan for disaster recovery

## 📋 Tagging Checklist

```hcl
# Mandatory tags for all resources
locals {
  mandatory_tags = [
    "environment:${var.environment}",
    "managed-by:terraform",
    "owner:${var.owner_team}",
    "cost-center:${var.cost_center}"
  ]
  
  optional_tags = var.additional_tags
  
  all_tags = concat(local.mandatory_tags, local.optional_tags)
}

# Apply to resources
resource "ibm_is_vpc" "vpc" {
  name = "vpc"
  tags = local.all_tags
}
```

## 🔗 Related Documentation

- [IAM Infrastructure](../iam-infrastructure/) - Access control
- [All Infrastructure Modules](../) - Resource organization
- [Security Infrastructure](../security-infrastructure/) - Compliance tagging

## 📚 Additional Resources

- [Resource Groups Documentation](https://cloud.ibm.com/docs/account?topic=account-rgs)
- [Tagging Best Practices](https://cloud.ibm.com/docs/account?topic=account-tag)
- [Cost Management](https://cloud.ibm.com/docs/billing-usage)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

---

**Navigation:** [← Back to Main Guide](../IBM-CLOUD-LANDING-ZONE-GUIDE.md)
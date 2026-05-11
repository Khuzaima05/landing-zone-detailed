# Terraform Module Usage

## Introduction

This chapter provides practical examples and patterns for using the `terraform-ibm-base-ocp-vpc` module to deploy OpenShift clusters. It covers basic usage, advanced configurations, and common deployment scenarios.

## Basic Module Usage

### Minimum Configuration

```hcl
module "ocp_cluster" {
  source  = "terraform-ibm-modules/base-ocp-vpc/ibm"
  version = "3.0.0"

  cluster_name      = "my-ocp-cluster"
  ocp_version       = "4.13"
  resource_group_id = var.resource_group_id
  region            = "us-south"
  vpc_id            = var.vpc_id
  
  vpc_subnets = {
    zone-1 = [var.subnet_zone_1]
    zone-2 = [var.subnet_zone_2]
    zone-3 = [var.subnet_zone_3]
  }
  
  worker_pools = [{
    pool_name        = "default"
    machine_type     = "bx2.4x16"
    workers_per_zone = 2
  }]
}
```

### Complete Production Configuration

```hcl
module "ocp_production" {
  source  = "terraform-ibm-modules/base-ocp-vpc/ibm"
  version = "3.0.0"

  # Basic Configuration
  cluster_name      = "prod-ocp-cluster"
  ocp_version       = "4.13"
  resource_group_id = var.resource_group_id
  region            = "us-south"
  
  # Network Configuration
  vpc_id = var.vpc_id
  vpc_subnets = {
    zone-1 = [var.subnet_zone_1]
    zone-2 = [var.subnet_zone_2]
    zone-3 = [var.subnet_zone_3]
  }
  disable_public_endpoint = true
  
  # Worker Pools
  worker_pools = [
    {
      pool_name        = "default"
      machine_type     = "bx2.8x32"
      workers_per_zone = 3
    },
    {
      pool_name        = "compute"
      machine_type     = "cx2.16x32"
      workers_per_zone = 2
    }
  ]
  
  # Security
  kms_config = {
    instance_id = var.kms_instance_id
    crk_id      = var.kms_crk_id
  }
  
  # Storage
  cos_instance_crn = var.cos_instance_crn
  
  # Add-ons
  cluster_addons = {
    "cluster-autoscaler" = {
      version = "1.0.0"
    }
    "vpc-block-csi-driver" = {
      version = "5.0"
    }
  }
  
  # Tags
  tags = [
    "env:production",
    "team:platform",
    "cost-center:engineering"
  ]
}
```

## Common Deployment Patterns

### Pattern 1: Development Cluster

```hcl
module "dev_cluster" {
  source  = "terraform-ibm-modules/base-ocp-vpc/ibm"
  version = "3.0.0"

  cluster_name      = "dev-ocp-cluster"
  ocp_version       = "4.13"
  resource_group_id = var.dev_resource_group_id
  region            = "us-south"
  vpc_id            = var.dev_vpc_id
  
  vpc_subnets = {
    zone-1 = [var.dev_subnet]
  }
  
  worker_pools = [{
    pool_name        = "default"
    machine_type     = "bx2.2x8"
    workers_per_zone = 1
  }]
  
  disable_public_endpoint = false
  
  tags = ["env:development"]
}
```

### Pattern 2: Multi-Zone Production

```hcl
module "prod_cluster" {
  source  = "terraform-ibm-modules/base-ocp-vpc/ibm"
  version = "3.0.0"

  cluster_name      = "prod-ocp-cluster"
  ocp_version       = "4.13"
  resource_group_id = var.prod_resource_group_id
  region            = "us-south"
  vpc_id            = var.prod_vpc_id
  
  vpc_subnets = {
    zone-1 = [var.prod_subnet_zone_1]
    zone-2 = [var.prod_subnet_zone_2]
    zone-3 = [var.prod_subnet_zone_3]
  }
  
  worker_pools = [{
    pool_name        = "default"
    machine_type     = "bx2.16x64"
    workers_per_zone = 5
  }]
  
  disable_public_endpoint = true
  
  kms_config = {
    instance_id = var.kms_instance_id
    crk_id      = var.kms_crk_id
  }
  
  cos_instance_crn = var.cos_instance_crn
  
  tags = ["env:production", "ha:enabled"]
}
```

### Pattern 3: Multiple Worker Pools

```hcl
module "multi_pool_cluster" {
  source  = "terraform-ibm-modules/base-ocp-vpc/ibm"
  version = "3.0.0"

  cluster_name      = "multi-pool-cluster"
  ocp_version       = "4.13"
  resource_group_id = var.resource_group_id
  region            = "us-south"
  vpc_id            = var.vpc_id
  
  vpc_subnets = {
    zone-1 = [var.subnet_zone_1]
    zone-2 = [var.subnet_zone_2]
    zone-3 = [var.subnet_zone_3]
  }
  
  worker_pools = [
    {
      pool_name        = "general"
      machine_type     = "bx2.8x32"
      workers_per_zone = 3
    },
    {
      pool_name        = "compute-intensive"
      machine_type     = "cx2.16x32"
      workers_per_zone = 2
    },
    {
      pool_name        = "memory-intensive"
      machine_type     = "mx2.16x128"
      workers_per_zone = 2
    }
  ]
  
  tags = ["workload:mixed"]
}
```

## Variable Files

### Development Environment

```hcl
# dev.tfvars
cluster_name      = "dev-ocp-cluster"
ocp_version       = "4.13"
resource_group_id = "dev-rg-id"
region            = "us-south"
vpc_id            = "dev-vpc-id"

vpc_subnets = {
  zone-1 = [{
    id         = "subnet-dev-1"
    zone       = "us-south-1"
    cidr_block = "10.10.1.0/24"
  }]
}

worker_pools = [{
  pool_name        = "default"
  machine_type     = "bx2.4x16"
  workers_per_zone = 2
}]

tags = ["env:dev", "managed-by:terraform"]
```

### Production Environment

```hcl
# prod.tfvars
cluster_name      = "prod-ocp-cluster"
ocp_version       = "4.13"
resource_group_id = "prod-rg-id"
region            = "us-south"
vpc_id            = "prod-vpc-id"

vpc_subnets = {
  zone-1 = [{
    id         = "subnet-prod-1"
    zone       = "us-south-1"
    cidr_block = "10.0.1.0/24"
  }]
  zone-2 = [{
    id         = "subnet-prod-2"
    zone       = "us-south-2"
    cidr_block = "10.0.2.0/24"
  }]
  zone-3 = [{
    id         = "subnet-prod-3"
    zone       = "us-south-3"
    cidr_block = "10.0.3.0/24"
  }]
}

worker_pools = [{
  pool_name        = "default"
  machine_type     = "bx2.16x64"
  workers_per_zone = 5
}]

disable_public_endpoint = true

kms_config = {
  instance_id = "kms-instance-id"
  crk_id      = "crk-id"
}

cos_instance_crn = "cos-instance-crn"

tags = ["env:prod", "ha:enabled", "managed-by:terraform"]
```

## Using Module Outputs

### Accessing Outputs

```hcl
# Output cluster information
output "cluster_id" {
  value = module.ocp_cluster.cluster_id
}

output "cluster_name" {
  value = module.ocp_cluster.cluster_name
}

output "ingress_hostname" {
  value = module.ocp_cluster.ingress_hostname
}

output "master_url" {
  value = module.ocp_cluster.master_url
}
```

### Using Outputs in Other Modules

```hcl
# Use cluster outputs for application deployment
module "app_deployment" {
  source = "./modules/app"
  
  cluster_id       = module.ocp_cluster.cluster_id
  ingress_hostname = module.ocp_cluster.ingress_hostname
}
```

## Best Practices

### Version Pinning

```hcl
# Always pin module version
module "ocp_cluster" {
  source  = "terraform-ibm-modules/base-ocp-vpc/ibm"
  version = "3.0.0"  # Specific version
  
  # Not recommended:
  # version = "~> 3.0"  # Any 3.x version
  # version = ">= 3.0"  # Any version >= 3.0
}
```

### Variable Validation

```hcl
variable "cluster_name" {
  type        = string
  description = "Cluster name"
  
  validation {
    condition     = length(var.cluster_name) <= 32
    error_message = "Cluster name must be 32 characters or less."
  }
}
```

### Sensitive Data

```hcl
# Mark sensitive outputs
output "cluster_id" {
  value     = module.ocp_cluster.cluster_id
  sensitive = true
}

# Use environment variables for sensitive inputs
# export TF_VAR_ibmcloud_api_key="your-api-key"
```

## Deployment Workflow

### Step 1: Initialize

```bash
terraform init
```

### Step 2: Plan

```bash
terraform plan -var-file="prod.tfvars" -out=tfplan
```

### Step 3: Review

```bash
# Review the plan
terraform show tfplan
```

### Step 4: Apply

```bash
terraform apply tfplan
```

### Step 5: Verify

```bash
# Get cluster info
terraform output cluster_id
terraform output master_url

# Verify cluster
ibmcloud oc cluster get --cluster $(terraform output -raw cluster_id)
```

## Key Takeaways

✅ Use specific module versions
✅ Organize with variable files
✅ Validate inputs
✅ Protect sensitive data
✅ Use outputs for integration
✅ Follow deployment workflow

## Next Steps

Learn about:
- Best practices
- Troubleshooting
- Outputs and integration

---

**Navigation**: [← Back: Terraform Mapping](20-terraform-mapping.md) | [Next: Best Practices →](22-best-practices.md)
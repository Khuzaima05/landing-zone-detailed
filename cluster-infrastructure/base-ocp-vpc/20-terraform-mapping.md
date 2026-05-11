# Terraform Mapping

## Introduction

Understanding how Terraform module variables map to IBM Cloud resources and OpenShift configurations is essential for effective cluster deployment. This chapter provides a comprehensive mapping between the `terraform-ibm-base-ocp-vpc` module variables and the actual resources they create.

## Module Overview

### Module Source

```hcl
module "ocp_base" {
  source = "terraform-ibm-modules/base-ocp-vpc/ibm"
  version = "X.X.X"
  
  # Configuration variables
}
```

### Core Variable Categories

1. **Cluster Configuration**: Basic cluster settings
2. **Network Configuration**: VPC and networking
3. **Worker Configuration**: Worker pools and nodes
4. **Security Configuration**: Encryption and access
5. **Integration Configuration**: External services
6. **Add-on Configuration**: Optional features

## Cluster Configuration Variables

### cluster_name

**Variable**:
```hcl
variable "cluster_name" {
  type        = string
  description = "Name of the OpenShift cluster"
}
```

**Maps To**:
- IBM Cloud Kubernetes Service cluster resource
- Cluster DNS names
- Resource tags

**Example**:
```hcl
cluster_name = "prod-ocp-cluster"
```

**Result**:
- Cluster: `prod-ocp-cluster`
- API endpoint: `api.prod-ocp-cluster.us-south.containers.appdomain.cloud`

### ocp_version

**Variable**:
```hcl
variable "ocp_version" {
  type        = string
  description = "OpenShift version"
}
```

**Maps To**:
- Cluster version
- Control plane version
- Worker node version

**Example**:
```hcl
ocp_version = "4.13"
```

### resource_group_id

**Variable**:
```hcl
variable "resource_group_id" {
  type        = string
  description = "Resource group ID"
}
```

**Maps To**:
- All cluster resources
- VPC resources (if created)
- Storage resources

## Network Configuration Variables

### vpc_id

**Variable**:
```hcl
variable "vpc_id" {
  type        = string
  description = "Existing VPC ID"
}
```

**Maps To**:
- VPC for cluster deployment
- Subnet parent VPC
- Security group VPC

**Example**:
```hcl
vpc_id = "r006-12345678-1234-1234-1234-123456789012"
```

### vpc_subnets

**Variable**:
```hcl
variable "vpc_subnets" {
  type = map(list(object({
    id         = string
    zone       = string
    cidr_block = string
  })))
}
```

**Maps To**:
- Worker node placement
- Control plane placement
- Load balancer placement

**Example**:
```hcl
vpc_subnets = {
  zone-1 = [{
    id         = "subnet-id-1"
    zone       = "us-south-1"
    cidr_block = "10.0.1.0/24"
  }]
  zone-2 = [{
    id         = "subnet-id-2"
    zone       = "us-south-2"
    cidr_block = "10.0.2.0/24"
  }]
  zone-3 = [{
    id         = "subnet-id-3"
    zone       = "us-south-3"
    cidr_block = "10.0.3.0/24"
  }]
}
```

### disable_public_endpoint

**Variable**:
```hcl
variable "disable_public_endpoint" {
  type        = bool
  description = "Disable public service endpoint"
  default     = false
}
```

**Maps To**:
- API server endpoint configuration
- Cluster access method
- Load balancer type

**Values**:
- `false`: Public and private endpoints
- `true`: Private endpoint only

## Worker Configuration Variables

### worker_pools

**Variable**:
```hcl
variable "worker_pools" {
  type = list(object({
    pool_name        = string
    machine_type     = string
    workers_per_zone = number
  }))
}
```

**Maps To**:
- Worker pool resources
- Virtual server instances
- Node count per zone

**Example**:
```hcl
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
```

**Result**:
- Pool "default": 9 workers (3 per zone × 3 zones)
- Pool "compute": 6 workers (2 per zone × 3 zones)

### operating_system

**Variable**:
```hcl
variable "operating_system" {
  type        = string
  description = "Worker node OS"
  default     = "REDHAT_8_64"
}
```

**Maps To**:
- Worker node image
- OS type and version

**Options**:
- `REDHAT_8_64`: RHEL 8
- `RHCOS`: Red Hat CoreOS

## Security Configuration Variables

### kms_config

**Variable**:
```hcl
variable "kms_config" {
  type = object({
    instance_id = string
    crk_id      = string
  })
}
```

**Maps To**:
- etcd encryption
- Persistent volume encryption
- Key management integration

**Example**:
```hcl
kms_config = {
  instance_id = "12345678-1234-1234-1234-123456789012"
  crk_id      = "87654321-4321-4321-4321-210987654321"
}
```

### cos_instance_crn

**Variable**:
```hcl
variable "cos_instance_crn" {
  type        = string
  description = "COS instance CRN for registry"
}
```

**Maps To**:
- Image registry storage
- Registry operator configuration
- COS bucket

## Add-on Configuration Variables

### cluster_addons

**Variable**:
```hcl
variable "cluster_addons" {
  type = map(object({
    version = string
  }))
}
```

**Maps To**:
- Cluster add-on installations
- Add-on versions
- Add-on configurations

**Example**:
```hcl
cluster_addons = {
  "cluster-autoscaler" = {
    version = "1.0.0"
  }
  "vpc-block-csi-driver" = {
    version = "5.0"
  }
}
```

## Complete Example

### Full Configuration

```hcl
module "ocp_base" {
  source  = "terraform-ibm-modules/base-ocp-vpc/ibm"
  version = "3.0.0"

  # Cluster Configuration
  cluster_name       = "prod-ocp-cluster"
  ocp_version        = "4.13"
  resource_group_id  = var.resource_group_id
  region             = "us-south"
  
  # Network Configuration
  vpc_id     = var.vpc_id
  vpc_subnets = {
    zone-1 = [var.subnet_zone_1]
    zone-2 = [var.subnet_zone_2]
    zone-3 = [var.subnet_zone_3]
  }
  disable_public_endpoint = false
  
  # Worker Configuration
  worker_pools = [
    {
      pool_name        = "default"
      machine_type     = "bx2.8x32"
      workers_per_zone = 3
    }
  ]
  operating_system = "REDHAT_8_64"
  
  # Security Configuration
  kms_config = {
    instance_id = var.kms_instance_id
    crk_id      = var.kms_crk_id
  }
  cos_instance_crn = var.cos_instance_crn
  
  # Add-ons
  cluster_addons = {
    "cluster-autoscaler" = {
      version = "1.0.0"
    }
  }
  
  # Tags
  tags = [
    "env:production",
    "team:platform",
    "managed-by:terraform"
  ]
}
```

### Resource Mapping

**This Configuration Creates**:

1. **Cluster Resources**:
   - 1 OpenShift cluster
   - 3 control plane nodes (1 per zone)
   - 9 worker nodes (3 per zone)

2. **Network Resources**:
   - 1 public load balancer (API server)
   - 1 private load balancer (internal)
   - Security groups for cluster

3. **Storage Resources**:
   - COS bucket for registry
   - Storage classes for volumes

4. **Security Resources**:
   - KMS integration for encryption
   - IAM service authorizations

5. **Add-on Resources**:
   - Cluster autoscaler
   - VPC block CSI driver

## Variable Reference Table

| Variable | Type | Maps To | Required |
|----------|------|---------|----------|
| cluster_name | string | Cluster name | Yes |
| ocp_version | string | OpenShift version | Yes |
| resource_group_id | string | Resource group | Yes |
| region | string | IBM Cloud region | Yes |
| vpc_id | string | VPC | Yes |
| vpc_subnets | map | Subnets | Yes |
| worker_pools | list | Worker pools | Yes |
| operating_system | string | Node OS | No |
| kms_config | object | Encryption | No |
| cos_instance_crn | string | Registry storage | No |
| disable_public_endpoint | bool | Endpoint type | No |
| cluster_addons | map | Add-ons | No |
| tags | list | Resource tags | No |

## Output Mapping

### Module Outputs

**cluster_id**:
```hcl
output "cluster_id" {
  value = module.ocp_base.cluster_id
}
```
Maps to: IBM Cloud cluster ID

**cluster_name**:
```hcl
output "cluster_name" {
  value = module.ocp_base.cluster_name
}
```
Maps to: Cluster name

**ingress_hostname**:
```hcl
output "ingress_hostname" {
  value = module.ocp_base.ingress_hostname
}
```
Maps to: Default ingress subdomain

**master_url**:
```hcl
output "master_url" {
  value = module.ocp_base.master_url
}
```
Maps to: API server endpoint

## Best Practices

### Variable Organization

✅ Group related variables
✅ Use descriptive names
✅ Provide clear descriptions
✅ Set sensible defaults
✅ Validate inputs
✅ Document examples

### Resource Naming

✅ Use consistent naming
✅ Include environment
✅ Add purpose/function
✅ Keep names readable
✅ Follow conventions

### Configuration Management

✅ Use variable files
✅ Separate environments
✅ Version control
✅ Document changes
✅ Test configurations

## Key Takeaways

✅ Variables map to IBM Cloud resources
✅ Understanding mapping aids troubleshooting
✅ Complete configuration requires multiple variables
✅ Outputs provide resource information
✅ Proper variable organization is important
✅ Documentation is essential

## Next Steps

Learn about:
- Terraform module usage
- Best practices
- Troubleshooting

---

**Navigation**: [← Back: Runtime Scripts and Verification](19-runtime-scripts-verification.md) | [Next: Terraform Module Usage →](21-terraform-module-usage.md)
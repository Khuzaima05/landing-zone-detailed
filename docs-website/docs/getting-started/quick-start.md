# Quick Start

## Deploy Your First Landing Zone

### 1. Clone Repository

```bash
git clone https://github.com/ibm-cloud/landing-zone.git
cd landing-zone
```

### 2. Configure Variables

Create `terraform.tfvars`:

```hcl
ibmcloud_api_key = "your-api-key"
region           = "us-south"
resource_group   = "landing-zone-rg"
vpc_name         = "my-vpc"
```

### 3. Initialize Terraform

```bash
terraform init
```

### 4. Plan Deployment

```bash
terraform plan
```

### 5. Deploy

```bash
terraform apply
```

### 6. Verify

```bash
ibmcloud is vpcs
```

## Next Steps

- [Configure VPC](../../vpc/vpc-foundation/)
- [Add Compute Resources](../../vsi/)
- [Set Up Security](../../security/)

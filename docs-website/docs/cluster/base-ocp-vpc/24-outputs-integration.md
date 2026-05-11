# Outputs and Integration

## Introduction

Module outputs provide essential information about deployed resources that can be used for integration with other infrastructure components, automation, and documentation. This chapter explains available outputs, their uses, and integration patterns.

## Module Outputs

### Cluster Information Outputs

**cluster_id**:
```hcl
output "cluster_id" {
  description = "The unique identifier of the cluster"
  value       = module.ocp_base.cluster_id
}
```
**Use Cases**:
- Reference in other Terraform modules
- IBM Cloud CLI commands
- Automation scripts
- Documentation

**cluster_name**:
```hcl
output "cluster_name" {
  description = "The name of the cluster"
  value       = module.ocp_base.cluster_name
}
```
**Use Cases**:
- Display in dashboards
- Logging and monitoring
- Documentation
- User interfaces

**cluster_crn**:
```hcl
output "cluster_crn" {
  description = "The CRN of the cluster"
  value       = module.ocp_base.cluster_crn
}
```
**Use Cases**:
- IAM policy references
- Resource tagging
- Cost allocation
- Compliance tracking

### Network Outputs

**master_url**:
```hcl
output "master_url" {
  description = "The URL of the cluster master"
  value       = module.ocp_base.master_url
}
```
**Use Cases**:
- kubectl/oc configuration
- CI/CD pipeline configuration
- Application deployment
- Health monitoring

**ingress_hostname**:
```hcl
output "ingress_hostname" {
  description = "The hostname for cluster ingress"
  value       = module.ocp_base.ingress_hostname
}
```
**Use Cases**:
- Application route configuration
- DNS setup
- Load balancer configuration
- External access

**private_service_endpoint_url**:
```hcl
output "private_service_endpoint_url" {
  description = "Private endpoint URL"
  value       = module.ocp_base.private_service_endpoint_url
}
```
**Use Cases**:
- VPN configuration
- Private network access
- Security compliance
- Internal automation

### Worker Pool Outputs

**worker_pools**:
```hcl
output "worker_pools" {
  description = "Worker pool information"
  value       = module.ocp_base.worker_pools
}
```
**Use Cases**:
- Capacity planning
- Scaling decisions
- Cost tracking
- Documentation

## Integration Patterns

### Pattern 1: Application Deployment Module

```hcl
# Main cluster module
module "ocp_cluster" {
  source = "terraform-ibm-modules/base-ocp-vpc/ibm"
  # ... configuration
}

# Application deployment module
module "app_deployment" {
  source = "./modules/app-deployment"
  
  cluster_id       = module.ocp_cluster.cluster_id
  cluster_name     = module.ocp_cluster.cluster_name
  ingress_hostname = module.ocp_cluster.ingress_hostname
  
  depends_on = [module.ocp_cluster]
}
```

### Pattern 2: Monitoring Integration

```hcl
# Cluster module
module "ocp_cluster" {
  source = "terraform-ibm-modules/base-ocp-vpc/ibm"
  # ... configuration
}

# Monitoring module
module "monitoring" {
  source = "./modules/monitoring"
  
  cluster_id   = module.ocp_cluster.cluster_id
  cluster_name = module.ocp_cluster.cluster_name
  master_url   = module.ocp_cluster.master_url
  
  # Monitoring configuration
  prometheus_enabled = true
  grafana_enabled    = true
}
```

### Pattern 3: Multi-Cluster Setup

```hcl
# Production cluster
module "prod_cluster" {
  source = "terraform-ibm-modules/base-ocp-vpc/ibm"
  cluster_name = "prod-cluster"
  # ... configuration
}

# Staging cluster
module "staging_cluster" {
  source = "terraform-ibm-modules/base-ocp-vpc/ibm"
  cluster_name = "staging-cluster"
  # ... configuration
}

# Shared services
module "shared_services" {
  source = "./modules/shared-services"
  
  clusters = {
    production = {
      id   = module.prod_cluster.cluster_id
      name = module.prod_cluster.cluster_name
      url  = module.prod_cluster.master_url
    }
    staging = {
      id   = module.staging_cluster.cluster_id
      name = module.staging_cluster.cluster_name
      url  = module.staging_cluster.master_url
    }
  }
}
```

## Using Outputs in Scripts

### Bash Script Example

```bash
#!/bin/bash
# deploy-app.sh

# Get cluster info from Terraform outputs
CLUSTER_ID=$(terraform output -raw cluster_id)
CLUSTER_NAME=$(terraform output -raw cluster_name)
INGRESS_HOSTNAME=$(terraform output -raw ingress_hostname)

# Configure kubectl
ibmcloud oc cluster config --cluster $CLUSTER_ID

# Deploy application
kubectl apply -f app-deployment.yaml

# Create route
cat <<EOF | kubectl apply -f -
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: myapp
spec:
  host: myapp.$INGRESS_HOSTNAME
  to:
    kind: Service
    name: myapp
EOF

echo "Application deployed to: https://myapp.$INGRESS_HOSTNAME"
```

### Python Script Example

```python
#!/usr/bin/env python3
import subprocess
import json

def get_terraform_output(output_name):
    """Get Terraform output value"""
    result = subprocess.run(
        ['terraform', 'output', '-json', output_name],
        capture_output=True,
        text=True
    )
    return json.loads(result.stdout)

# Get cluster information
cluster_id = get_terraform_output('cluster_id')
cluster_name = get_terraform_output('cluster_name')
master_url = get_terraform_output('master_url')

print(f"Cluster ID: {cluster_id}")
print(f"Cluster Name: {cluster_name}")
print(f"Master URL: {master_url}")

# Use outputs for automation
# ... your automation logic here
```

## Documentation Generation

### Automated Documentation

```hcl
# outputs.tf
output "cluster_documentation" {
  description = "Cluster documentation"
  value = {
    cluster_id       = module.ocp_cluster.cluster_id
    cluster_name     = module.ocp_cluster.cluster_name
    region           = var.region
    zones            = var.zones
    worker_count     = sum([for pool in var.worker_pools : pool.workers_per_zone * length(var.zones)])
    master_url       = module.ocp_cluster.master_url
    ingress_hostname = module.ocp_cluster.ingress_hostname
    created_at       = timestamp()
  }
}
```

### Generate Markdown Documentation

```bash
#!/bin/bash
# generate-docs.sh

cat > cluster-info.md <<EOF
# Cluster Information

## Basic Details
- **Cluster ID**: $(terraform output -raw cluster_id)
- **Cluster Name**: $(terraform output -raw cluster_name)
- **Region**: $(terraform output -raw region)
- **Created**: $(date)

## Endpoints
- **API Server**: $(terraform output -raw master_url)
- **Ingress**: $(terraform output -raw ingress_hostname)

## Access
\`\`\`bash
ibmcloud oc cluster config --cluster $(terraform output -raw cluster_id)
\`\`\`
EOF

echo "Documentation generated: cluster-info.md"
```

## CI/CD Integration

### GitLab CI Example

```yaml
# .gitlab-ci.yml
stages:
  - deploy
  - configure

deploy_cluster:
  stage: deploy
  script:
    - terraform init
    - terraform apply -auto-approve
    - terraform output -json > outputs.json
  artifacts:
    paths:
      - outputs.json

configure_cluster:
  stage: configure
  dependencies:
    - deploy_cluster
  script:
    - CLUSTER_ID=$(jq -r '.cluster_id.value' outputs.json)
    - ibmcloud oc cluster config --cluster $CLUSTER_ID
    - kubectl apply -f manifests/
```

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy Cluster

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v1
      
      - name: Terraform Apply
        run: |
          terraform init
          terraform apply -auto-approve
      
      - name: Save Outputs
        run: |
          terraform output -json > outputs.json
      
      - name: Configure Cluster
        run: |
          CLUSTER_ID=$(terraform output -raw cluster_id)
          ibmcloud oc cluster config --cluster $CLUSTER_ID
          kubectl apply -f manifests/
```

## Monitoring and Alerting Integration

### Prometheus Configuration

```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      external_labels:
        cluster_id: "${CLUSTER_ID}"
        cluster_name: "${CLUSTER_NAME}"
        environment: "${ENVIRONMENT}"
    
    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Cluster Overview",
    "variables": [
      {
        "name": "cluster_id",
        "query": "${CLUSTER_ID}"
      },
      {
        "name": "cluster_name",
        "query": "${CLUSTER_NAME}"
      }
    ]
  }
}
```

## Best Practices

### Output Organization

✅ **Group related outputs**
```hcl
output "cluster_info" {
  value = {
    id   = module.ocp_cluster.cluster_id
    name = module.ocp_cluster.cluster_name
    crn  = module.ocp_cluster.cluster_crn
  }
}

output "network_info" {
  value = {
    master_url       = module.ocp_cluster.master_url
    ingress_hostname = module.ocp_cluster.ingress_hostname
  }
}
```

### Sensitive Outputs

✅ **Mark sensitive data**
```hcl
output "cluster_credentials" {
  value     = module.ocp_cluster.credentials
  sensitive = true
}
```

### Documentation

✅ **Provide clear descriptions**
```hcl
output "cluster_id" {
  description = "The unique identifier of the OpenShift cluster. Use this ID for IBM Cloud CLI commands and API calls."
  value       = module.ocp_cluster.cluster_id
}
```

## Key Takeaways

✅ Outputs enable integration with other systems
✅ Use outputs for automation and documentation
✅ Mark sensitive outputs appropriately
✅ Provide clear descriptions
✅ Organize outputs logically
✅ Use outputs in CI/CD pipelines

## Conclusion

This completes the comprehensive beginner's guide to the IBM base OCP VPC module. You now have the knowledge to:

- Understand OpenShift fundamentals
- Plan and deploy clusters
- Configure networking and security
- Manage cluster lifecycle
- Integrate with other systems
- Follow best practices
- Troubleshoot issues

Continue learning by deploying your own cluster and exploring the official documentation for advanced topics.

---

**Navigation**: [← Back: Troubleshooting](23-troubleshooting.md) | [Return to Index](index.md)
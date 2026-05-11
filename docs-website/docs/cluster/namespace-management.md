# 📦 Kubernetes Namespace Management

## Overview

The `terraform-ibm-namespace` module provides comprehensive namespace management for IBM Cloud Kubernetes Service (IKS) and Red Hat OpenShift on IBM Cloud (ROKS). This module enables multi-tenancy, resource isolation, and fine-grained access control within your cluster infrastructure.

**Module Repository:** [terraform-ibm-modules/terraform-ibm-namespace](https://github.com/terraform-ibm-modules/terraform-ibm-namespace)

## 🎯 What This Module Provides

### Core Capabilities

1. **Namespace Lifecycle Management**
   - Create and configure multiple namespaces
   - Apply labels and annotations
   - Manage namespace metadata
   - Automated cleanup and deletion

2. **Resource Governance**
   - Resource quotas (CPU, memory, storage)
   - Limit ranges for containers and pods
   - Priority classes
   - Storage class restrictions

3. **Access Control (RBAC)**
   - Role bindings for users and groups
   - Service account management
   - ClusterRole bindings
   - Fine-grained permissions

4. **Network Isolation**
   - Network policy integration
   - Pod security policies
   - Service mesh configuration
   - Ingress/egress controls

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │   Namespace    │  │   Namespace    │  │   Namespace    ││
│  │   Production   │  │    Staging     │  │  Development   ││
│  │                │  │                │  │                ││
│  │ ┌────────────┐ │  │ ┌────────────┐ │  │ ┌────────────┐││
│  │ │ Resource   │ │  │ │ Resource   │ │  │ │ Resource   │││
│  │ │ Quotas     │ │  │ │ Quotas     │ │  │ │ Quotas     │││
│  │ └────────────┘ │  │ └────────────┘ │  │ └────────────┘││
│  │                │  │                │  │                ││
│  │ ┌────────────┐ │  │ ┌────────────┐ │  │ ┌────────────┐││
│  │ │ Limit      │ │  │ │ Limit      │ │  │ │ Limit      │││
│  │ │ Ranges     │ │  │ │ Ranges     │ │  │ │ Ranges     │││
│  │ └────────────┘ │  │ └────────────┘ │  │ └────────────┘││
│  │                │  │                │  │                ││
│  │ ┌────────────┐ │  │ ┌────────────┐ │  │ ┌────────────┐││
│  │ │ RBAC       │ │  │ │ RBAC       │ │  │ │ RBAC       │││
│  │ │ Policies   │ │  │ │ Policies   │ │  │ │ Policies   │││
│  │ └────────────┘ │  │ └────────────┘ │  │ └────────────┘││
│  │                │  │                │  │                ││
│  │ ┌────────────┐ │  │ ┌────────────┐ │  │ ┌────────────┐││
│  │ │ Network    │ │  │ │ Network    │ │  │ │ Network    │││
│  │ │ Policies   │ │  │ │ Policies   │ │  │ │ Policies   │││
│  │ └────────────┘ │  │ └────────────┘ │  │ └────────────┘││
│  └────────────────┘  └────────────────┘  └────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 📋 Module Inputs

### Required Inputs

| Input | Type | Description |
|-------|------|-------------|
| `cluster_id` | string | The ID of the IKS or ROKS cluster |
| `namespaces` | list(object) | List of namespace configurations |

### Optional Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `resource_quotas` | map(object) | `{}` | Resource quotas per namespace |
| `limit_ranges` | map(object) | `{}` | Limit ranges per namespace |
| `role_bindings` | list(object) | `[]` | RBAC role bindings |
| `cluster_role_bindings` | list(object) | `[]` | Cluster-wide role bindings |
| `service_accounts` | list(object) | `[]` | Service account configurations |
| `network_policies` | map(object) | `{}` | Network policies per namespace |

## 🚀 Usage Examples

### Basic Namespace Creation

```hcl
module "namespaces" {
  source  = "terraform-ibm-modules/namespace/ibm"
  version = "~> 1.0"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  namespaces = [
    {
      name = "production"
      labels = {
        environment = "production"
        team        = "platform"
        cost-center = "engineering"
      }
      annotations = {
        owner       = "platform-team@company.com"
        description = "Production workloads"
      }
    },
    {
      name = "staging"
      labels = {
        environment = "staging"
        team        = "platform"
      }
      annotations = {
        owner = "platform-team@company.com"
      }
    },
    {
      name = "development"
      labels = {
        environment = "development"
        team        = "engineering"
      }
    }
  ]
}
```

### Namespace with Resource Quotas

```hcl
module "namespaces_with_quotas" {
  source  = "terraform-ibm-modules/namespace/ibm"
  version = "~> 1.0"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  namespaces = [
    {
      name = "production"
      labels = {
        environment = "production"
      }
    }
  ]
  
  # Define resource quotas
  resource_quotas = {
    production = {
      hard = {
        # CPU limits
        "requests.cpu"    = "100"      # 100 CPU cores
        "limits.cpu"      = "200"      # 200 CPU cores max
        
        # Memory limits
        "requests.memory" = "200Gi"    # 200 GB memory
        "limits.memory"   = "400Gi"    # 400 GB memory max
        
        # Pod limits
        "pods"            = "100"      # Max 100 pods
        
        # Storage limits
        "persistentvolumeclaims"         = "50"     # Max 50 PVCs
        "requests.storage"               = "1Ti"    # 1 TB storage
        
        # Service limits
        "services"                       = "50"     # Max 50 services
        "services.loadbalancers"         = "5"      # Max 5 load balancers
        "services.nodeports"             = "10"     # Max 10 NodePorts
        
        # ConfigMap and Secret limits
        "configmaps"                     = "100"    # Max 100 ConfigMaps
        "secrets"                        = "100"    # Max 100 Secrets
      }
    }
  }
}
```

### Namespace with Limit Ranges

```hcl
module "namespaces_with_limits" {
  source  = "terraform-ibm-modules/namespace/ibm"
  version = "~> 1.0"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  namespaces = [
    {
      name = "production"
      labels = {
        environment = "production"
      }
    }
  ]
  
  # Define limit ranges
  limit_ranges = {
    production = {
      limits = [
        {
          type = "Container"
          
          # Maximum resources per container
          max = {
            cpu    = "4"      # 4 CPU cores max
            memory = "8Gi"    # 8 GB memory max
          }
          
          # Minimum resources per container
          min = {
            cpu    = "100m"   # 0.1 CPU cores min
            memory = "128Mi"  # 128 MB memory min
          }
          
          # Default resources if not specified
          default = {
            cpu    = "500m"   # 0.5 CPU cores default
            memory = "512Mi"  # 512 MB memory default
          }
          
          # Default requests if not specified
          default_request = {
            cpu    = "250m"   # 0.25 CPU cores default request
            memory = "256Mi"  # 256 MB memory default request
          }
        },
        {
          type = "Pod"
          
          # Maximum resources per pod
          max = {
            cpu    = "8"      # 8 CPU cores max per pod
            memory = "16Gi"   # 16 GB memory max per pod
          }
        },
        {
          type = "PersistentVolumeClaim"
          
          # Storage limits
          max = {
            storage = "100Gi"  # 100 GB max per PVC
          }
          min = {
            storage = "1Gi"    # 1 GB min per PVC
          }
        }
      ]
    }
  }
}
```

### Namespace with RBAC Configuration

```hcl
module "namespaces_with_rbac" {
  source  = "terraform-ibm-modules/namespace/ibm"
  version = "~> 1.0"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  namespaces = [
    {
      name = "production"
      labels = {
        environment = "production"
      }
    },
    {
      name = "staging"
      labels = {
        environment = "staging"
      }
    }
  ]
  
  # Role bindings for namespace-level access
  role_bindings = [
    {
      namespace = "production"
      role_name = "admin"
      subjects = [
        {
          kind = "Group"
          name = "production-admins"
          api_group = "rbac.authorization.k8s.io"
        },
        {
          kind = "User"
          name = "john.doe@company.com"
          api_group = "rbac.authorization.k8s.io"
        }
      ]
    },
    {
      namespace = "production"
      role_name = "view"
      subjects = [
        {
          kind = "Group"
          name = "production-viewers"
          api_group = "rbac.authorization.k8s.io"
        }
      ]
    },
    {
      namespace = "staging"
      role_name = "edit"
      subjects = [
        {
          kind = "Group"
          name = "developers"
          api_group = "rbac.authorization.k8s.io"
        }
      ]
    }
  ]
  
  # Service accounts
  service_accounts = [
    {
      namespace = "production"
      name      = "app-deployer"
      annotations = {
        "description" = "Service account for CI/CD deployments"
      }
    },
    {
      namespace = "production"
      name      = "monitoring-agent"
      annotations = {
        "description" = "Service account for monitoring tools"
      }
    }
  ]
}
```

### Complete Multi-Tenant Configuration

```hcl
module "multi_tenant_namespaces" {
  source  = "terraform-ibm-modules/namespace/ibm"
  version = "~> 1.0"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  # Define namespaces for different teams
  namespaces = [
    {
      name = "team-alpha-prod"
      labels = {
        team        = "alpha"
        environment = "production"
        cost-center = "engineering"
      }
      annotations = {
        owner       = "team-alpha@company.com"
        description = "Team Alpha production workloads"
      }
    },
    {
      name = "team-alpha-dev"
      labels = {
        team        = "alpha"
        environment = "development"
      }
      annotations = {
        owner = "team-alpha@company.com"
      }
    },
    {
      name = "team-beta-prod"
      labels = {
        team        = "beta"
        environment = "production"
        cost-center = "product"
      }
      annotations = {
        owner = "team-beta@company.com"
      }
    }
  ]
  
  # Resource quotas per namespace
  resource_quotas = {
    team-alpha-prod = {
      hard = {
        "requests.cpu"    = "50"
        "requests.memory" = "100Gi"
        "pods"            = "50"
        "services"        = "25"
      }
    }
    team-alpha-dev = {
      hard = {
        "requests.cpu"    = "20"
        "requests.memory" = "40Gi"
        "pods"            = "30"
      }
    }
    team-beta-prod = {
      hard = {
        "requests.cpu"    = "80"
        "requests.memory" = "160Gi"
        "pods"            = "80"
        "services"        = "40"
      }
    }
  }
  
  # Limit ranges
  limit_ranges = {
    team-alpha-prod = {
      limits = [
        {
          type = "Container"
          max = {
            cpu    = "4"
            memory = "8Gi"
          }
          min = {
            cpu    = "100m"
            memory = "128Mi"
          }
          default = {
            cpu    = "500m"
            memory = "512Mi"
          }
        }
      ]
    }
    team-alpha-dev = {
      limits = [
        {
          type = "Container"
          max = {
            cpu    = "2"
            memory = "4Gi"
          }
          min = {
            cpu    = "50m"
            memory = "64Mi"
          }
          default = {
            cpu    = "250m"
            memory = "256Mi"
          }
        }
      ]
    }
  }
  
  # RBAC configuration
  role_bindings = [
    {
      namespace = "team-alpha-prod"
      role_name = "admin"
      subjects = [
        {
          kind = "Group"
          name = "team-alpha-leads"
        }
      ]
    },
    {
      namespace = "team-alpha-prod"
      role_name = "edit"
      subjects = [
        {
          kind = "Group"
          name = "team-alpha-developers"
        }
      ]
    },
    {
      namespace = "team-alpha-dev"
      role_name = "edit"
      subjects = [
        {
          kind = "Group"
          name = "team-alpha-developers"
        }
      ]
    },
    {
      namespace = "team-beta-prod"
      role_name = "admin"
      subjects = [
        {
          kind = "Group"
          name = "team-beta-leads"
        }
      ]
    }
  ]
  
  # Service accounts for automation
  service_accounts = [
    {
      namespace = "team-alpha-prod"
      name      = "ci-cd-deployer"
    },
    {
      namespace = "team-beta-prod"
      name      = "ci-cd-deployer"
    }
  ]
}
```

### Network Policy Integration

```hcl
module "namespaces_with_network_policies" {
  source  = "terraform-ibm-modules/namespace/ibm"
  version = "~> 1.0"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  namespaces = [
    {
      name = "frontend"
      labels = {
        tier = "frontend"
      }
    },
    {
      name = "backend"
      labels = {
        tier = "backend"
      }
    },
    {
      name = "database"
      labels = {
        tier = "database"
      }
    }
  ]
  
  # Network policies for isolation
  network_policies = {
    frontend = {
      pod_selector = {
        match_labels = {
          tier = "frontend"
        }
      }
      policy_types = ["Ingress", "Egress"]
      
      # Allow ingress from internet
      ingress = [
        {
          from = []  # Allow from anywhere
          ports = [
            {
              protocol = "TCP"
              port     = 80
            },
            {
              protocol = "TCP"
              port     = 443
            }
          ]
        }
      ]
      
      # Allow egress to backend only
      egress = [
        {
          to = [
            {
              namespace_selector = {
                match_labels = {
                  tier = "backend"
                }
              }
            }
          ]
          ports = [
            {
              protocol = "TCP"
              port     = 8080
            }
          ]
        }
      ]
    }
    
    backend = {
      pod_selector = {
        match_labels = {
          tier = "backend"
        }
      }
      policy_types = ["Ingress", "Egress"]
      
      # Allow ingress from frontend only
      ingress = [
        {
          from = [
            {
              namespace_selector = {
                match_labels = {
                  tier = "frontend"
                }
              }
            }
          ]
          ports = [
            {
              protocol = "TCP"
              port     = 8080
            }
          ]
        }
      ]
      
      # Allow egress to database only
      egress = [
        {
          to = [
            {
              namespace_selector = {
                match_labels = {
                  tier = "database"
                }
              }
            }
          ]
          ports = [
            {
              protocol = "TCP"
              port     = 5432
            }
          ]
        }
      ]
    }
    
    database = {
      pod_selector = {
        match_labels = {
          tier = "database"
        }
      }
      policy_types = ["Ingress"]
      
      # Allow ingress from backend only
      ingress = [
        {
          from = [
            {
              namespace_selector = {
                match_labels = {
                  tier = "backend"
                }
              }
            }
          ]
          ports = [
            {
              protocol = "TCP"
              port     = 5432
            }
          ]
        }
      ]
    }
  }
}
```

## 📊 Module Outputs

| Output | Description |
|--------|-------------|
| `namespace_names` | List of created namespace names |
| `namespace_ids` | Map of namespace names to their IDs |
| `resource_quota_names` | Map of namespace names to resource quota names |
| `limit_range_names` | Map of namespace names to limit range names |
| `service_account_names` | Map of namespace names to service account names |
| `role_binding_names` | List of created role binding names |

## 🔗 Integration with Landing Zone

### VPC Integration

```hcl
# Create VPC first
module "vpc" {
  source = "terraform-ibm-modules/vpc/ibm"
  # ... VPC configuration
}

# Create cluster in VPC
module "openshift_cluster" {
  source = "terraform-ibm-modules/base-ocp-vpc/ibm"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.subnet_ids
  # ... cluster configuration
}

# Create namespaces in cluster
module "namespaces" {
  source = "terraform-ibm-modules/namespace/ibm"
  
  cluster_id = module.openshift_cluster.cluster_id
  # ... namespace configuration
}
```

### IAM Integration

```hcl
# Create IAM access groups
module "iam" {
  source = "terraform-ibm-modules/iam/ibm"
  # ... IAM configuration
}

# Use IAM groups in namespace RBAC
module "namespaces" {
  source = "terraform-ibm-modules/namespace/ibm"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  role_bindings = [
    {
      namespace = "production"
      role_name = "admin"
      subjects = [
        {
          kind = "Group"
          name = module.iam.access_group_names["production-admins"]
        }
      ]
    }
  ]
}
```

### Observability Integration

```hcl
# Create observability namespace
module "observability_namespace" {
  source = "terraform-ibm-modules/namespace/ibm"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  namespaces = [
    {
      name = "observability"
      labels = {
        purpose = "monitoring"
      }
    }
  ]
  
  resource_quotas = {
    observability = {
      hard = {
        "requests.cpu"    = "20"
        "requests.memory" = "40Gi"
      }
    }
  }
}

# Deploy monitoring agents
module "monitoring" {
  source = "terraform-ibm-modules/monitoring-bind/ibm"
  
  cluster_id = module.openshift_cluster.cluster_id
  namespace  = module.observability_namespace.namespace_names[0]
  # ... monitoring configuration
}
```

## 🎯 Best Practices

### 1. Namespace Naming Conventions

```hcl
# Use consistent naming patterns
namespaces = [
  {
    name = "${var.team_name}-${var.environment}"  # team-alpha-prod
    labels = {
      team        = var.team_name
      environment = var.environment
      managed-by  = "terraform"
    }
  }
]
```

### 2. Resource Quota Strategy

```hcl
# Define quotas based on environment
locals {
  quota_configs = {
    production = {
      cpu    = "100"
      memory = "200Gi"
      pods   = "100"
    }
    staging = {
      cpu    = "50"
      memory = "100Gi"
      pods   = "50"
    }
    development = {
      cpu    = "20"
      memory = "40Gi"
      pods   = "30"
    }
  }
}

resource_quotas = {
  for ns in var.namespaces :
  ns.name => {
    hard = {
      "requests.cpu"    = local.quota_configs[ns.environment].cpu
      "requests.memory" = local.quota_configs[ns.environment].memory
      "pods"            = local.quota_configs[ns.environment].pods
    }
  }
}
```

### 3. RBAC Least Privilege

```hcl
# Grant minimum necessary permissions
role_bindings = [
  {
    namespace = "production"
    role_name = "view"  # Read-only by default
    subjects = [
      {
        kind = "Group"
        name = "all-developers"
      }
    ]
  },
  {
    namespace = "production"
    role_name = "edit"  # Write access for specific team
    subjects = [
      {
        kind = "Group"
        name = "production-team"
      }
    ]
  },
  {
    namespace = "production"
    role_name = "admin"  # Admin only for leads
    subjects = [
      {
        kind = "Group"
        name = "production-leads"
      }
    ]
  }
]
```

### 4. Network Segmentation

```hcl
# Implement zero-trust networking
network_policies = {
  for ns in var.namespaces :
  ns.name => {
    pod_selector = {
      match_labels = {
        namespace = ns.name
      }
    }
    policy_types = ["Ingress", "Egress"]
    
    # Default deny all, then allow specific traffic
    ingress = []
    egress  = []
  }
}
```

### 5. Label Strategy

```hcl
# Use comprehensive labels for organization
namespaces = [
  {
    name = "production"
    labels = {
      # Environment classification
      environment = "production"
      
      # Team ownership
      team = "platform"
      owner = "platform-team"
      
      # Cost allocation
      cost-center = "engineering"
      project = "core-platform"
      
      # Compliance
      compliance = "pci-dss"
      data-classification = "confidential"
      
      # Automation
      managed-by = "terraform"
      terraform-module = "terraform-ibm-namespace"
    }
    annotations = {
      "contact.email" = "platform-team@company.com"
      "contact.slack" = "#platform-team"
      "description" = "Production workloads for core platform"
      "runbook" = "https://wiki.company.com/platform/runbook"
    }
  }
]
```

## 🔍 Monitoring and Observability

### Resource Usage Monitoring

```hcl
# Enable resource monitoring
module "namespaces" {
  source = "terraform-ibm-modules/namespace/ibm"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  namespaces = [
    {
      name = "production"
      labels = {
        environment = "production"
        # Enable Prometheus monitoring
        "prometheus.io/scrape" = "true"
      }
      annotations = {
        # Alert thresholds
        "alert.cpu.threshold" = "80"
        "alert.memory.threshold" = "85"
      }
    }
  ]
}
```

### Quota Alerts

```yaml
# Example Prometheus alert rules
groups:
  - name: namespace_quotas
    rules:
      - alert: NamespaceQuotaExceeded
        expr: |
          kube_resourcequota{type="used"} / 
          kube_resourcequota{type="hard"} > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Namespace {{ $labels.namespace }} quota exceeded"
          description: "{{ $labels.resource }} usage is at {{ $value }}%"
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Quota Exceeded

```bash
# Check current quota usage
kubectl describe resourcequota -n production

# View pod resource requests
kubectl top pods -n production

# Identify high-resource pods
kubectl get pods -n production -o custom-columns=\
NAME:.metadata.name,\
CPU_REQ:.spec.containers[*].resources.requests.cpu,\
MEM_REQ:.spec.containers[*].resources.requests.memory
```

#### 2. RBAC Permission Denied

```bash
# Check role bindings
kubectl get rolebindings -n production

# Describe specific role binding
kubectl describe rolebinding admin-binding -n production

# Test permissions
kubectl auth can-i create pods --namespace=production --as=user@company.com
```

#### 3. Network Policy Blocking Traffic

```bash
# List network policies
kubectl get networkpolicies -n production

# Describe network policy
kubectl describe networkpolicy allow-frontend -n production

# Test connectivity
kubectl run test-pod --image=busybox -n production -- \
  wget -O- http://backend-service.backend.svc.cluster.local:8080
```

## 📚 Additional Resources

### Official Documentation

- [Kubernetes Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- [Resource Quotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/)
- [Limit Ranges](https://kubernetes.io/docs/concepts/policy/limit-range/)
- [RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)

### IBM Cloud Documentation

- [IBM Cloud Kubernetes Service](https://cloud.ibm.com/docs/containers)
- [Red Hat OpenShift on IBM Cloud](https://cloud.ibm.com/docs/openshift)
- [Managing cluster access](https://cloud.ibm.com/docs/containers?topic=containers-users)

### Terraform Module

- [terraform-ibm-namespace GitHub](https://github.com/terraform-ibm-modules/terraform-ibm-namespace)
- [Module Registry](https://registry.terraform.io/modules/terraform-ibm-modules/namespace/ibm)

## 🤝 Related Modules

- [terraform-ibm-base-ocp-vpc](https://github.com/terraform-ibm-modules/terraform-ibm-base-ocp-vpc) - OpenShift cluster creation
- [terraform-ibm-cluster](https://github.com/terraform-ibm-modules/terraform-ibm-cluster) - IKS cluster creation
- [terraform-ibm-observability](https://github.com/terraform-ibm-modules/terraform-ibm-observability) - Monitoring integration
- [terraform-ibm-vpc](https://github.com/terraform-ibm-modules/terraform-ibm-vpc) - VPC networking

---

**Next Steps:**
- [Cluster Creation Guide](./README.md#cluster-creation-modules)
- [Service Mesh Configuration](./README.md#service-mesh-module)
- [Observability Setup](../observability/README.md)
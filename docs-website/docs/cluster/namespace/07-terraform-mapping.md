# Terraform to Kubernetes Resource Mapping

## Why this mapping matters

When you use the `terraform-ibm-namespace` module, you are not writing raw Kubernetes YAML directly. Instead, you describe your desired namespace design in Terraform. The module then creates Kubernetes resources that implement that design.

## High-level mapping

| Terraform input | Kubernetes resource created | Purpose |
|---|---|---|
| `namespaces` | `Namespace` | Creates logical tenant boundaries |
| `resource_quotas` | `ResourceQuota` | Sets namespace-wide resource budgets |
| `limit_ranges` | `LimitRange` | Sets per-container, per-pod, or per-PVC sizing rules |
| `role_bindings` | `RoleBinding` | Grants namespace-scoped access |
| `cluster_role_bindings` | `ClusterRoleBinding` | Grants cluster-scoped access |
| `service_accounts` | `ServiceAccount` | Creates identities for automation or workloads |
| `network_policies` | `NetworkPolicy` | Controls traffic into and out of selected pods |

## 1. Namespace input to Namespace YAML

### Terraform HCL

```hcl
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
  }
]
```

### Resulting Kubernetes YAML concept

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    environment: production
    team: platform
    cost-center: engineering
  annotations:
    owner: platform-team@company.com
    description: Production workloads
```

## 2. Resource quota input to ResourceQuota YAML

### Terraform HCL

```hcl
resource_quotas = {
  production = {
    hard = {
      "requests.cpu"    = "100"
      "requests.memory" = "200Gi"
      "limits.cpu"      = "200"
      "limits.memory"   = "400Gi"
      "pods"            = "100"
    }
  }
}
```

### Resulting Kubernetes YAML concept

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
spec:
  hard:
    requests.cpu: "100"
    requests.memory: 200Gi
    limits.cpu: "200"
    limits.memory: 400Gi
    pods: "100"
```

## 3. Limit range input to LimitRange YAML

### Terraform HCL

```hcl
limit_ranges = {
  production = {
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
        default_request = {
          cpu    = "250m"
          memory = "256Mi"
        }
      }
    ]
  }
}
```

### Resulting Kubernetes YAML concept

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: production-limits
  namespace: production
spec:
  limits:
    - type: Container
      max:
        cpu: "4"
        memory: 8Gi
      min:
        cpu: 100m
        memory: 128Mi
      default:
        cpu: 500m
        memory: 512Mi
      defaultRequest:
        cpu: 250m
        memory: 256Mi
```

## 4. RBAC input to RoleBinding YAML

### Terraform HCL

```hcl
role_bindings = [
  {
    namespace = "production"
    role_name = "admin"
    subjects = [
      {
        kind      = "Group"
        name      = "production-admins"
        api_group = "rbac.authorization.k8s.io"
      }
    ]
  }
]
```

### Resulting Kubernetes YAML concept

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: production-admin-binding
  namespace: production
subjects:
  - kind: Group
    name: production-admins
    apiGroup: rbac.authorization.k8s.io
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: admin
```

## 5. Cluster RBAC input to ClusterRoleBinding YAML

### Terraform HCL concept

```hcl
cluster_role_bindings = [
  {
    role_name = "cluster-admin"
    subjects = [
      {
        kind      = "Group"
        name      = "platform-admins"
        api_group = "rbac.authorization.k8s.io"
      }
    ]
  }
]
```

### Resulting Kubernetes YAML concept

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: platform-admins-cluster-admin
subjects:
  - kind: Group
    name: platform-admins
    apiGroup: rbac.authorization.k8s.io
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
```

## 6. Service account input to ServiceAccount YAML

### Terraform HCL

```hcl
service_accounts = [
  {
    namespace = "production"
    name      = "app-deployer"
    annotations = {
      description = "Service account for CI/CD deployments"
    }
  }
]
```

### Resulting Kubernetes YAML concept

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-deployer
  namespace: production
  annotations:
    description: Service account for CI/CD deployments
```

## 7. Network policy input to NetworkPolicy YAML

### Terraform HCL

```hcl
network_policies = {
  backend = {
    pod_selector = {
      match_labels = {
        tier = "backend"
      }
    }
    policy_types = ["Ingress", "Egress"]
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
  }
}
```

### Resulting Kubernetes YAML concept

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-policy
  namespace: backend
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              tier: frontend
      ports:
        - protocol: TCP
          port: 8080
```

## Side-by-side example: full namespace declaration

### Terraform HCL

```hcl
namespaces = [
  {
    name = "team-alpha-prod"
    labels = {
      team        = "alpha"
      environment = "production"
    }
    annotations = {
      owner = "team-alpha@company.com"
    }
  }
]

resource_quotas = {
  team-alpha-prod = {
    hard = {
      "requests.cpu"    = "50"
      "requests.memory" = "100Gi"
      "pods"            = "50"
    }
  }
}

limit_ranges = {
  team-alpha-prod = {
    limits = [
      {
        type = "Container"
        default = {
          cpu    = "500m"
          memory = "512Mi"
        }
      }
    ]
  }
}
```

### Resulting Kubernetes YAML set

```yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: team-alpha-prod
  labels:
    team: alpha
    environment: production
  annotations:
    owner: team-alpha@company.com
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-alpha-prod-quota
  namespace: team-alpha-prod
spec:
  hard:
    requests.cpu: "50"
    requests.memory: 100Gi
    pods: "50"
---
apiVersion: v1
kind: LimitRange
metadata:
  name: team-alpha-prod-limits
  namespace: team-alpha-prod
spec:
  limits:
    - type: Container
      default:
        cpu: 500m
        memory: 512Mi
```

## Translation summary by concern

| Concern | Terraform expresses | Kubernetes enforces |
|---|---|---|
| Namespace identity | `namespaces` | `Namespace` |
| Total resource budget | `resource_quotas` | `ResourceQuota` |
| Per-workload sizing | `limit_ranges` | `LimitRange` |
| Team access | `role_bindings` | `RoleBinding` |
| Cluster-wide admin access | `cluster_role_bindings` | `ClusterRoleBinding` |
| Automation identity | `service_accounts` | `ServiceAccount` |
| Traffic isolation | `network_policies` | `NetworkPolicy` |

## Key takeaway

Terraform is the declaration layer. Kubernetes resources are the enforcement layer. The namespace module bridges those two worlds by turning high-level HCL inputs into concrete namespace, quota, RBAC, and network policy objects inside the cluster.
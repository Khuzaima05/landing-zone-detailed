# Resource Quotas and Limit Ranges

## Why resource management matters

A shared Kubernetes cluster has finite CPU, memory, storage, and service capacity. Without controls, one namespace could consume too many resources and impact other teams. This is why namespace-level governance is so important.

Two core Kubernetes objects help solve this:

- `ResourceQuota`
- `LimitRange`

## ResourceQuota versus LimitRange

### ResourceQuota

A `ResourceQuota` controls the total amount of resources a namespace is allowed to consume.

Examples:

- total CPU requests
- total memory requests
- total number of pods
- total number of services
- total number of secrets
- total storage requests

Think of it as the namespace budget.

### LimitRange

A `LimitRange` controls the minimum, maximum, and default resource values for individual containers, pods, or persistent volume claims inside a namespace.

Examples:

- minimum CPU for one container
- default memory request for one container
- maximum storage for one PVC

Think of it as the per-workload sizing policy.

## How they work together

```text
Namespace
├── ResourceQuota  -> total namespace budget
└── LimitRange     -> per-container or per-pod guardrails
```

## Terraform example: resource quota

```hcl
resource_quotas = {
  production = {
    hard = {
      "requests.cpu"            = "100"
      "limits.cpu"              = "200"
      "requests.memory"         = "200Gi"
      "limits.memory"           = "400Gi"
      "pods"                    = "100"
      "persistentvolumeclaims"  = "50"
      "requests.storage"        = "1Ti"
      "services"                = "50"
      "services.loadbalancers"  = "5"
      "services.nodeports"      = "10"
      "configmaps"              = "100"
      "secrets"                 = "100"
    }
  }
}
```

## What that means in plain language

The configuration above means:

- all workloads together may request up to 100 CPUs
- total CPU limits may go up to 200 CPUs
- all workloads together may request up to 200 GiB of memory
- the namespace may contain up to 100 pods
- the namespace may create up to 50 services
- the namespace may request up to 1 TiB of storage

## Terraform example: limit ranges

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
      },
      {
        type = "Pod"
        max = {
          cpu    = "8"
          memory = "16Gi"
        }
      },
      {
        type = "PersistentVolumeClaim"
        max = {
          storage = "100Gi"
        }
        min = {
          storage = "1Gi"
        }
      }
    ]
  }
}
```

## How to read this

For containers in the `production` namespace:

- minimum CPU request allowed: `100m`
- minimum memory request allowed: `128Mi`
- default CPU limit if not specified: `500m`
- default memory limit if not specified: `512Mi`
- maximum CPU per container: `4`
- maximum memory per container: `8Gi`

For pods:

- total pod CPU must not exceed `8`
- total pod memory must not exceed `16Gi`

For PVCs:

- storage request must be between `1Gi` and `100Gi`

## Environment-based quota strategy

```hcl
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
```

## Common mistakes

### 1. Only setting quotas, not limits

This controls total namespace usage but does not prevent badly sized individual workloads.

### 2. Only setting limits, not quotas

This controls individual workloads but does not prevent a namespace from creating too many workloads.

### 3. Unrealistic defaults

If default values are too high, developers may waste cluster resources. If defaults are too low, applications may fail.

### 4. No monitoring

Quotas without usage visibility lead to surprise deployment failures.

## Operational checks

```bash
kubectl describe resourcequota -n production
kubectl top pods -n production
kubectl get pods -n production -o custom-columns=\
NAME:.metadata.name,\
CPU_REQ:.spec.containers[*].resources.requests.cpu,\
MEM_REQ:.spec.containers[*].resources.requests.memory
```

## Key takeaway

Use `ResourceQuota` to control the namespace budget and `LimitRange` to control individual workload sizing. In a healthy multi-tenant cluster, you usually need both.
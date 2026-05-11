# Resource Quotas and Limit Ranges

## Why resource management matters

A shared Kubernetes cluster has finite CPU, memory, storage, and service capacity. Without controls, one namespace could consume too many resources and impact other teams. This is why namespace-level governance is so important.

Two core Kubernetes objects help solve this:

- `ResourceQuota`
- `LimitRange`

They sound similar, but they solve different problems.

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

Together they prevent both of these problems:

- one team consuming too much overall capacity
- one workload being created with unreasonable or missing resource values

## Terraform example: resource quota

The original namespace document includes this quota pattern:

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

This quota says the `production` namespace has an upper boundary for compute, storage, and object counts.

## What that means in plain language

The configuration above means:

- all workloads together may request up to 100 CPUs
- total CPU limits may go up to 200 CPUs
- all workloads together may request up to 200 GiB of memory
- the namespace may contain up to 100 pods
- the namespace may create up to 50 services
- the namespace may request up to 1 TiB of storage

It does not mean one pod can use all of that. It means the namespace as a whole cannot go beyond that budget.

## Terraform example: limit ranges

The original module examples also define per-container and per-pod limits:

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

## Beginner scenario

Suppose a developer forgets to set resource requests and limits in a deployment.

If a `LimitRange` exists:

- Kubernetes can inject default values
- the workload still follows platform rules
- cluster scheduling becomes more predictable

If no `LimitRange` exists:

- workloads may be inconsistent
- noisy-neighbor problems become more likely
- scheduling and capacity planning become harder

Now suppose many workloads are deployed successfully but total CPU demand keeps growing.

If a `ResourceQuota` exists:

- Kubernetes blocks new objects that would exceed the namespace budget
- one team cannot starve the whole cluster

## Environment-based quota strategy

The original best-practice section recommends defining quotas based on environment.

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

This is a good beginner pattern because production usually deserves more guaranteed capacity than development.

## Practical recommendations

### For development namespaces

- lower quotas
- tighter limits
- smaller pod counts
- smaller storage allocations

### For production namespaces

- higher quotas
- carefully reviewed limits
- realistic defaults
- monitoring and alerts near quota thresholds

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

Useful commands from the original troubleshooting section:

```bash
kubectl describe resourcequota -n production
kubectl top pods -n production
kubectl get pods -n production -o custom-columns=\
NAME:.metadata.name,\
CPU_REQ:.spec.containers[*].resources.requests.cpu,\
MEM_REQ:.spec.containers[*].resources.requests.memory
```

These commands help you identify whether the namespace is near quota exhaustion and which workloads are requesting the most resources.

## Key takeaway

Use `ResourceQuota` to control the namespace budget and `LimitRange` to control individual workload sizing. In a healthy multi-tenant cluster, you usually need both.
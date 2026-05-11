# Network Policies and Namespace Isolation

## Why network isolation matters

Namespaces organize workloads, but they do not automatically block traffic between workloads. If network policy is not configured, pods may be able to communicate more freely than you expect.

This is why namespace design and network policy design often go together.

## What a NetworkPolicy does

A Kubernetes `NetworkPolicy` controls which traffic is allowed to enter or leave selected pods.

It commonly defines:

- which pods can receive traffic
- which pods can send traffic
- which namespaces are allowed as traffic sources or destinations
- which ports and protocols are allowed

## Terraform example from the original document

```hcl
network_policies = {
  frontend = {
    pod_selector = {
      match_labels = {
        tier = "frontend"
      }
    }
    policy_types = ["Ingress", "Egress"]

    ingress = [
      {
        from = []
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
```

## What this policy model does

- frontend accepts traffic on ports 80 and 443
- frontend can send traffic to backend on port 8080
- backend accepts traffic only from frontend
- backend can send traffic only to database on port 5432
- database accepts traffic only from backend

## Default deny pattern

```hcl
network_policies = {
  for ns in var.namespaces :
  ns.name => {
    pod_selector = {
      match_labels = {
        namespace = ns.name
      }
    }
    policy_types = ["Ingress", "Egress"]

    ingress = []
    egress  = []
  }
}
```

This creates a zero-trust starting point where traffic is blocked unless explicitly allowed.

## Common mistakes

### 1. Assuming namespaces alone isolate traffic

They do not. Network policies must be defined.

### 2. Forgetting egress rules

Outgoing traffic also needs control.

### 3. Using labels inconsistently

If namespace labels are inconsistent, selectors become unreliable.

### 4. Not testing policies

Always validate policy behavior in a lower environment first.

## Troubleshooting commands

```bash
kubectl get networkpolicies -n production
kubectl describe networkpolicy allow-frontend -n production
kubectl run test-pod --image=busybox -n production -- \
  wget -O- http://backend-service.backend.svc.cluster.local:8080
```

## Key takeaway

Namespaces define the logical boundary, and network policies define the traffic rules across that boundary. For secure multi-tenant Kubernetes, both are necessary.
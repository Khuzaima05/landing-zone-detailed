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

## Namespace-based traffic segmentation

One of the strongest patterns in Kubernetes is to use namespace labels and selectors to create traffic boundaries between application layers.

For example:

- frontend namespace can call backend namespace
- backend namespace can call database namespace
- frontend namespace cannot call database namespace directly

This creates micro-segmentation inside the cluster.

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

### Frontend namespace

- accepts traffic on ports 80 and 443
- can send traffic to namespaces labeled `tier=backend` on port 8080

### Backend namespace

- accepts traffic only from namespaces labeled `tier=frontend`
- can send traffic only to namespaces labeled `tier=database` on port 5432

### Database namespace

- accepts traffic only from namespaces labeled `tier=backend`
- does not expose direct access to frontend

This is a classic three-tier application security model.

## Default deny pattern

The best-practice section in the original document recommends a zero-trust approach:

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

This pattern is important because:

- `ingress = []` means no inbound traffic is allowed unless later permitted
- `egress = []` means no outbound traffic is allowed unless later permitted

This is often called **default deny**.

## Beginner mental model

Without a network policy:

- pods are in an open office

With a default-deny policy:

- all doors are closed

With allow rules:

- only selected doors are opened for specific teams and services

## Why namespace labels matter

Notice that network rules often use `namespace_selector`.

Example:

```yaml
namespaceSelector:
  matchLabels:
    tier: backend
```

That means the rule is not tied only to a hard-coded namespace name. It is tied to metadata. This is useful because platform teams can create consistent policy patterns based on labels.

## Practical design patterns

### 1. Three-tier application pattern

- frontend -> backend
- backend -> database
- no direct frontend -> database

### 2. Shared platform services pattern

Allow all application namespaces to reach shared platform namespaces for:

- DNS
- logging
- metrics
- ingress controllers

### 3. Compliance isolation pattern

Block sensitive namespaces from talking to general-purpose namespaces except through approved paths.

## Common mistakes

### 1. Assuming namespaces alone isolate traffic

They do not. Network policies must be defined.

### 2. Forgetting egress rules

Teams often define ingress rules but forget that outgoing traffic also needs control.

### 3. Using labels inconsistently

If namespace labels are inconsistent, selectors become unreliable.

### 4. No test namespace

It is safer to validate policy behavior in a lower environment first.

## Troubleshooting commands

The original document includes these checks:

```bash
kubectl get networkpolicies -n production
kubectl describe networkpolicy allow-frontend -n production
kubectl run test-pod --image=busybox -n production -- \
  wget -O- http://backend-service.backend.svc.cluster.local:8080
```

These commands help you inspect existing policies and test live connectivity from inside the cluster.

## Key takeaway

Namespaces define the logical boundary, and network policies define the traffic rules across that boundary. For secure multi-tenant Kubernetes, both are necessary.
# Namespace Best Practices

## Why best practices matter

Namespaces are easy to create, but poor namespace design causes long-term operational problems. Good patterns make clusters easier to secure, govern, automate, and scale.

This document builds on the best-practice guidance from the original namespace documentation and explains it in a beginner-friendly way.

## 1. Use consistent naming conventions

The original documentation recommends a predictable naming pattern.

```hcl
namespaces = [
  {
    name = "${var.team_name}-${var.environment}"
    labels = {
      team        = var.team_name
      environment = var.environment
      managed-by  = "terraform"
    }
  }
]
```

### Why this helps

Consistent names make it easier to:

- identify ownership quickly
- search logs and dashboards
- create policy rules
- build automation
- avoid confusion between environments

### Good examples

- `payments-dev`
- `payments-prod`
- `analytics-staging`
- `platform-shared`

### Avoid

- vague names like `app1`
- inconsistent abbreviations
- mixing naming formats across teams

## 2. Define quotas by environment

The original best-practice section recommends quota profiles by environment.

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

### Why this helps

Not all environments need the same resources.

Typical expectation:

- production gets the largest quota
- staging gets moderate quota
- development gets tighter quota

This reduces waste and protects production workloads.

## 3. Follow least privilege for RBAC

The original documentation recommends this pattern:

```hcl
role_bindings = [
  {
    namespace = "production"
    role_name = "view"
    subjects = [
      {
        kind = "Group"
        name = "all-developers"
      }
    ]
  },
  {
    namespace = "production"
    role_name = "edit"
    subjects = [
      {
        kind = "Group"
        name = "production-team"
      }
    ]
  },
  {
    namespace = "production"
    role_name = "admin"
    subjects = [
      {
        kind = "Group"
        name = "production-leads"
      }
    ]
  }
]
```

### Why this helps

Access should match responsibility.

A strong default model is:

- many people get `view`
- fewer people get `edit`
- very few people get `admin`

This reduces accidental changes and lowers security risk.

## 4. Start with a zero-trust network model

The original document recommends default-deny style network segmentation.

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

### Why this helps

If nothing is allowed by default, only approved traffic paths exist. This is much safer than allowing all traffic and trying to restrict it later.

## 5. Use a strong label strategy

The original documentation emphasizes rich labels and annotations.

```hcl
namespaces = [
  {
    name = "production"
    labels = {
      environment         = "production"
      team                = "platform"
      owner               = "platform-team"
      cost-center         = "engineering"
      project             = "core-platform"
      compliance          = "pci-dss"
      data-classification = "confidential"
      managed-by          = "terraform"
      terraform-module    = "terraform-ibm-namespace"
    }
    annotations = {
      "contact.email" = "platform-team@company.com"
      "contact.slack" = "#platform-team"
      "description"   = "Production workloads for core platform"
      "runbook"       = "https://wiki.company.com/platform/runbook"
    }
  }
]
```

### Why this helps

Good metadata supports:

- ownership tracking
- automation
- cost allocation
- compliance reporting
- service mesh or monitoring integration
- operational support

## 6. Separate platform work from application work

A strong namespace model usually follows this sequence:

1. platform team creates the namespace
2. platform team applies baseline labels, RBAC, quotas, and network policies
3. application team deploys workloads into that prepared boundary

This avoids uncontrolled namespace sprawl and inconsistent standards.

## 7. Treat namespaces as platform API objects

A namespace should not be created casually without design inputs.

Before creating one, define:

- owner
- environment
- quota profile
- RBAC pattern
- network requirements
- monitoring expectations
- automation labels

This makes namespace provisioning more predictable and supportable.

## 8. Standardize service accounts

Do not create one shared service account for every tool.

Better pattern:

- one deployer account for CI/CD
- one monitoring account for agents
- one backup account if needed

This improves traceability and limits blast radius.

## 9. Monitor quota and policy behavior

The original documentation includes examples for quota alerts and monitoring metadata. This is important because governance objects are only useful if teams know when they are near limits or blocked by policy.

At minimum, monitor:

- quota usage percentage
- failed deployments due to quota
- network policy-denied traffic if available
- RBAC permission errors in pipelines

## 10. Keep everything in version control

A namespace is part of the platform, not just an ad hoc cluster object. Keep these definitions in Terraform and Git so changes are reviewable, repeatable, and auditable.

## Beginner checklist

Use this checklist when designing a new namespace:

- clear name
- owner defined
- environment label present
- resource quota assigned
- limit range assigned
- RBAC bindings defined
- network policy approach defined
- service accounts reviewed
- labels and annotations standardized
- Terraform source committed to Git

## Key takeaway

The best namespace designs are boring in a good way: predictable names, predictable labels, predictable access, predictable quotas, and predictable network behavior. That consistency is what makes a multi-team Kubernetes platform manageable.
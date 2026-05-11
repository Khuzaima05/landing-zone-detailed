# Namespace Best Practices

## Why best practices matter

Namespaces are easy to create, but poor namespace design causes long-term operational problems. Good patterns make clusters easier to secure, govern, automate, and scale.

## 1. Use consistent naming conventions

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

Good examples:

- `payments-dev`
- `payments-prod`
- `analytics-staging`
- `platform-shared`

## 2. Define quotas by environment

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

## 3. Follow least privilege for RBAC

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

## 4. Start with a zero-trust network model

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

## 5. Use a strong label strategy

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

## Beginner checklist

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

The best namespace designs are predictable: predictable names, labels, access, quotas, and network behavior.
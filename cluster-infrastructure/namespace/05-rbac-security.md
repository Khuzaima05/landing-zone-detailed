# RBAC and Security Configuration

## Why RBAC matters for namespaces

Namespaces are one of the main places where Kubernetes access control is applied. In most enterprise environments, users and automation should not have unrestricted cluster-wide access. Instead, access is scoped to the namespace that a team owns or operates.

This is where RBAC becomes essential.

RBAC stands for Role-Based Access Control. It determines who can perform actions on which Kubernetes resources.

## Namespace-scoped security model

A common beginner-friendly model looks like this:

- platform administrators manage the whole cluster
- application teams get access only to their namespaces
- CI/CD service accounts get limited deployment permissions
- read-only users get view access for troubleshooting or audits

This model reduces risk while still allowing teams to work independently.

## Core RBAC objects

### Role

A `Role` defines permissions inside a specific namespace.

Example permissions:

- get pods
- create deployments
- update configmaps

### RoleBinding

A `RoleBinding` connects a role to a user, group, or service account inside a namespace.

### ClusterRole

A `ClusterRole` defines reusable permissions that may be cluster-wide or referenced from many namespaces.

### ClusterRoleBinding

A `ClusterRoleBinding` attaches a `ClusterRole` across the cluster. This should be used carefully because it is broader in scope.

## Terraform example from the original document

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
      },
      {
        kind      = "User"
        name      = "john.doe@company.com"
        api_group = "rbac.authorization.k8s.io"
      }
    ]
  },
  {
    namespace = "production"
    role_name = "view"
    subjects = [
      {
        kind      = "Group"
        name      = "production-viewers"
        api_group = "rbac.authorization.k8s.io"
      }
    ]
  },
  {
    namespace = "staging"
    role_name = "edit"
    subjects = [
      {
        kind      = "Group"
        name      = "developers"
        api_group = "rbac.authorization.k8s.io"
      }
    ]
  }
]
```

## What this means

The configuration above applies different access levels to different groups:

- `production-admins` get admin access in the `production` namespace
- `production-viewers` get read-only access in the `production` namespace
- `developers` get edit access in the `staging` namespace

This is a good pattern because it matches permissions to responsibility.

## Built-in roles to know

Kubernetes commonly uses these built-in role names:

- `view` - read-only access
- `edit` - allows modifying most application resources
- `admin` - broad namespace administration rights

A practical access model is:

- most users start with `view`
- application engineers get `edit` where needed
- only a small lead or platform group gets `admin`

## Service accounts for automation

The original document also includes service account examples:

```hcl
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
```

Service accounts are identities used by workloads or automation instead of human users.

Typical examples:

- CI/CD pipeline deployers
- monitoring agents
- GitOps controllers
- backup jobs

## Least privilege principle

The original best-practice section recommends least privilege:

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

This is an excellent beginner pattern because it avoids giving everyone too much power.

## Security boundaries provided by namespaces

Namespaces help security in several ways:

- access can be limited to one team boundary
- secrets are namespaced resources
- service accounts are namespaced by default
- audit review becomes easier because ownership is clearer

However, namespaces are not a complete security solution by themselves. They still need:

- RBAC
- network policies
- quota controls
- good secret handling
- cluster hardening

## Common security mistakes

### 1. Giving `admin` to everyone

This is easy at first, but it breaks least privilege and increases risk.

### 2. Reusing one service account for everything

Each automation purpose should have its own identity when possible.

### 3. Mixing production and development access

Developers may need edit access in development but only read access in production.

### 4. Forgetting to test permissions

Permissions should be validated before relying on them in real deployment pipelines.

## Useful troubleshooting commands

The original document provides these RBAC checks:

```bash
kubectl get rolebindings -n production
kubectl describe rolebinding admin-binding -n production
kubectl auth can-i create pods --namespace=production --as=user@company.com
```

These commands help answer three important questions:

- what bindings exist
- what a specific binding contains
- whether a user can perform a specific action

## Recommended namespace RBAC pattern

```text
Cluster Admins
    │
    ├── manage cluster-wide resources
    │
Platform Team
    │
    ├── create namespaces
    ├── apply quota and policies
    └── manage baseline RBAC
    │
Application Team
    │
    ├── edit in dev/staging
    └── limited access in production
    │
Automation Accounts
    │
    └── deploy or monitor only what they need
```

## Key takeaway

Namespaces become meaningful security boundaries only when RBAC is designed carefully. Good namespace security is not about denying everything. It is about giving each team, user, and automation account exactly the access it needs and no more.
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

## Core RBAC objects

### Role

A `Role` defines permissions inside a specific namespace.

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

## Built-in roles to know

- `view` - read-only access
- `edit` - allows modifying most application resources
- `admin` - broad namespace administration rights

## Service accounts for automation

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

## Least privilege principle

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

## Common security mistakes

### 1. Giving `admin` to everyone

This breaks least privilege and increases risk.

### 2. Reusing one service account for everything

Each automation purpose should have its own identity when possible.

### 3. Mixing production and development access

Developers may need edit access in development but only read access in production.

### 4. Forgetting to test permissions

Permissions should be validated before relying on them.

## Useful troubleshooting commands

```bash
kubectl get rolebindings -n production
kubectl describe rolebinding admin-binding -n production
kubectl auth can-i create pods --namespace=production --as=user@company.com
```

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

Namespaces become meaningful security boundaries only when RBAC is designed carefully. Good namespace security is about giving each team, user, and automation account exactly the access it needs and no more.
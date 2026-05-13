# RBAC and Security

[← Previous: Resource Quotas and Limits](./04-resource-quotas-limits.md) | [Index](./index.md) | [Next: Network Policies →](./06-network-policies.md)

## What Is RBAC?

`RBAC` stands for `Role-Based Access Control`.

It decides who can do what inside the cluster.

In namespace design, RBAC is one of the main ways to keep access organized and safe.

## Simple Namespace Security Model

A common pattern is:

- platform admins manage the whole cluster
- app teams manage only their own namespaces
- automation accounts get only the permissions they need

## Main RBAC Objects

### Role

A `Role` defines permissions inside one namespace.

### RoleBinding

A `RoleBinding` connects that role to a user, group, or service account.

### ClusterRole

A `ClusterRole` is broader and can be reused across the cluster.

### ClusterRoleBinding

A `ClusterRoleBinding` attaches broader permissions at cluster scope, so it should be used carefully.

## Good Beginner Practice

Use the principle of least privilege:

- give only the access that is needed
- avoid broad admin access for everyone
- separate production access from development access

## Key Takeaways

- RBAC controls access in Kubernetes and OpenShift.
- Namespaces become real security boundaries only when RBAC is designed well.
- Least privilege is the safest starting point.

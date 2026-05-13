# Namespace Fundamentals

[Index](./index.md) | [Next: Terraform Module Usage →](./03-terraform-module-usage.md)

## What Is a Namespace?

A `namespace` is a logical workspace inside a Kubernetes or OpenShift cluster.

It helps separate applications, teams, or environments while still using the same cluster.

## Why Namespaces Are Needed

If every team put all resources directly into one shared cluster space, things would become confusing very quickly.

Problems would include:

- name collisions
- messy permissions
- hard-to-manage resource usage
- unclear team boundaries

Namespaces solve this by dividing one cluster into smaller logical areas.

## Where Namespaces Fit

Namespaces sit between the shared cluster and the workloads running inside it.

A simple way to think about it is:

```text
Cluster infrastructure
  -> Namespace boundary
      -> Workloads
```

The cluster provides the shared platform. The namespace creates the logical working area. The workloads live inside that area.

## Simple Mental Model

Think of the cluster as a big school building.

- the `cluster` is the full building
- a `namespace` is one classroom or department
- the apps and pods are the people and desks inside that room

This makes the shared system easier to organize.

## What Namespaces Help With

Namespaces are mainly useful for:

- organization
- team separation
- permission control
- quotas and limits
- policy targeting
- labels and annotations

That is why a namespace is more than a folder name. It often becomes the control point for how workloads are governed.

## Same Names Can Exist in Different Namespaces

This is one big reason namespaces are useful.

For example:

- `payments/backend`
- `analytics/backend`

Both can exist because they are in different namespaces.

## Example in a Shared Cluster

A company might run one cluster for several teams:

- payments
- analytics
- monitoring
- internal-tools

Instead of building four separate clusters, the platform team creates separate namespaces for those teams.

This keeps the platform shared, but the day-to-day work more organized.

## Common Namespace Patterns

Teams often use one of these patterns:

- environment-based namespaces like `dev`, `staging`, `prod`
- team-based namespaces like `payments` or `analytics`
- combined names like `payments-prod`

The best pattern is usually the one that stays clear and predictable.

## Important Boundary Reminder

Namespaces are powerful, but they are still logical boundaries, not fully separate clusters.

That means they usually work together with:

- RBAC
- resource quotas
- limit ranges
- network policies

Those tools make the namespace boundary meaningful in practice.

## Key Takeaways

- A namespace is a logical workspace inside the cluster.
- It sits between shared cluster infrastructure and workloads.
- It helps separate teams and applications.
- Good namespace design makes shared clusters much easier to manage securely.

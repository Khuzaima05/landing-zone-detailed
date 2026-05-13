# Resource Quotas and Limits

[← Previous: Terraform Module Usage](./03-terraform-module-usage.md) | [Index](./index.md) | [Next: RBAC and Security →](./05-rbac-security.md)

## Why This Topic Matters

A cluster has limited CPU, memory, storage, and other shared capacity.

Without rules, one namespace could use too much and affect others.

## Two Important Tools

### ResourceQuota

A `ResourceQuota` controls the total budget for a namespace.

Examples:

- total CPU
- total memory
- total storage
- number of pods or services

### LimitRange

A `LimitRange` controls the size rules for individual workloads inside that namespace.

Examples:

- minimum CPU for one container
- default memory request
- maximum storage size for one claim

## Easy Difference

You can remember it like this:

- `ResourceQuota` = namespace budget
- `LimitRange` = per-workload guardrail

## Why Both Help

If you use only one of them, you may still have problems.

Examples:

- quota alone does not stop badly sized containers
- limits alone do not stop a namespace from creating too many workloads

## Key Takeaways

- Quotas protect the shared cluster from overuse.
- Limits guide how big or small individual workloads can be.
- In shared environments, both are usually useful together.

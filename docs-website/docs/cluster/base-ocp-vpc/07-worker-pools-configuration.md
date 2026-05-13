# Worker Pools Configuration

[← Previous: VPC Networking Integration](./06-vpc-networking-integration.md) | [Index](../index.md) | [Next: Operating System Selection →](./08-operating-system-selection.md)

## What Is a Worker Pool?

A `worker pool` is a group of worker nodes that share the same main configuration.

Usually that means the nodes in the pool use the same:

- machine type
- operating system
- scaling pattern
- labels or scheduling rules

## Why Worker Pools Exist

Worker pools make clusters easier to manage.

Instead of configuring every node one by one, you define a pool and scale that pool.

## Simple Example

You might have:

```text
web pool     -> smaller balanced nodes
api pool     -> medium nodes
data pool    -> larger memory-heavy nodes
```

This helps different workload types run on more suitable machines.

## Default Pool

Most clusters start with a default worker pool.

That is often enough for:

- learning
- small environments
- simple applications

For more complex environments, extra pools can help.

## Why Create More Than One Pool

Teams create extra pools when they want:

- different machine sizes
- workload separation
- cost control
- better scaling choices

Example:

- frontend apps do not need the same node type as data processing jobs

## Sizing Ideas

A small worker pool may be enough for labs or low-traffic apps.

A larger pool is needed when you expect:

- many applications
- bigger traffic
- heavier workloads

You also usually want nodes spread across zones, not packed into only one zone.

## Beginner-Friendly Advice

If you are new, start simple:

1. use one default worker pool
2. choose a balanced node type
3. spread across zones if possible
4. add more pools only when workload needs become clear

## Key Takeaways

- A worker pool is a group of similar worker nodes.
- Pools make scaling and management easier.
- One pool is enough for simple setups.
- Multiple pools help when workloads have different needs.

# VPC Networking Integration

[← Previous: Resource Scoping](./05-resource-scoping.md) | [Index](../index.md) | [Next: Worker Pools Configuration →](./07-worker-pools-configuration.md)

## Why Networking Matters for Clusters

An OpenShift cluster does not float in the air by itself.

It depends on VPC networking underneath.

That means the cluster needs:

- a VPC
- subnets
- IP ranges
- security rules
- routing

## The Basic Relationship

A simple model is:

```text
VPC -> Subnets -> Cluster nodes -> Pods and services
```

The cluster nodes are real machines in subnets, and the platform then runs pods on those nodes.

## Subnets and Zones

Clusters often use one subnet per zone.

Example:

```text
Zone 1 -> 10.0.1.0/24
Zone 2 -> 10.0.2.0/24
Zone 3 -> 10.0.3.0/24
```

This gives a clear and scalable layout.

## Why Multi-Zone Is Common

If all nodes are in one zone, one zone problem can affect the whole cluster.

Using multiple zones improves:

- availability
- resilience
- production readiness

## Public and Private Access

Not every part of the cluster should be public.

Usually:

- nodes use private networking
- selected endpoints or load balancers handle controlled access

This keeps the cluster safer and more organized.

## IP Planning Still Matters

The cluster needs enough IP space for:

- control plane nodes
- worker nodes
- load balancer needs
- future growth

So even though this is a cluster topic, good VPC planning is still very important.

## Security Layers

Clusters depend on the VPC protection layers too:

- subnet-level ACLs
- security groups
- routes

These help control who can connect and how traffic moves.

## Key Takeaways

- Cluster networking is built on top of VPC networking.
- Nodes live in subnets inside the VPC.
- Multi-zone subnet design is common and useful.
- Good IP and security planning makes the cluster more reliable.

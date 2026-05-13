# Subnets

[← Previous: CIDR Planning and IP Addresses](./cidr-planning-ipam.md) | [Index](./index.md) | [Next: Network ACL Architecture →](./network-acl-architecture.md)

## What Is a Subnet?

A `subnet` is a smaller network inside a VPC.

This is where workloads actually connect.

That means:

- a server gets its private IP from a subnet
- a cluster worker node sits in a subnet
- many load balancer connections depend on subnets too

## Why Subnets Exist

If a VPC had only one giant network, everything would be mixed together.

That would make security and management harder.

Subnets help divide the VPC into smaller sections, such as:

- web subnet
- app subnet
- database subnet
- management subnet

## Simple Example

```text
VPC: 10.0.0.0/16

Subnet A: 10.0.1.0/24
Subnet B: 10.0.2.0/24
Subnet C: 10.0.3.0/24
```

Then workloads can be placed like this:

```text
Subnet A -> web servers
Subnet B -> app servers
Subnet C -> database servers
```

## VPC vs Subnet One More Time

This topic is so important that it is worth repeating once, clearly:

- `VPC` = the full private network boundary
- `Subnet` = one smaller piece inside that boundary

You create a VPC first.

Then you create subnets inside it.

Then you place resources inside those subnets.

## Subnets and Zones

A VPC is regional, but subnets are usually tied to specific zones.

Example:

```text
VPC: prod-vpc

us-south-1 -> 10.0.1.0/24
us-south-2 -> 10.0.2.0/24
us-south-3 -> 10.0.3.0/24
```

This helps with high availability. If one zone has a problem, workloads in other zones can keep running.

## Why Good Subnet Design Matters

Good subnet design gives you:

- clearer workload separation
- easier firewall control
- easier scaling by zone
- simpler troubleshooting

## Public and Private Thinking

When people say "public subnet" or "private subnet", they usually mean how that subnet is allowed to reach the internet.

Simple idea:

- a more public-facing subnet may host web or bastion systems
- a private subnet is better for app and database systems

In practice, whether internet access is possible depends on routing and gateway setup, not only the subnet name.

## Common Beginner Pattern

A very common pattern is:

```text
Zone 1
  web subnet
  app subnet
  db subnet

Zone 2
  web subnet
  app subnet
  db subnet
```

This structure is clean, predictable, and easy to explain.

## Key Takeaways

- A `subnet` is where resources get their private IPs.
- Subnets divide a VPC into smaller, manageable parts.
- Subnets are often created per zone.
- Good subnet design improves security and organization.

## What To Read Next

Continue with [Network ACL Architecture](./network-acl-architecture.md) to learn how subnet-level traffic filtering works.

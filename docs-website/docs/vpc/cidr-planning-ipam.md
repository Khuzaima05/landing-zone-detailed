# CIDR Planning and IP Addresses

[← Previous: Regions, Zones, and Datacenters](./zones-datacenter-architecture.md) | [Index](./index.md) | [Next: Subnets →](./subnet-service-internals.md)

## Why IP Planning Comes Early

Before creating servers, teams first decide the address plan.

Why?

Because every server, subnet, and service needs an IP address to communicate.

If the IP plan is bad, later problems show up in:

- routing
- VPN connections
- hybrid cloud links
- cluster networking

## What Is an IP Address?

An `IP address` is the network address of a device or service.

Example:

```text
10.0.1.5
```

That address helps the network know where traffic should go.

## Public IP vs Private IP

There are two simple groups to remember.

| Type | Meaning |
|------|---------|
| `Public IP` | Reachable from the internet |
| `Private IP` | Used inside private networks like a VPC |

IBM Cloud VPC mostly uses `private IP` ranges for internal communication.

Common private ranges are:

- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`

## What Does CIDR Mean?

`CIDR` is a way to describe a network range.

Example:

```text
10.0.0.0/16
```

This does not mean one machine. It means a whole network block.

The `/16` part tells us how large that block is.

## Easy Way To Read CIDR

You do not need to memorize binary math at first.

Just remember:

- a smaller number after `/` means a bigger network
- a bigger number after `/` means a smaller network

Example:

| CIDR | Simple Meaning |
|------|----------------|
| `/16` | big network |
| `/24` | smaller network |

## VPC CIDR vs Subnet CIDR

This is a very important distinction.

| Term | Example | Meaning |
|------|---------|---------|
| `VPC CIDR` | `10.0.0.0/16` | the full address space for the VPC |
| `Subnet CIDR` | `10.0.1.0/24` | one smaller section inside the VPC |

So the VPC is the whole land area, and subnets are the separated plots inside it.

## A Simple Example

Start with one VPC:

```text
10.0.0.0/16
```

Now split it into subnets:

```text
10.0.1.0/24   web
10.0.2.0/24   app
10.0.3.0/24   database
```

This is easier to manage than putting everything into one large network.

## Why Teams Split Networks

Smaller subnets help with:

- better organization
- easier security rules
- simpler troubleshooting
- room for future growth

## Common Beginner Mistakes

### Making the network too small

If the subnet is too small, you may run out of IP addresses later.

### Using overlapping ranges

If two connected networks both use the same ranges, routing becomes difficult.

### Planning only for today

A network should leave some extra space for:

- new servers
- new zones
- future clusters
- testing environments

## Beginner-Friendly Planning Tip

For learning, this is a clean pattern:

```text
VPC: 10.0.0.0/16

Zone 1 app subnet: 10.0.1.0/24
Zone 2 app subnet: 10.0.2.0/24
Zone 3 app subnet: 10.0.3.0/24
```

You can repeat the same idea for database or management tiers.

## Key Takeaways

- IP addresses identify where traffic should go.
- A `CIDR` block describes a whole network range.
- The `VPC CIDR` is the full address space.
- `Subnet CIDRs` are smaller pieces taken from that space.
- Good IP planning makes the rest of networking easier.

## What To Read Next

Continue with [Subnets](./subnet-service-internals.md), because subnets are the place where workloads actually attach and use these IP ranges.

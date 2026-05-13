# Network Foundation

[← Previous: Resource Scoping](./vsi-resource-scoping.md) | [Index](./index.md) | [Next: Compute Instantiation →](./vsi-compute-instantiation.md)

## What This Step Does

This step decides where the VSI will live in the network.

Before a server can start, it needs:

- a `VPC`
- a `subnet`
- a `zone`

Without those, the server has nowhere to attach.

## VPC and Subnet

The `VPC` is the large private network.

The `subnet` is the smaller part inside that VPC where the server gets its private IP address.

Simple picture:

```text
VPC
  -> Subnet
      -> VSI
```

## What the Subnet Decides

The chosen subnet affects:

- the private IP range
- the availability zone
- the route path
- whether internet access is possible
- which subnet-level ACL rules apply

So the subnet is not just an IP block. It is the server's actual network location.

## Multi-Zone Thinking

You may choose subnets in more than one zone.

Example:

```text
us-south-1 -> subnet A
us-south-2 -> subnet B
us-south-3 -> subnet C
```

This helps with high availability because workloads can be spread across zones.

## VSI Per Subnet

Some modules let you define how many VSIs should be created in each subnet.

Example:

```text
2 subnets
3 VSIs per subnet
```

Result:

```text
6 VSIs total
```

This is a simple way to scale horizontally.

## Beginner Example

Suppose you want application servers in two zones:

```text
Subnet 1 in zone 1 -> app server 1, app server 2
Subnet 2 in zone 2 -> app server 3, app server 4
```

Now the application is less dependent on only one datacenter zone.

## Before You Create the VSI

Make sure the network already exists:

- VPC created
- subnets created
- enough IP space available
- routes ready
- gateways added if needed

If the network is not ready, the server deployment will not work properly.

## Key Takeaways

- The network foundation decides where the VSI lives.
- A server attaches to a subnet inside a VPC.
- The subnet affects IPs, routing, and zone placement.
- Multi-zone design improves availability.

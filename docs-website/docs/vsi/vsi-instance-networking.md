# Instance Networking

[← Previous: Storage Configuration](./vsi-storage-configuration.md) | [Index](./index.md) | [Next: Security Groups →](./vsi-security-groups.md)

## What This Step Does

This step gives the VSI its network identity.

That includes:

- a primary network interface
- a private IP address
- optional extra IPs
- optional internet access
- optional extra interfaces for advanced designs

## Primary Network Interface

Every VSI needs a main network interface.

That interface connects the server to a subnet in the VPC.

Once connected, the server gets a private IP address from that subnet.

Example:

```text
Subnet: 10.10.10.0/24
VSI:    10.10.10.5
```

## Subnets Are Zonal

In IBM Cloud VPC, subnets are tied to one zone.

That means the server is attached to a zonal subnet, even though the VPC itself is regional.

This matters for availability and design planning.

## Reserved IPs

Sometimes you want the server to keep the same private IP even if it is recreated.

That is where `reserved IPs` help.

Without a reserved IP:

- delete server
- recreate server
- IP may change

With a reserved IP:

- delete server
- recreate server
- IP can stay the same

This is useful for stable environments and predictable connectivity.

## Additional Private IPs

A server can sometimes use more than one private IP on an interface.

This is useful for:

- special application setups
- failover cases
- network appliances

Beginners usually do not need this first, but it becomes useful in more advanced designs.

## Public Gateway vs Floating IP

IBM Cloud VPC gives two important ways to think about internet connectivity.

### Public gateway

A `public gateway` gives outbound internet access to instances in a subnet.

Simple idea:

```text
VSI -> Subnet -> Public Gateway -> Internet
```

This is good when the server needs to reach the internet, but you do not want the internet to start connections directly to that server.

### Floating IP

A `floating IP` is a public IP attached to one server interface.

Simple idea:

```text
Internet -> Floating IP -> Private VSI
```

This is useful for:

- SSH access
- public web servers
- bastion hosts

Based on IBM Cloud VPC behavior, a floating IP gives inbound and outbound connectivity for that specific interface, while a public gateway is mainly for outbound subnet internet access.

## Important Difference

This is a helpful beginner rule:

- `public gateway` = subnet-level outbound internet access
- `floating IP` = instance-level public reachability

If both exist for a server, the floating IP is the more direct public-facing path for that interface.

## Secondary Interfaces

Some VSIs need more than one network connection.

A `secondary interface` means adding another interface to the same server.

This is helpful when you want to separate traffic types.

Examples:

- one interface for frontend traffic
- one interface for backend traffic
- one interface for monitoring or backup traffic

## Same Zone Rule

Secondary interfaces normally connect to subnets in the same zone as the VSI.

So this is about extra network paths for the same machine, not moving the machine across zones.

## Why Multiple Interfaces Help

Multiple interfaces can make it easier to:

- separate public and private traffic
- isolate backend communication
- attach different security rules
- keep monitoring traffic separate

## Simple Example

Think of one office building with multiple doors:

- front door for visitors
- side door for staff
- service door for deliveries

The building is still one building, but each door has a different purpose.

## Good Beginner Practice

Do not give every server a public IP.

Usually:

- web or bastion systems may need public access
- app and database systems should stay private

Also, most beginner setups can start with one interface and add more only when the architecture truly needs them.

## Key Takeaways

- Instance networking gives the server its IP identity.
- The subnet provides the private IP.
- Reserved IPs help keep addresses stable.
- Public gateways and floating IPs solve different internet access needs.
- Secondary interfaces are useful for advanced traffic separation.

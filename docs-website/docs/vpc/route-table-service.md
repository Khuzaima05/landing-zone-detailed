# Route Tables

[← Previous: Security Groups](./security-group-service-internals.md) | [Index](./index.md) | [Next: VPN Architecture →](./vpn-architecture.md)

## What Is a Route Table?

A `route table` is a set of rules that helps the network decide where traffic should go next.

At the simplest level, routing answers one question:

> where should this packet go now?

## Why Routing Matters

Without routing:

- traffic cannot move between networks
- internet access does not work
- hybrid or VPN connections do not work
- advanced VPC designs become impossible

So routing is a core part of how networks actually function.

## Simple Example

A packet leaves this server:

```text
Source: 10.0.1.5
Destination: 10.0.3.10
```

The network must decide the next step:

- is the destination inside this VPC?
- should it go to a gateway?
- should it go to another connected network?

That decision is made through routing logic.

## What a Route Looks Like

A route usually means:

```text
If destination matches X, send traffic to Y
```

Example:

```text
10.0.0.0/16  -> local VPC path
0.0.0.0/0    -> internet path
192.168.0.0/16 -> VPN or private network path
```

## What IBM Cloud VPC Does by Default

IBM Cloud VPC already handles basic routing inside the VPC.

That means subnets inside the same VPC can usually communicate without you building every route manually.

This is one reason cloud networking feels simpler than old-style hardware networking.

## When Custom Route Tables Matter

Custom route tables become more important when you want more control, such as:

- sending traffic through a network appliance
- building hub-and-spoke patterns
- controlling internet or hybrid paths more carefully
- overriding default behavior for some subnets

## Good Mental Model

Think of a route table like signboards on roads:

- if you want to go to one city, take highway A
- if you want to go somewhere else, take highway B

The network is reading those signboards every time traffic moves.

## Key Takeaways

- A route table helps decide where traffic goes next.
- Routing is one of the basic engines of networking.
- IBM Cloud VPC handles basic internal routing automatically.
- Custom route tables are useful when you need more advanced traffic control.

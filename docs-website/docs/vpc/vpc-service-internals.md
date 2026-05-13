# How VPC Works Internally

[← Previous: VPC Foundation](./vpc-foundation.md) | [Index](./index.md) | [Next: Regions, Zones, and Datacenters →](./zones-datacenter-architecture.md)

## Why This Chapter Matters

Many beginners imagine that creating a VPC means IBM sets up a fresh router, switch, and cables just for them.

That is not what happens.

A VPC is mostly created by `software control`, not by installing new hardware.

## The Main Idea

IBM Cloud already has physical datacenters, network devices, and cabling.

When you create a VPC, IBM Cloud:

- creates a private network boundary for you
- tracks which subnets belong to you
- keeps your traffic separate from other customers
- manages routing using software

So the cloud is not rebuilding hardware each time. It is programming the existing network in a smart way.

## What "Virtual" Really Means

The word `virtual` means the network is created in software on top of shared physical infrastructure.

You still get privacy and isolation, but IBM does not need one separate physical switch per customer.

This is what makes cloud networking:

- fast to create
- easier to scale
- cheaper than building everything yourself

## Simple Real-World Analogy

Think of a shopping mall.

- The building is shared by many shops.
- Each shop still has its own locked space, staff, and customers.
- Even though everyone uses the same building, one shop does not become another shop.

A VPC works in a similar way:

- the physical datacenter is shared
- your network space is still private

## What Happens Behind the Scenes

When Terraform or the IBM Cloud console creates a VPC, IBM Cloud sets up:

1. a private network identity for your VPC
2. rules that keep your traffic separate
3. routing information for your subnets
4. connections between zones in the same region

You do not usually see these internal pieces directly, but they are what make the VPC function.

## Why Two Customers Can Use Similar IPs

One confusing thing for beginners is this:

Customer A and Customer B can both use a network like `10.0.0.0/16`.

Why does that not break everything?

Because IBM Cloud keeps each VPC in its own isolated routing space.

So even if the numbers look the same, the traffic belongs to different private environments.

## Control Plane and Data Plane

You do not need deep networking theory yet, but this basic split helps:

| Part | Simple Meaning |
|------|----------------|
| `Control plane` | Decides the network rules and setup |
| `Data plane` | Carries the actual traffic |

When you create a VPC, the control plane updates the setup. Later, when servers send packets, the data plane moves the traffic.

## Why This Matters For Learners

If you understand this page, three things become easier:

- you stop thinking of cloud like physical rack setup
- you understand why VPC creation is fast
- you understand why isolation works even on shared hardware

## Key Takeaways

- A VPC is created mostly by software, not new hardware installation.
- IBM Cloud uses shared infrastructure with private isolation.
- Your routing and traffic stay separate from other customers.
- This is why cloud networking can be fast and scalable.

## What To Read Next

Continue with [Regions, Zones, and Datacenters](./zones-datacenter-architecture.md) to understand where the VPC physically lives.

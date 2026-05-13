# VPC Foundation

[Index](./index.md) | [Next: How VPC Works Internally →](./vpc-service-internals.md)

## What Is a VPC?

A `VPC` stands for `Virtual Private Cloud`.

It is your own private network inside IBM Cloud.

Think of it like this:

- IBM Cloud is a huge city with many buildings and roads.
- Your `VPC` is your own gated campus inside that city.
- Only the resources inside your campus can use your private network rules.

## Why Do We Need a VPC?

If all customers shared one open network, it would be messy and unsafe.

Problems would include:

- traffic mixing together
- security risks
- IP address conflicts
- poor organization

A VPC solves this by giving each customer a separate private network space.

## What Lives Inside a VPC?

A VPC is not a server by itself. It is the place where other network resources live.

Common resources inside a VPC are:

- subnets
- virtual servers
- load balancers
- security groups
- route tables
- VPN or gateway connections

## Simple Example

Imagine a school campus:

- the `campus` is the VPC
- the `classrooms` are subnets
- the `students` are servers or applications
- the `security guard rules` are firewall rules

This is why VPC is called a foundation. It gives structure before anything else is deployed.

## VPC and Region

A VPC is created inside a `region`, such as `us-south` or `eu-de`.

That means:

- the VPC belongs to one region
- the subnets inside it are usually spread across zones in that region

So the VPC is the big network boundary, and the subnets are the smaller pieces where workloads run.

## VPC vs Subnet

This is the most important beginner difference.

| Term | Simple Meaning |
|------|----------------|
| `VPC` | Your full private network space |
| `Subnet` | A smaller part of the VPC where resources get IPs |

You do not place a server directly inside a VPC.

You place it inside a `subnet` that belongs to that VPC.

## A Basic Picture

```text
Region
  -> VPC
      -> Subnet A
      -> Subnet B
      -> Subnet C
```

Then resources attach like this:

```text
Subnet A -> web server
Subnet B -> app server
Subnet C -> database server
```

## Why Teams Split a VPC Into Subnets

Using one giant flat network is hard to manage.

Teams usually create separate subnets for:

- web tier
- app tier
- database tier
- management tools

This gives better:

- security
- organization
- scaling
- troubleshooting

## What Happens When You Create a VPC?

IBM Cloud does not build a new physical datacenter for you.

Instead, it creates a software-defined private network boundary on top of IBM's existing infrastructure.

That means:

- your traffic stays separate from other customers
- your own routes and subnets are tracked
- your workloads can communicate privately

You can think of it as "creating a private network using software."

## Key Takeaways

- A `VPC` is your private network in IBM Cloud.
- It is the foundation for servers, subnets, and other network resources.
- A VPC belongs to a region.
- Workloads actually run in subnets, not directly in the VPC.

## What To Read Next

Continue with [How VPC Works Internally](./vpc-service-internals.md). That chapter explains, in simple terms, what IBM Cloud is doing behind the scenes when a VPC is created.

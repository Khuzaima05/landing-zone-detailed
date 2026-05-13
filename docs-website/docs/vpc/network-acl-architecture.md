# Network ACLs

[← Previous: Subnets](./subnet-service-internals.md) | [Index](./index.md) | [Next: Security Groups →](./security-group-service-internals.md)

## What Is a Network ACL?

A `network ACL` is a subnet-level traffic filter in IBM Cloud VPC.

It helps control which traffic is allowed to enter or leave a subnet before that traffic reaches a server.

Think of it like a security checkpoint at the entrance of a neighborhood, not at the door of one house.

## Where It Fits

Traffic usually flows like this:

```text
Route
  -> Subnet boundary
      -> Network ACL
          -> Security Group
              -> Workload
```

This order matters.

The ACL checks traffic at the subnet level first. Then the security group checks traffic at the instance or interface level.

## Why ACLs Matter

Without an ACL, any traffic that routing allows could at least try to reach the subnet.

ACLs help reduce that exposure earlier.

They are useful for:

- blocking unwanted inbound traffic
- limiting outbound paths
- setting a baseline subnet security policy

## Important IBM Cloud Behavior

Based on IBM Cloud VPC behavior:

- ACLs are attached to `subnets`
- one subnet can have only `one ACL` at a time
- one ACL can be attached to `multiple subnets`
- ACLs are `stateless`
- ACLs support both `allow` and `deny` rules
- ACL rules are checked `in sequence`

That combination makes ACLs different from security groups.

## Stateless Means Return Traffic Is Not Automatic

This is the biggest beginner concept.

If an inbound rule allows traffic in, that does not automatically mean the reply traffic is allowed out.

Because ACLs are `stateless`, you usually need matching thinking for both directions:

- inbound rules
- outbound rules

## Example

Suppose a web server receives HTTPS traffic on port `443`.

If the ACL allows inbound `443` but blocks the needed outbound response traffic, the connection still fails.

That is why ACL design should always think in both directions.

## ACLs vs Security Groups

This is the most useful comparison:

| Feature | Network ACL | Security Group |
|--------|-------------|----------------|
| Level | subnet | instance or interface |
| State | stateless | stateful |
| Rule types | allow and deny | allow only |
| Rule handling | sequence matters | rules are evaluated together |

## What a Rule Usually Looks At

An ACL rule usually checks things like:

- source IP range
- destination IP range
- protocol
- port
- direction

Then it decides whether to allow or deny that traffic.

## Simple Example

Imagine a subnet used for application servers.

You may want:

- allow HTTPS from the load balancer subnet
- allow management SSH only from admin IPs
- deny other unnecessary inbound traffic

That creates a cleaner subnet boundary before packets ever reach the server interfaces.

## When ACLs Are Most Useful

ACLs are especially useful when you want coarse subnet-level control, such as:

- separating web, app, and database tiers
- creating stricter public vs private subnet behavior
- building a baseline deny policy for a whole subnet

## Internal Mental Model

Even though beginners often imagine an ACL as one device, IBM Cloud handles this as part of the VPC networking system rather than a dedicated firewall machine you manage directly.

The practical idea is simple:

- you define the rules
- IBM Cloud applies them at the subnet boundary
- only matching traffic is allowed forward

## Key Takeaways

- A network ACL protects a subnet, not one specific server.
- ACLs are stateless, so return traffic needs separate planning.
- ACLs allow both allow and deny rules.
- ACLs are best for subnet-level baseline control.

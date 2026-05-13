# Cluster Endpoints

[← Previous: COS Registry Storage](./11-cos-registry-storage.md) | [Index](../index.md) | [Next: Add-ons and Extensions →](./13-addons-extensions.md)

## What Is a Cluster Endpoint?

A `cluster endpoint` is the network address used to reach important cluster services, especially the API server.

This matters because administrators, automation tools, and sometimes applications need a reliable way to connect.

## Public vs Private

At a simple level, there are two main ideas:

| Type | Meaning |
|------|---------|
| `public endpoint` | reachable from the internet |
| `private endpoint` | reachable only through private network paths such as VPC or VPN |

## Public Endpoint

A public endpoint is easier to reach from many places.

That can be useful for:

- remote administration
- external CI/CD systems
- easier testing

But it also needs stronger protection because it is more exposed.

## Private Endpoint

A private endpoint is safer from public internet exposure.

That is often better for:

- production clusters
- sensitive environments
- tighter network control

But it may require VPN or other private connectivity for admins.

## Which One Is Better?

There is no one answer for every case.

A simple beginner rule is:

- public is easier
- private is usually safer

So the choice depends on your access needs and security goals.

## Key Takeaways

- Endpoints are how users and tools reach the cluster API and related services.
- Public endpoints are easier to access but more exposed.
- Private endpoints are more controlled but need private connectivity.
- Endpoint choice is an important security and operations decision.

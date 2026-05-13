# Architecture Summary

[← Previous: Lifecycle and Recovery](./vsi-lifecycle-recovery.md) | [Index](./index.md)

## The Big Idea

A VSI is not only "a virtual machine."

It is a cloud server built from several connected parts.

## The Simple Stack

```text
Resource group
  -> VPC
      -> Subnet
          -> VSI
              -> Storage
              -> Networking
              -> Security
              -> Monitoring
              -> Recovery plan
```

## What To Remember Most

When learning VSI, the most useful idea is this:

```text
VSI = compute + disk + network + security + access
```

## How Traffic Reaches a VSI

A simple public web path may look like:

```text
Internet -> Load Balancer or Floating IP -> Security Group -> VSI
```

For a private backend server, the path may stay fully inside the VPC.

## The Learning Sequence

If the topic ever feels confusing, return to this order:

1. ownership
2. network
3. compute
4. storage
5. connectivity
6. security
7. monitoring
8. recovery

That order explains most VSI setups clearly.

## Key Takeaways

- A VSI depends on several layers working together.
- VPC and subnet come before the server itself.
- Security, monitoring, and recovery are part of the design, not optional extras.
- If you understand the sequence, the whole topic becomes easier to follow.

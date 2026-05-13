# VSI Provisioning Overview

[Index](./index.md) | [Next: Resource Scoping →](./vsi-resource-scoping.md)

## What This Section Is About

This section explains how a `VSI` is created from start to finish.

`VSI` means `Virtual Server Instance`, which is simply a cloud server.

When a VSI is created, IBM Cloud does not create "just one thing." It creates a server by joining several parts together:

- the resource group
- the VPC and subnet
- the machine profile
- the boot disk
- the network interface
- the security rules

## The Simple Order

A good beginner way to understand VSI creation is:

```text
Choose ownership
  -> Choose network
      -> Choose server size
          -> Choose storage
              -> Choose connectivity
                  -> Choose security
```

That is the same order used in this guide.

## A VSI Is More Than Just a Machine

Many beginners think a server is only CPU and memory.

In cloud platforms, a VSI is better understood like this:

```text
VSI = compute + disk + network + security + access
```

If any one of those parts is missing, the server is not really ready to use.

## What Happens During Provisioning

When you deploy a VSI, the flow usually looks like this:

1. Pick the resource group and naming style.
2. Select the VPC and subnet where the server will live.
3. Choose the machine type, such as small or medium.
4. Choose the boot image or snapshot.
5. Attach storage.
6. Assign private networking, and maybe public access.
7. Apply security rules.

## Easy Example

Imagine you are setting up a new computer lab machine in a school:

- first you decide which department owns it
- then which room it will sit in
- then what hardware it needs
- then what operating system it will use
- then which network it connects to
- then who is allowed to access it

A VSI follows the same logic.

## Reading Path

Follow these pages in order:

1. [Resource Scoping](vsi-resource-scoping.md)
2. [Network Foundation](vsi-network-foundation.md)
3. [Compute Instantiation](vsi-compute-instantiation.md)
4. [Storage Configuration](vsi-storage-configuration.md)
5. [Instance Networking](vsi-instance-networking.md)
6. [Security Groups](vsi-security-groups.md)
7. [Load Balancer](vsi-load-balancer.md)
8. [Observability](vsi-observability.md)
9. [Lifecycle and Recovery](vsi-lifecycle-recovery.md)

## Key Takeaways

- A VSI is a cloud server.
- It depends on VPC and subnet setup.
- It is built step by step, not all at once.
- Understanding the order makes the topic much easier.

# Operating System Selection

[← Previous: Worker Pools Configuration](./07-worker-pools-configuration.md) | [Index](../index.md) | [Next: Security Groups and Network Isolation →](./09-security-groups-network-isolation.md)

## Why This Choice Matters

Cluster nodes need an operating system underneath.

In OpenShift discussions, two common names you may see are:

- `RHCOS`
- `RHEL`

## Simple Difference

At a beginner level:

- `RHCOS` is more focused on running OpenShift well
- `RHEL` is a more traditional general-purpose Linux system

## RHCOS

`RHCOS` stands for Red Hat Enterprise Linux CoreOS.

You can think of it as a more specialized operating system for container platforms.

It is usually:

- more controlled
- more standardized
- better aligned with OpenShift style operations

## RHEL

`RHEL` is Red Hat Enterprise Linux.

It is a more traditional Linux operating system that many teams already know.

It offers more flexibility, but that can also mean more manual management.

## Beginner-Friendly Advice

For most learners, the main takeaway is:

- use the option recommended for normal OpenShift deployments
- choose the more traditional option only when you have a clear reason

In many cases, the more OpenShift-focused choice is easier to manage consistently.

## Key Takeaways

- Cluster nodes still need an operating system.
- RHCOS is more specialized for OpenShift.
- RHEL is more general-purpose.
- The best choice depends on how standardized or flexible you need the environment to be.

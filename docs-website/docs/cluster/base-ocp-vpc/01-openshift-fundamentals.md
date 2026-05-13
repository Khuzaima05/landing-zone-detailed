# OpenShift Fundamentals

[Index](../index.md) | [Next: Cluster Architecture →](./02-cluster-architecture.md)

## What Is OpenShift?

OpenShift is a platform for running `containers` at scale.

It is built on top of `Kubernetes`.

If that sounds new, here is the simple version:

- a `container` is a packaged application
- `Kubernetes` manages many containers
- `OpenShift` adds extra tools, security features, and a friendlier platform around Kubernetes

## Why Containers Are Useful

A container usually includes:

- the app code
- needed libraries
- runtime setup

This helps the app run more consistently in different places.

A common idea is:

```text
works on one machine -> works the same in other environments
```

## Why Orchestration Is Needed

Running one or two containers by hand is easy.

Running hundreds is not.

That is why platforms like Kubernetes and OpenShift help with:

- starting containers
- restarting failed ones
- scaling up and down
- connecting services together
- rolling out updates

## OpenShift vs Kubernetes

You can think of them like this:

| Tool | Simple Meaning |
|------|----------------|
| `Kubernetes` | the main container orchestration engine |
| `OpenShift` | Kubernetes plus more built-in enterprise features |

OpenShift often adds:

- stronger default security
- web console
- developer tools
- easier enterprise operations

## Core Terms You Should Know

### Pod

A `pod` is the smallest unit that runs in Kubernetes or OpenShift.

It usually contains one container, and sometimes more.

### Node

A `node` is a machine in the cluster.

There are usually:

- control plane nodes that manage the cluster
- worker nodes that run the applications

### Cluster

A `cluster` is the full group of nodes working together.

### Namespace

A `namespace` is a logical workspace inside the cluster.

It helps separate teams, apps, or environments.

### Service

A `service` gives a stable way for applications to talk to each other inside the cluster.

## Simple Mental Model

```text
Cluster -> Nodes -> Pods -> Applications
```

And for organization:

```text
Cluster -> Namespace -> App resources
```

## Why OpenShift on IBM Cloud

On IBM Cloud, OpenShift can use:

- VPC networking
- multi-zone design
- managed infrastructure
- integrated cloud services

This helps teams run containerized apps without building every platform piece from scratch.

## Key Takeaways

- OpenShift is a platform for running containers.
- It builds on Kubernetes.
- Pods run apps, nodes run pods, and clusters group nodes together.
- Namespaces help organize workloads.

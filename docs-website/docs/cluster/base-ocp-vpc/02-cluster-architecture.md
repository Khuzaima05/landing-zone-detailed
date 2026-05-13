# Cluster Architecture

[← Previous: OpenShift Fundamentals](./01-openshift-fundamentals.md) | [Index](../index.md) | [Next: Prerequisites and Planning →](./03-prerequisites-planning.md)

## Big Picture

An OpenShift cluster is a group of machines working together.

At a simple level, the architecture looks like this:

```text
Applications
  -> OpenShift platform
      -> IBM Cloud VPC infrastructure
```

Your apps run at the top, OpenShift manages them in the middle, and IBM Cloud infrastructure supports everything underneath.

## Main Parts of a Cluster

### Control Plane

The `control plane` is the brain of the cluster.

It makes decisions such as:

- where pods should run
- what the current cluster state is
- who is allowed to do what

### Worker Nodes

`Worker nodes` are the machines that run your application workloads.

If the control plane is the brain, worker nodes are the hands doing the work.

## Important Internal Pieces

### API Server

This is the main entry point for cluster actions.

When you create or update something, the request usually goes through the API server.

### Scheduler

The scheduler decides which worker node should run a pod.

### etcd

`etcd` stores important cluster state and configuration.

It acts like a core memory store for the cluster.

### Controllers

Controllers keep checking whether the cluster matches the desired state.

Example:

- if you want 3 pod replicas
- and 1 pod fails
- the system tries to create another one

## Why Multi-Zone Matters

Clusters are often spread across multiple zones.

That helps with:

- high availability
- fault tolerance
- better resilience during zone failures

A simple pattern is:

```text
Zone 1 -> control plane + workers
Zone 2 -> control plane + workers
Zone 3 -> control plane + workers
```

## Easy Mental Model

Think of a cluster like a school:

- control plane = principal and office staff
- worker nodes = classrooms where work happens
- scheduler = person assigning rooms
- API server = front desk for requests

## Key Takeaways

- A cluster has a control plane and worker nodes.
- The control plane manages decisions.
- Worker nodes run the real application workloads.
- Multi-zone design improves reliability.

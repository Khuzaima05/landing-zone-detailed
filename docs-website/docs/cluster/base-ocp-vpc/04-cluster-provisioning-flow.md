# Cluster Provisioning Flow

[← Previous: Prerequisites and Planning](./03-prerequisites-planning.md) | [Index](../index.md) | [Next: Resource Scoping →](./05-resource-scoping.md)

## What Happens When a Cluster Is Created

Cluster creation is not one single action.

It happens in stages.

A simple view looks like this:

```text
Prepare infrastructure
  -> Create control plane
      -> Create worker nodes
          -> Configure networking and services
              -> Validate cluster health
```

## Stage 1: Prepare Infrastructure

First, IBM Cloud needs the base network and related resources to be ready.

That may include:

- VPC
- subnets
- security groups
- gateways

Without this foundation, the cluster cannot attach to the network properly.

## Stage 2: Create the Control Plane

The control plane is set up before worker nodes.

This is important because worker nodes need something to register with.

The control plane handles:

- cluster API
- scheduling decisions
- cluster state

## Stage 3: Create Worker Nodes

After the control plane is ready, worker nodes are created.

These are the machines that will run your application pods.

If the cluster is multi-zone, workers are usually spread across zones.

## Stage 4: Configure Networking and Services

Once the nodes exist, the platform finishes important setup such as:

- cluster networking
- service exposure
- load balancer integration
- access endpoints

## Stage 5: Validation

At the end, the platform checks whether the cluster is healthy enough to use.

Typical things to verify:

- nodes are ready
- control plane responds
- networking works
- required components are running

## Why This Flow Matters

If you know the order, troubleshooting becomes easier.

For example:

- if network setup fails, worker nodes may never join
- if control plane setup fails, the cluster cannot finish
- if validation fails, the cluster may exist but not be usable

## Key Takeaways

- Cluster creation happens in stages.
- Infrastructure comes first.
- Control plane comes before worker nodes.
- Validation at the end confirms the cluster is usable.

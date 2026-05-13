# Autoscaling Configuration

[← Previous: Add-ons and Extensions](./13-addons-extensions.md) | [Index](../index.md) | [Next: Load Balancer, VPE, and Security →](./15-load-balancer-vpe-security.md)

## What Is Autoscaling?

`Autoscaling` means adjusting capacity automatically when workload demand changes.

Instead of resizing everything by hand, the platform can react for you.

## Two Main Types

### Pod autoscaling

This changes how many application pods are running.

Example:

- traffic goes up
- more pod replicas are created

### Cluster or node autoscaling

This changes how many worker nodes are available.

Example:

- too many pods are waiting for resources
- more worker capacity is added

## Why It Is Useful

Autoscaling helps with:

- handling traffic spikes
- avoiding wasted resources
- improving cost efficiency

## Simple Example

A web app normally needs 2 pods.

During busy hours:

- CPU usage increases
- autoscaling raises the app to 6 pods

If the cluster does not have enough room for them, node autoscaling may add more worker capacity too.

## Important Beginner Idea

Autoscaling works best when workloads already have reasonable resource requests and limits.

Without that, the platform has a harder time making good scaling decisions.

## Key Takeaways

- Autoscaling lets the platform adjust capacity automatically.
- Pod autoscaling changes replica count.
- Node autoscaling changes worker capacity.
- Good resource planning helps autoscaling work better.

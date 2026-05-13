# COS Registry Storage

[← Previous: KMS Encryption](./10-kms-encryption.md) | [Index](../index.md) | [Next: Cluster Endpoints →](./12-cluster-endpoints.md)

## Why the Cluster Needs Registry Storage

OpenShift uses an internal image registry to store container images.

Those images are needed so workloads can be built and deployed inside the platform.

## Why Object Storage Is a Good Fit

IBM Cloud Object Storage, often called `COS`, works well here because it provides storage that is:

- scalable
- durable
- practical for image storage

Instead of treating registry storage like a small local disk, object storage gives a more cloud-friendly place for those images.

## Simple Idea

You can think of the image registry like a warehouse for application images.

And COS is the storage system that keeps those warehouse items safe and available.

## Why This Matters

Good registry storage helps with:

- keeping built images available
- supporting deployments
- avoiding storage bottlenecks
- giving the platform a more reliable image source

## What Teams Usually Care About

When thinking about registry storage, teams usually care about:

- availability
- storage growth
- security
- cleanup of old images

## Image Pruning

Over time, old unused images can build up.

That is why `image pruning` matters.

The simple idea is:

- keep the images you still need
- remove old ones that are no longer useful

This helps control storage usage and keeps the registry cleaner.

## Key Takeaways

- OpenShift needs storage for its internal image registry.
- COS is a good fit because it is scalable and durable.
- Good registry storage supports smoother builds and deployments.
- Old images should be cleaned up over time with pruning.

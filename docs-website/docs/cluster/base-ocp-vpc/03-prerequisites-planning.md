# Prerequisites and Planning

[← Previous: Cluster Architecture](./02-cluster-architecture.md) | [Index](../index.md) | [Next: Cluster Provisioning Flow →](./04-cluster-provisioning-flow.md)

## Why Planning Comes Before Deployment

A cluster depends on many things before it can be created.

If those basics are missing, deployment becomes slow, confusing, or broken.

## Main Things You Need

Before creating a cluster, check these:

1. IBM Cloud account with billing enabled
2. enough IAM permissions
3. API key for automation
4. VPC and subnet planning
5. resource group choice
6. SSH key if needed for access

## IBM Cloud Account

You need a real IBM Cloud account that can create paid infrastructure.

Clusters use several resources, such as:

- virtual machines
- storage
- load balancers
- networking

So this is not something that fits well in a free trial style setup.

## Permissions

You need enough access to create and manage:

- VPC resources
- cluster resources
- storage and security integrations

If your permissions are too limited, deployment may fail even when the Terraform code looks correct.

## API Key

Automation tools such as Terraform use an `API key` to talk to IBM Cloud.

This key should be stored securely, not written directly into normal shared files.

## VPC and Subnet Planning

The cluster needs a network foundation first.

That means:

- one VPC
- subnets in the needed zones
- enough IP space

A simple beginner pattern is:

```text
VPC: 10.0.0.0/16
Zone 1 subnet: 10.0.1.0/24
Zone 2 subnet: 10.0.2.0/24
Zone 3 subnet: 10.0.3.0/24
```

## Resource Group

Choose the resource group where the cluster resources will live.

This affects:

- organization
- billing visibility
- access boundaries

## Version Planning

You should also decide which OpenShift version you plan to use.

For beginners, the important idea is:

- choose a stable supported version
- avoid very old unsupported versions
- test before using in production

## Size Planning

You do not need to design the perfect cluster on day one, but you should think about:

- how many worker nodes you need
- whether you need one zone or multiple zones
- whether the workloads are small, medium, or heavy

## Key Takeaways

- Good planning prevents many deployment problems later.
- The cluster needs account access, permissions, and network setup first.
- VPC and subnet design are especially important.
- Choose a clear version and size plan before deployment.

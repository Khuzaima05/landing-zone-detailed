# Cluster Learning Path

## Start Here

A `cluster` is a group of machines working together to run containers.

Instead of managing every server one by one, you manage the cluster and let it schedule applications for you.

In IBM Cloud, clusters usually depend on the VPC foundation you already created.

## Read In This Order

### Part 1: Understand the base cluster

1. [OpenShift Fundamentals](base-ocp-vpc/01-openshift-fundamentals.md)
2. [Cluster Architecture](base-ocp-vpc/02-cluster-architecture.md)
3. [Prerequisites and Planning](base-ocp-vpc/03-prerequisites-planning.md)
4. [Cluster Provisioning Flow](base-ocp-vpc/04-cluster-provisioning-flow.md)
5. [VPC Networking Integration](base-ocp-vpc/06-vpc-networking-integration.md)
6. [Worker Pools Configuration](base-ocp-vpc/07-worker-pools-configuration.md)
7. [Security Groups and Isolation](base-ocp-vpc/09-security-groups-network-isolation.md)
8. [Cluster Endpoints](base-ocp-vpc/12-cluster-endpoints.md)

### Part 2: Understand day-to-day operations

9. [Add-ons and Extensions](base-ocp-vpc/13-addons-extensions.md)
10. [Autoscaling](base-ocp-vpc/14-autoscaling-configuration.md)
11. [Cluster Lifecycle](base-ocp-vpc/18-cluster-lifecycle.md)
12. [Troubleshooting](base-ocp-vpc/23-troubleshooting.md)

### Part 3: Understand namespaces

13. [Namespace Fundamentals](namespace/01-namespace-fundamentals.md)
14. [Resource Quotas and Limits](namespace/04-resource-quotas-limits.md)
15. [RBAC and Security](namespace/05-rbac-security.md)
16. [Network Policies](namespace/06-network-policies.md)

## Simple Mental Model

```text
VPC -> Cluster -> Node -> Pod -> Namespace -> Policy
```

## What To Focus On First

When learning clusters, keep these ideas in order:

1. First understand what problem a cluster solves.
2. Then understand how it uses VPC, subnets, and worker nodes.
3. Then learn how teams organize workloads with namespaces and policies.

That order makes the topic much less overwhelming.

## Useful Official References

If you want the product and platform version after reading this learning path, these official docs are useful:

- [IBM Cloud VPC cluster creation](https://cloud.ibm.com/docs/openshift?topic=openshift-cluster-create-vpc-gen2)
- [IBM Cloud VPC cluster networking basics](https://cloud.ibm.com/docs/openshift?topic=openshift-plan_vpc_basics)
- [IBM Cloud VPC subnets for OpenShift clusters](https://cloud.ibm.com/docs/openshift?topic=openshift-vpc-subnets)
- [IBM Cloud worker pools and worker nodes](https://cloud.ibm.com/docs/openshift?topic=openshift-add-workers-vpc)
- [Kubernetes namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- [Kubernetes network policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)

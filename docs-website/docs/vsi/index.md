# VSI Learning Path

## Start Here

`VSI` means `Virtual Server Instance`.

It is simply a cloud server that runs inside your VPC.

If VPC is the network foundation, then VSI is the machine you actually use to run:

- websites
- backend apps
- test machines
- jump boxes
- small databases

## Read In This Order

1. [Provisioning Overview](vsi-provisioning-overview.md)
2. [Resource Scoping](vsi-resource-scoping.md)
3. [Network Foundation](vsi-network-foundation.md)
4. [Compute Instantiation](vsi-compute-instantiation.md)
5. [Storage Configuration](vsi-storage-configuration.md)
6. [Instance Networking](vsi-instance-networking.md)
7. [Security Groups](vsi-security-groups.md)
8. [Load Balancer](vsi-load-balancer.md)
9. [Observability](vsi-observability.md)
10. [Lifecycle and Recovery](vsi-lifecycle-recovery.md)
11. [Architecture Summary](vsi-architecture-summary.md)

## Simple Mental Model

```text
VPC -> Subnet -> VSI -> Storage + Security + Monitoring
```

## What To Focus On First

When learning VSI for the first time, focus on these questions:

1. Which subnet will the server use?
2. Which profile gives enough CPU and memory?
3. Which security rules allow access?
4. Does the server need a public IP or only a private IP?

If those four things are clear, the rest of the section becomes much easier.

## Useful Official References

If you want deeper product detail after finishing this section, these IBM Cloud pages are helpful:

- [IBM Cloud VPC overview](https://cloud.ibm.com/docs/vpc?topic=vpc-about-vpc)
- [IBM Cloud subnets](https://cloud.ibm.com/docs/vpc?topic=vpc-about-subnets-vpc)
- [IBM Cloud floating IPs](https://cloud.ibm.com/docs/vpc?topic=vpc-fip-about)
- [IBM Cloud public gateways](https://cloud.ibm.com/docs/vpc?topic=vpc-about-public-gateways)
- [IBM Cloud application load balancers](https://cloud.ibm.com/docs/vpc?topic=vpc-load-balancers-about)

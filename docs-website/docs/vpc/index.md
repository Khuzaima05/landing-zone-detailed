# VPC Learning Path

## Start Here

If you are new to cloud networking, read this section in order. The goal is simple: understand what a VPC is, why we need it, how IP addresses are planned, and where servers actually live.

A good way to think about a VPC is this:

- A `VPC` is your private area in the cloud.
- A `subnet` is a smaller room inside that area.
- A `server` or `cluster node` sits inside a subnet.
- `Security rules` decide who can talk to whom.

## Recommended Reading Order

1. [VPC Foundation](vpc-foundation/)
2. [How VPC Works Internally](vpc-service-internals/)
3. [Regions, Zones, and Datacenters](zones-datacenter-architecture/)
4. [CIDR Planning and IP Addresses](cidr-planning-ipam/)
5. [Subnets](subnet-service-internals/)
6. [Network ACLs](network-acl-architecture/)
7. [Security Groups](security-group-service-internals/)
8. [Route Tables](route-table-service/)

After these eight chapters, the rest become much easier.

## Simple Mental Model

```text
Region
  -> VPC
      -> Subnet
          -> Workload
              -> Security Rules
```

## What To Learn First

### 1. Understand the container

Do not start by memorizing every IBM Cloud networking feature. First understand the container:

- The `region` is the large geographic area.
- The `VPC` is your private network boundary in that region.
- The `subnet` is where machines and services get their private IPs.

### 2. Understand the address plan

Before creating servers, you should know:

- what IP addresses are
- what `10.0.0.0/16` means
- how to split one big network into smaller subnets

### 3. Understand the protection layers

Inside a VPC, security is usually learned in this order:

1. `Network ACLs` protect traffic at subnet level.
2. `Security groups` protect traffic at server or service level.
3. `Route tables` decide where traffic goes.

## Advanced Topics

Once the basics are clear, move to the supporting topics when you need them:

- [Floating IPs](floating-ip-architecture/)
- [Load Balancers](load-balancer-architecture/)
- [Transit Gateway](transit-gateway-integration/)
- [Flow Logs](flow-logs-observability/)
- [Hub-Spoke DNS](hub-spoke-dns-architecture/)
- [Outputs for Other Modules](outputs-downstream-consumption/)

## Useful Official References

If you want product-native detail after reading this learning path, these official pages are useful:

- [IBM Cloud VPC overview](https://cloud.ibm.com/docs/vpc?topic=vpc-about-vpc)
- [IBM Cloud subnets](https://cloud.ibm.com/docs/vpc?topic=vpc-about-subnets-vpc)
- [IBM Cloud VPC networking](https://cloud.ibm.com/docs/vpc?topic=vpc-about-networking-for-vpc)
- [IBM Cloud VPC security groups and ACLs](https://cloud.ibm.com/docs/vpc?topic=vpc-security-in-your-vpc)

## Best Way To Read This Section

Read the first five VPC chapters like a short blog series. Do not jump around too early. Each chapter builds on the previous one, and that is the fastest way to make the topic feel easy.

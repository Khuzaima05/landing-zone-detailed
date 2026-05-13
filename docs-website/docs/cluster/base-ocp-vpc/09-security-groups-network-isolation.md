# Security Groups and Network Isolation

[← Previous: Operating System Selection](./08-operating-system-selection.md) | [Index](../index.md) | [Next: KMS Encryption →](./10-kms-encryption.md)

## Why This Topic Matters

Cluster nodes should not accept every kind of traffic from everywhere.

This is why security groups and network isolation are important.

## Security Groups

A `security group` is like a virtual firewall.

It controls which traffic can enter or leave a node.

For example, rules may allow:

- cluster management traffic
- app traffic on specific ports
- internal traffic between cluster components

## Network Isolation

`Network isolation` means keeping different traffic paths properly separated.

This helps reduce risk.

Simple examples:

- only trusted sources should reach admin endpoints
- backend systems should not be open like public websites
- database-style traffic should stay private

## Two Useful Ideas

### 1. Least privilege

Allow only the traffic that is actually needed.

### 2. Layered security

Do not depend on one rule only.

Clusters often rely on multiple protection layers such as:

- VPC design
- subnets
- ACLs
- security groups
- cluster-level policies

## Simple Example

For a cluster:

- the API endpoint should be carefully protected
- worker nodes should not expose unnecessary ports
- application traffic should follow only intended paths

## Key Takeaways

- Security groups act like virtual firewalls for cluster nodes.
- Network isolation reduces unnecessary exposure.
- Good design allows only required traffic.
- Security should be layered, not handled in only one place.

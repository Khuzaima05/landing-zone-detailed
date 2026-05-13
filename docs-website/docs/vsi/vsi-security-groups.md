# Security Groups

[← Previous: Instance Networking](./vsi-instance-networking.md) | [Index](./index.md) | [Next: Load Balancer →](./vsi-load-balancer.md)

## What Is a Security Group?

A `security group` is like a virtual firewall for a server.

It controls which traffic is allowed to enter or leave the VSI.

## Two Main Directions

Every rule is usually about one direction:

| Direction | Meaning |
|-----------|---------|
| `inbound` | traffic coming into the server |
| `outbound` | traffic leaving the server |

## Common Protocols

You will often see:

- `TCP` for web, SSH, and database traffic
- `UDP` for things like DNS or streaming
- `ICMP` for ping and network testing

## Common Ports

Some beginner-friendly examples:

| Port | Use |
|------|-----|
| `22` | SSH |
| `80` | HTTP |
| `443` | HTTPS |
| `5432` | PostgreSQL |

## Source Matters Too

A rule is not only about the port. It is also about who is allowed to use it.

Examples:

- allow SSH only from office IPs
- allow HTTPS from anywhere
- allow database access only from app servers

This is how security groups help keep systems safer.

## Stateful Behavior

IBM Cloud VPC security groups are `stateful`.

That means if allowed traffic comes in, the return traffic is automatically allowed back out.

This makes them easier to work with than stateless firewall rules.

## Simple Example

For a public web server:

- allow inbound `22` from a trusted admin IP range
- allow inbound `80` and `443` from users
- allow normal outbound traffic if needed

For a private database server:

- do not allow public web traffic
- allow database traffic only from the application layer

## Good Beginner Practice

Use the rule of least privilege:

- open only the ports you really need
- allow only the sources you trust
- keep database access private

## Key Takeaways

- A security group is a virtual firewall for the VSI.
- It controls inbound and outbound traffic.
- Ports and source ranges both matter.
- Good security groups allow only the minimum needed traffic.

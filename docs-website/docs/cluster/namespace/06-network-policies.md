# Network Policies

[← Previous: RBAC and Security](./05-rbac-security.md) | [Index](./index.md) | [Next: Terraform Mapping →](./07-terraform-mapping.md)

## Why Network Policies Matter

Namespaces organize workloads, but they do not automatically block traffic between them.

That is where `NetworkPolicy` becomes important.

## What a Network Policy Does

A `NetworkPolicy` controls which pods are allowed to send or receive traffic.

It can define:

- allowed sources
- allowed destinations
- allowed ports

## Simple Example

You may want rules like:

- frontend can talk to backend
- backend can talk to database
- database should not accept random traffic from anywhere else

This creates a cleaner and safer traffic design.

## Important Beginner Idea

Namespaces create logical boundaries.

Network policies create traffic boundaries.

You usually need both for strong isolation.

## Good Practice

A common safe mindset is:

- block by default
- allow only what is needed

That is often called a zero-trust style starting point.

## Key Takeaways

- Network policies control pod-to-pod traffic.
- Namespaces alone do not fully isolate network traffic.
- Good policies allow only the intended communication paths.

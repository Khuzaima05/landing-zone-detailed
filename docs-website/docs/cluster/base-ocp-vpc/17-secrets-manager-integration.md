# Secrets Manager Integration

[← Previous: CBR Rules](./16-cbr-rules.md) | [Index](../index.md) | [Next: Cluster Lifecycle →](./18-cluster-lifecycle.md)

## Why Secrets Matter

Applications and platforms often need sensitive values such as:

- passwords
- API keys
- certificates
- service credentials

These should not be handled casually.

## What Secrets Manager Does

`Secrets Manager` gives a centralized way to store and manage sensitive values.

Instead of scattering secrets across many places, teams can use one managed service for better control.

## Why This Is Better

Using a secrets management system helps with:

- stronger access control
- better auditing
- easier rotation
- cleaner separation between apps and secret storage

## Kubernetes Secrets vs External Secrets Management

At a simple level:

- Kubernetes secrets are built into the cluster
- an external secrets manager gives stronger centralized management

For production-style environments, that external approach is often more mature and safer for highly sensitive values.

## Simple Mental Model

Think of it like this:

- the application needs a key
- Secrets Manager is the secure vault that holds it
- the app gets access in a controlled way

## Rotation Matters Too

One important benefit is `rotation`.

That means a password, certificate, or credential can be updated over time instead of staying the same forever.

This improves security.

## Key Takeaways

- Secrets should be handled carefully and centrally.
- Secrets Manager helps store and manage sensitive values more safely.
- It improves access control, auditing, and rotation.
- This is especially important for production and security-focused environments.

# Observability

[← Previous: Load Balancer](./vsi-load-balancer.md) | [Index](./index.md) | [Next: Lifecycle and Recovery →](./vsi-lifecycle-recovery.md)

## What Is Observability?

`Observability` means being able to understand what is happening in a running system.

Instead of logging into every server and checking manually, we collect useful information automatically.

## Two Main Parts

For beginners, observability usually means:

1. `logging`
2. `monitoring`

## Logging

Logs are records of events.

Examples:

- application started
- login failed
- disk almost full
- service crashed

Logging helps answer:

- what happened?
- when did it happen?

## Monitoring

Monitoring focuses more on measurements.

Examples:

- CPU usage
- memory usage
- disk usage
- network traffic

Monitoring helps answer:

- is the system healthy?
- is it under heavy load?

## Why It Matters

Without observability, troubleshooting becomes much harder.

With good logging and monitoring, teams can:

- detect problems earlier
- understand failures faster
- watch performance over time

## Simple Mental Model

Think of it like a car dashboard:

- logs are the notes about what happened
- monitoring is the speedometer, fuel gauge, and warning lights

You want both.

## Good Beginner Practice

Try to make a server observable from the beginning, not only after something breaks.

That means:

- collect logs
- collect key metrics
- name and tag systems clearly

## Key Takeaways

- Observability helps you understand a running server.
- Logging records events.
- Monitoring tracks system health and usage.
- Both are important for troubleshooting and operations.

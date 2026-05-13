# Troubleshooting

[← Previous: Best Practices](./22-best-practices.md) | [Index](../index.md) | [Next: Outputs and Integration →](./24-outputs-integration.md)

## A Simple Troubleshooting Approach

When something breaks, do not jump randomly.

Use a simple order:

1. understand the symptom
2. collect evidence
3. isolate the cause
4. test the fix

## Common Areas to Check

Most cluster problems are usually related to one of these:

- permissions
- networking
- node health
- storage
- application configuration

## Example Questions

Ask simple questions like:

- did something change recently?
- are nodes ready?
- is the API reachable?
- are pods failing to start?
- is storage stuck?

## Useful Mindset

Try to move from broad to narrow:

- first check cluster health
- then check the affected namespace or workload
- then check the specific pod, service, route, or PVC

## Common Patterns

### If deployment is failing

Check:

- permissions
- Terraform or configuration errors
- missing dependencies

### If nodes are not joining

Check:

- subnet and networking setup
- security rules
- worker status

### If applications are unreachable

Check:

- service
- route or load balancer
- network policies
- pod readiness

## Key Takeaways

- Good troubleshooting follows a clear order.
- Start with symptoms, then narrow down the cause.
- Most problems come from a few repeat areas such as networking, permissions, storage, or workload setup.

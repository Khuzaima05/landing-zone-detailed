# Resource Scoping

[← Previous: VSI Provisioning Overview](./vsi-provisioning-overview.md) | [Index](./index.md) | [Next: Network Foundation →](./vsi-network-foundation.md)

## Why This Comes First

Before creating a server, we first decide where it belongs and how it should be identified.

This page is not about CPU or networking yet. It is about ownership and naming.

## Main Things Decided Here

This step usually answers four questions:

1. Which resource group will hold the server?
2. What prefix or naming style will we use?
3. Which tags help us identify it later?
4. Which access tags affect permission rules?

## Resource Group

A `resource group` is a container used to organize cloud resources.

It helps with:

- ownership
- billing
- access control
- cleaner organization

If a team creates a VSI in a resource group, that group becomes the main place where the resource belongs.

## Prefix

A `prefix` is a common beginning used in resource names.

Example:

```text
prod-web-vsi-01
prod-web-vsi-02
prod-web-volume-01
```

This makes it easier to understand what resources belong together.

## Tags

`Tags` are labels added to resources.

Examples:

- `env:prod`
- `team:platform`
- `app:web`

Tags help teams search, group, and track resources more easily.

## Access Tags

`Access tags` are special tags used with permission rules.

They help decide who can manage or view a resource.

Simple example:

- resources tagged `env:prod`
- only users with production access can change them

## Why This Matters

If you skip this planning, later it becomes harder to:

- know who owns a server
- find the right resources quickly
- control access cleanly
- keep naming consistent

## Easy Mental Model

Think of this like putting a label on a notebook before writing inside it:

- resource group = which shelf it belongs on
- prefix = the notebook title
- tags = sticky notes for search
- access tags = who is allowed to open it

## Key Takeaways

- Resource scoping is about organization before creation.
- Resource groups decide where the VSI belongs.
- Prefixes and tags make resources easier to manage.
- Access tags help with permissions and governance.

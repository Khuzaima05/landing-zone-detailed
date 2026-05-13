# Compute Instantiation

[← Previous: Network Foundation](./vsi-network-foundation.md) | [Index](./index.md) | [Next: Storage Configuration →](./vsi-storage-configuration.md)

## What This Step Means

This is the step where the actual server is defined.

Now we decide:

- what operating system it starts with
- how much CPU and memory it gets
- how we log in securely

## Choosing the Boot Source

A server needs a starting point for booting.

Usually that is one of these:

1. an `image`
2. a `catalog offering`
3. a `snapshot`

### Image

An `image` is a standard operating system template, such as Ubuntu or Red Hat Enterprise Linux.

Use this when you want a fresh machine.

### Catalog Offering

A `catalog offering` is a pre-packaged setup that may already include software or special configuration.

Use this when you want a ready-made solution.

### Snapshot

A `snapshot` is a saved copy of an older disk.

Use this when you want to recreate or clone a machine quickly.

## Choosing the Machine Type

The `machine type` decides the size of the server.

That includes:

- CPU
- memory
- general performance level

Simple examples:

| Type | Good For |
|------|----------|
| small | testing or light apps |
| medium | normal business apps |
| large | heavy workloads |

Balanced profiles are good for most beginners.

## Secure Access With SSH Keys

Instead of using passwords, cloud servers usually use `SSH keys`.

Simple idea:

- you keep the private key
- IBM Cloud adds the public key to the server
- you use the private key to connect

This is safer than normal password login.

## First-Boot Setup

Sometimes you want the server to do a few things automatically when it starts the first time.

Examples:

- install packages
- start a service
- download application code

This is often done through `user_data` or `cloud-init`.

## Easy Example

A common beginner setup looks like this:

- Ubuntu image
- medium machine type
- one SSH key
- a short startup script to install Nginx

That is enough to create a basic web server.

## Key Takeaways

- This step defines the actual server.
- You choose a boot source, machine size, and access method.
- Images are common for fresh deployments.
- SSH keys are the normal secure login method.

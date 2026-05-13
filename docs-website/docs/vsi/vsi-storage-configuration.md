# Storage Configuration

[← Previous: Compute Instantiation](./vsi-compute-instantiation.md) | [Index](./index.md) | [Next: Instance Networking →](./vsi-instance-networking.md)

## Why Storage Matters

A server needs storage to keep:

- the operating system
- application files
- logs
- database data

In cloud systems, storage is treated as its own important part.

## Boot Volume

The `boot volume` is the main disk the server starts from.

It holds the operating system and the basic machine state.

When the VSI powers on, it reads from this boot volume.

## Boot Volume Choices

You usually decide:

- size
- storage profile
- performance level

A bigger or faster disk may be useful for heavier workloads, while a small general-purpose disk is enough for simple apps or labs.

## Extra Volumes

Sometimes one disk is not enough.

You can attach extra block storage volumes for:

- database data
- logs
- backups
- application files

This is often cleaner than putting everything on the boot disk.

## Simple Example

```text
Boot volume -> operating system
Volume 2    -> application data
Volume 3    -> logs
```

This setup is easier to manage than mixing all data together.

## Encryption

Cloud storage is usually encrypted.

There are two simple approaches:

| Type | Meaning |
|------|---------|
| provider-managed | IBM Cloud handles the encryption keys |
| customer-managed | your team controls the keys with KMS |

Customer-managed keys are more useful when you need stronger control or compliance.

## Snapshots

A `snapshot` is a saved copy of a volume.

It helps with:

- backup
- restore
- cloning
- recovery

If a server fails, snapshots can help you rebuild faster.

## Good Beginner Habit

For learning and clean design:

- keep the OS on the boot volume
- keep app or database data on separate volumes
- use snapshots for recovery planning

## Key Takeaways

- Storage is a core part of a VSI, not an afterthought.
- The boot volume holds the operating system.
- Extra volumes are useful for data, logs, and backups.
- Encryption and snapshots improve safety and recovery.

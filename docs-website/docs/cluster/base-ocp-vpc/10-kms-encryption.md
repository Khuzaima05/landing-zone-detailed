# KMS Encryption

[← Previous: Security Groups and Network Isolation](./09-security-groups-network-isolation.md) | [Index](../index.md) | [Next: COS Registry Storage →](./11-cos-registry-storage.md)

## Why Encryption Matters

Clusters store important data.

That can include:

- cluster configuration
- secrets
- application data
- persistent storage contents

`Encryption at rest` helps protect that data when it is stored on disk.

## What KMS Means

`KMS` stands for `Key Management Service`.

A KMS helps manage the encryption keys used to protect data.

Instead of every system handling keys in an ad hoc way, a dedicated service manages them more safely.

## IBM Cloud Choices

In IBM Cloud, a common beginner understanding is:

- one option is simpler and fits many normal production cases
- another option is stronger and more specialized for stricter security needs

The main idea is not to memorize every product detail first.

The main idea is:

- encrypted data uses keys
- those keys should be managed carefully

## Where Encryption Helps in a Cluster

Encryption can matter for:

- etcd and cluster state
- secrets
- persistent volumes
- backups and snapshots

## Simple Mental Model

Think of your data like documents in a locked cabinet.

- the data is the document
- encryption is the lock
- KMS manages the keys for that lock

## Good Beginner Practice

For production-style thinking:

- use encryption for sensitive data
- manage keys in a proper service
- do not treat key management as an afterthought

## Key Takeaways

- Encryption at rest protects stored data.
- KMS helps manage encryption keys safely.
- Cluster state, secrets, and storage are important places where encryption matters.
- Good key management is part of good platform security.

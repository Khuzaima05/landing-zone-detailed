# VSI Architecture Summary

> Complete reference for understanding VSI infrastructure in IBM Cloud VPC

---

## The Complete VSI

A VSI is **NOT** just a VM. A VSI is:

```
Compute
  + Storage
  + Networking
  + Security
  + Routing
  + Persistence
  + Observability
  + Recovery

...inside a VPC
```

---

## Foundational Dependency Chain

**Always remember this order:**

```
Resource Group
    ↓
VPC
    ↓
Subnet
    ↓
Network Interface
    ↓
VSI
    ↓
Storage
    ↓
Security
    ↓
Public Exposure
    ↓
Observability
    ↓
Recovery
```

> **Rule:** Nothing skips layers.

---

## Terraform Mental Model

**Terraform does NOT create infrastructure directly.**

**Flow:**
```
Variables
   ↓
Terraform Module
   ↓
IBM Provider
   ↓
IBM Cloud APIs
   ↓
Actual Resources
```

---

## Most Important Beginner Insight

Everything in cloud infrastructure is actually **independent resources attached together**.

**Example:**
```
VSI
 ├── NIC
 ├── Security Group
 ├── Boot Volume
 ├── Floating IP
 ├── SSH Keys
 ├── Monitoring Agent
 └── Load Balancer Membership
```

The VM is just the center attachment point.

---

## VSI Mental Memory Map

```
                    ┌─────────────────────────┐
                    │     RESOURCE SCOPE      │
                    │-------------------------│
                    │ resource_group_id       │
                    │ prefix                  │
                    │ tags                    │
                    │ access_tags             │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │         VPC LAYER       │
                    │-------------------------│
                    │ vpc_id                  │
                    │ subnets                 │
                    │ secondary_subnets       │
                    │ zones                   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      COMPUTE LAYER      │
                    │-------------------------│
                    │ image_id                │
                    │ catalog_offering        │
                    │ machine_type            │
                    │ ssh_key_ids             │
                    │ user_data               │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      STORAGE LAYER      │
                    │-------------------------│
                    │ boot_volume_*           │
                    │ block_storage_volumes   │
                    │ kms_encryption_enabled  │
                    │ snapshots               │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   INSTANCE NETWORKING   │
                    │-------------------------│
                    │ primary NIC             │
                    │ reserved IPs            │
                    │ floating IP             │
                    │ secondary interfaces    │
                    │ spoofing                │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      SECURITY LAYER     │
                    │-------------------------│
                    │ security groups         │
                    │ inbound rules           │
                    │ outbound rules          │
                    │ SG attachments          │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   TRAFFIC MANAGEMENT    │
                    │-------------------------│
                    │ load balancer           │
                    │ listeners               │
                    │ pools                   │
                    │ health checks           │
                    │ DNS                     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     OBSERVABILITY       │
                    │-------------------------│
                    │ logging agent           │
                    │ monitoring agent        │
                    │ telemetry               │
                    │ metrics                 │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   RECOVERY & LIFECYCLE  │
                    │-------------------------│
                    │ snapshots               │
                    │ consistency groups      │
                    │ static names            │
                    │ restore workflows       │
                    └─────────────────────────┘
```

---

## Networking Mental Model

```
Internet
   ↓
Floating IP
   ↓
Load Balancer
   ↓
Security Group
   ↓
Network Interface
   ↓
VSI
   ↓
Application
```

---

## Packet Flow Memory Model

### Inbound

```
Client
  ↓
DNS
  ↓
Load Balancer
  ↓
Security Group
  ↓
VSI Interface
  ↓
Application Port
```

### Outbound

```
Application
   ↓
VSI Interface
   ↓
Security Group
   ↓
Subnet Route
   ↓
Public Gateway
   ↓
Internet
```

---

## Storage Memory Model

```
Boot Volume
  └── OS + system state

Block Volumes
  ├── database
  ├── logs
  ├── backups
  └── application data

Snapshots preserve volume state.
```

---

## Security Memory Model

```
ACL
  ↓
Security Group
  ↓
OS Firewall
  ↓
Application Auth

Layered defense.
```

---

## Multi-Interface Architecture

```
                VSI
          ┌──────┼──────┐
          │      │      │
        eth0   eth1   eth2
          │      │      │
      frontend backend monitoring
       subnet   subnet   subnet
```

---

## Observability Flow

### Logging

```
Application Logs
      ↓
Logging Agent
      ↓
IBM Cloud Logs
      ↓
Search / Alerting
```

### Monitoring

```
CPU / RAM / Network
        ↓
Monitoring Agent
        ↓
Collector
        ↓
Dashboards / Alerts
```

---

## Recovery Architecture

```
Running VSI
     ↓
Snapshot
     ↓
Disaster
     ↓
Restore Snapshot
     ↓
New VSI

Infrastructure becomes reproducible.
```

---

## Reference Architecture (Production-Grade)

```
                    Internet
                        │
                ┌───────▼────────┐
                │ Load Balancer  │
                └───────┬────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
     ┌────▼────┐                 ┌────▼────┐
     │ VSI-1   │                 │ VSI-2   │
     │ App     │                 │ App     │
     └────┬────┘                 └────┬────┘
          │                           │
          └──────────┬────────────────┘
                     │
              Backend Subnet
                     │
               ┌─────▼─────┐
               │ Database  │
               └───────────┘

All inside:
- VPC
- Multi-zone subnets
- Security groups
- Monitoring/logging
- Snapshot backups
```

---

## Final Compression Model

| Component | Definition |
|-----------|------------|
| **VPC** | Isolated network |
| **Subnet** | Zone-specific IP range |
| **VSI** | VM attached to subnet |
| **NIC** | Network identity |
| **Security Group** | Firewall |
| **Floating IP** | Public exposure |
| **Load Balancer** | Traffic distributor |
| **Volume** | Persistent disk |
| **Snapshot** | Recoverable disk state |
| **Monitoring** | Metrics visibility |
| **Logging** | Event visibility |

---

## Key Principles

### 1. Layered Architecture
Every VSI deployment follows 10 strict layers. Nothing skips layers.

### 2. Resource Composition
VSIs are composed of independent resources attached together.

### 3. Dependency Chain
Resources must be created in order: Resource Group → VPC → Subnet → VSI → Storage → Security → Observability → Recovery.

### 4. Reproducibility
Infrastructure should be recreatable through code and snapshots.

### 5. Defense in Depth
Security happens at multiple layers: ACLs, Security Groups, OS Firewall, Application Auth.

---

## Quick Reference

### Essential Variables

| Layer | Key Variables |
|-------|---------------|
| **Resource Scoping** | resource_group_id, prefix, tags |
| **Network** | vpc_id, subnets, vsi_per_subnet |
| **Compute** | image_id, machine_type, ssh_key_ids |
| **Storage** | boot_volume_*, block_storage_volumes |
| **Networking** | manage_reserved_ips, enable_floating_ip |
| **Security** | security_group_rules, security_group_ids |
| **Load Balancer** | load_balancer object |
| **Observability** | install_logging_agent, install_monitoring_agent |
| **Lifecycle** | custom_vsi_volume_names, snapshot_consistency_group_id |

---

## Common Mistakes to Avoid

### 1. Skipping Layers
```
✗ Bad: Creating VSI without VPC/subnet
✓ Good: Follow dependency chain
```

### 2. No Backup Strategy
```
✗ Bad: No snapshots
✓ Good: Regular automated snapshots
```

### 3. Weak Security
```
✗ Bad: 0.0.0.0/0 on all ports
✓ Good: Least privilege security groups
```

### 4. No Observability
```
✗ Bad: No logging or monitoring
✓ Good: Agents installed from day 1
```

### 5. Random Naming
```
✗ Bad: Auto-generated names
✓ Good: Deterministic, meaningful names
```

---

## Next Steps

### Learn More

- [VSI Provisioning Overview](vsi-provisioning-overview.md)
- [Layer 1: Resource Scoping](vsi-resource-scoping.md)
- [Layer 2: Network Foundation](vsi-network-foundation.md)
- [Layer 3: Compute Instantiation](vsi-compute-instantiation.md)
- [Layer 4: Storage Configuration](vsi-storage-configuration.md)
- [Layer 5: Instance Networking](vsi-instance-networking.md)
- [Layer 6: Security Groups](vsi-security-groups.md)
- [Layer 7: Secondary Interfaces](vsi-secondary-interfaces.md)
- [Layer 8: Load Balancer](vsi-load-balancer.md)
- [Layer 9: Observability](vsi-observability.md)
- [Layer 10: Lifecycle & Recovery](vsi-lifecycle-recovery.md)

### Related Topics

- [VPC Infrastructure](../vpc/vpc-foundation.md)
- [Security Best Practices](../security/index.md)
- [Networking Concepts](../networking/index.md)

---

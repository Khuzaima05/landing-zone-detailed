# VSI Deep Dive: Complete Infrastructure Guide

> A comprehensive guide to understanding Virtual Server Instance (VSI) provisioning in IBM Cloud VPC, covering all layers from resource scoping to recovery workflows.

---

## Table of Contents

1. [Overview: The VSI Provisioning Flow](#overview-the-vsi-provisioning-flow)
2. [Layer 1: Resource Scoping & Ownership](#layer-1-resource-scoping--ownership)
3. [Layer 2: Network Foundation](#layer-2-network-foundation)
4. [Layer 3: Compute Instantiation](#layer-3-compute-instantiation)
5. [Layer 4: Storage Configuration](#layer-4-storage-configuration)
6. [Layer 5: Instance-Level Networking](#layer-5-instance-level-networking)
7. [Layer 6: Security Groups](#layer-6-security-groups)
8. [Layer 7: Advanced Networking (Secondary Interfaces)](#layer-7-advanced-networking-secondary-interfaces)
9. [Layer 8: Load Balancer Integration](#layer-8-load-balancer-integration)
10. [Layer 9: Observability & Monitoring](#layer-9-observability--monitoring)
11. [Layer 10: Lifecycle Management & Recovery](#layer-10-lifecycle-management--recovery)
12. [Architecture Summary](#architecture-summary)
13. [Visual Reference Models](#visual-reference-models)

---

## Overview: The VSI Provisioning Flow

The VSI provisioning flow in this module starts at the **account and resource scoping layer**, where `resource_group_id`, `prefix`, `tags`, and `access_tags` define ownership, naming, and governance boundaries. Every resource created—VSI, volumes, network interfaces—gets grouped under a specific resource group and inherits tagging for identification and access control. The prefix enforces consistent naming across all generated resources, ensuring uniqueness and traceability, while access_tags integrate with IAM to control who can operate on the deployed VSI resources.

The next layer is the **network attachment**, which is entirely dependent on pre-existing VPC infrastructure. The `vpc_id` anchors the VSI to a specific virtual network, and the `subnets` list determines exactly where instances are placed. Each subnet object includes id, zone, and optional CIDR, meaning the module distributes VSIs zone-wise. The variable `vsi_per_subnet` drives horizontal scaling: for each subnet provided, that number of VSI instances is created. This establishes the fundamental topology—multi-zone distribution for availability—where each VSI gets deployed inside a specific subnet and inherits its routing, gateway access, and network policies.

The complete flow is strictly layered: resource scoping defines ownership, VPC inputs define network placement, compute variables define the machine, storage variables attach persistence, networking variables expose and connect the instance, security variables restrict traffic, and optional integrations (load balancer, logging, monitoring) extend functionality. Each variable directly maps to a specific API call or resource configuration, and the module enforces constraints through validations to ensure the final VSI deployment is consistent, secure, and reproducible.

---

## Layer 1: Resource Scoping & Ownership

Before anything is created, the module needs to know where resources belong organizationally. This layer has nothing to do with networking or compute yet. Instead, it answers operational questions:

- **Which team owns this infrastructure?**
- **How should resources be identified?**
- **Which IAM policies apply?**
- **Which automation systems can discover these resources?**

### Key Variables

| Variable | Purpose |
|----------|---------|
| `resource_group_id` | Determines the IBM Cloud resource container where all resources are provisioned |
| `tags` | Adds searchable metadata for resource identification |
| `access_tags` | Influences IAM authorization behavior |
| `prefix` | Becomes the naming foundation used throughout the module |

This layer establishes administrative identity before infrastructure even exists.

---

## Layer 2: Network Foundation

The network foundation is defined through VPC-related inputs. At this stage, the module is not yet creating machines—it is selecting the networking environment into which machines will later attach.

### Key Concepts

The variable `vpc_id` selects the isolated virtual network where the VSI will operate. The `subnets` list determines the exact network segments and zones where instances are placed.

This layer determines:

- ✓ IP address ranges
- ✓ Availability zones
- ✓ Routing behavior
- ✓ Internet access paths
- ✓ Subnet-level ACL protections

> **Important:** The subnet effectively becomes the "location" where the VSI will live. Without this networking layer, the machine would have nowhere to attach.

---

## Layer 3: Compute Instantiation

The compute instantiation stage is the exact point where an abstract infrastructure definition turns into a real, bootable machine. Every variable in this layer directly controls how the virtual machine is created, what it runs, and how it is accessed.

### Boot Source Selection

The first requirement is selecting the boot source, which defines what the machine will run when it starts. The module enforces that **only one** of the following is used:

1. **`image_id`** - Standard OS image (Ubuntu, RHEL, etc.)
2. **`catalog_offering`** - Pre-packaged solution with bundled software
3. **`boot_volume_snapshot_crn`** - Clone an existing disk state

> **Why only one?** This constraint ensures determinism—there is exactly one source of truth for how the machine boots, avoiding conflicts or ambiguity.

### Compute Capacity

Once the OS source is fixed, the next step is defining the compute capacity using **`machine_type`**. This is not just a label but a predefined hardware profile that determines:

- CPU cores
- RAM
- Network throughput

### Secure Access

Access is configured through **`ssh_key_ids`**. Instead of using passwords, the system injects SSH public keys into the instance during creation. When the machine boots, these keys are placed into the OS (typically in `~/.ssh/authorized_keys`).

**Benefits:**
- ✓ Eliminates password-based authentication
- ✓ Stronger security
- ✓ Easier to manage at scale

### Initialization Logic

The final part is initialization logic, handled by **`user_data`**. This is a script or configuration block that runs automatically when the machine boots for the first time via cloud-init.

**Typical operations:**
- Installing software packages
- Starting services
- Configuring users
- Pulling application code

### The Complete Flow

```
Provision VM with compute profile
         ↓
Attach boot volume from chosen source
         ↓
Inject SSH keys for secure access
         ↓
Execute initialization scripts
         ↓
Fully operational machine
```

---

## Layer 4: Storage Configuration

The storage configuration stage defines how data is stored for the VSI, how fast that storage performs, how secure it is, and whether the data survives machine restarts or recreations.

> **Key Concept:** In cloud infrastructure, storage is separated from compute. The virtual machine itself is only CPU and memory; all operating system files, applications, logs, and databases live on attached storage volumes.

### Boot Volume

The **boot volume** is the primary disk attached to the VSI during creation. When the machine powers on, the operating system is loaded from this boot volume.

#### Boot Volume Configuration

| Variable | Purpose |
|----------|---------|
| `boot_volume_size` | Defines storage capacity |
| `boot_volume_profile` | Defines storage class (general-purpose, sdp, etc.) |
| `boot_volume_iops` | Controls disk speed (Input/Output Operations Per Second) |

**IOPS Example:**
- High IOPS → Better for databases or analytics systems
- Standard IOPS → Sufficient for general workloads

### Encryption

Encryption controls how the data stored on disks is protected. There are two modes:

#### Provider-Managed Encryption
```
kms_encryption_enabled = false
```
- IBM Cloud manages encryption internally
- Simpler but less governance

#### Customer-Managed Encryption
```
kms_encryption_enabled = true
boot_volume_encryption_key = <KMS key>
```
- Customer controls the key lifecycle
- Enables compliance and auditing
- Stricter security policies

The variable **`use_boot_volume_key_as_default`** determines whether the same encryption key used for the boot volume should automatically apply to all additional storage volumes.

### Additional Block Storage

Beyond the boot volume, the VSI can attach additional block storage volumes using **`block_storage_volumes`**. These are independent disks attached to the machine.

**Example separation:**
```
Boot volume       → Operating system
Additional volume → Database storage
Another volume    → Logs
Another volume    → Backups
```

#### Volume Features

Each additional volume can define:
- **`name`** - Volume identifier
- **`profile`** - Storage class
- **`capacity`** - Size in GB
- **`iops`** - Performance tuning
- **`encryption_key`** - Separate KMS key
- **`snapshot_crn`** - Restore from backup

### Snapshot Consistency Groups

The module supports **`snapshot_consistency_group_id`** for synchronized snapshots across multiple volumes.

**Why this matters:**
```
Volume-1 → Database files
Volume-2 → Transaction logs
Volume-3 → Application data
```

If snapshots are taken independently at different times, data inconsistency can corrupt applications during restoration. A consistency group ensures all volumes are captured together as one atomic state.

### Storage Architecture Summary

```
Boot Volume
  └── Operating system and machine state

Additional Block Volumes
  └── Persistent application storage

Storage Profiles
  └── Performance characteristics

IOPS Tuning
  └── Throughput and latency behavior

Encryption Settings
  └── Data confidentiality

Snapshots
  └── Backup and restoration capability
```

---

## Layer 5: Instance-Level Networking

The networking stage is where the VSI becomes reachable and capable of communicating with other systems. Until this point, the machine only exists as compute and storage. Networking gives it identity inside the VPC, enables communication with other machines, and optionally exposes it to the internet.

### Primary Network Interface

Every VSI must attach to at least one **network interface** (NIC). The primary network interface connects the VSI to a subnet inside the VPC. When attached, the subnet assigns the interface a **private IP address** from its CIDR range.

**What the subnet determines:**
- Which IP range the VSI belongs to
- Which availability zone the VSI resides in
- Which route tables apply
- Whether internet access exists through a public gateway
- Which ACL rules protect the subnet

### Reserved IPs

Normally, private IP addresses are dynamically assigned. The variable **`manage_reserved_ips`** solves the problem of IP persistence.

**When enabled:**
- Same IP persists across VSI recreations
- IP becomes an independent resource
- Prevents application/firewall rule breakage

The variable **`primary_vni_additional_ip_count`** allows multiple private IPs on the same network interface.

**Use cases:**
- Hosting multiple applications with different addresses
- Supporting failover configurations
- Running network appliances
- Handling IP-based licensing systems

### Floating IPs

By default, all addresses are private and only reachable within the VPC. To expose a VSI to the internet, use **`enable_floating_ip`**.

**Floating IP Concept:**
```
Internet Traffic
      ↓
Floating IP (Public)
      ↓
NAT Translation
      ↓
Private IP (VSI)
```

**Without floating IP:**
- VSI can communicate outward to internet (if public gateway exists)
- External systems cannot directly initiate connections

**With floating IP:**
- Users can SSH into the machine
- APIs become publicly accessible
- Web servers can serve internet traffic

### Advanced Networking Controls

| Variable | Purpose |
|----------|---------|
| `allow_ip_spoofing` | Allows VSI to send packets from non-assigned IPs (advanced use only) |
| `placement_group_id` | Influences VSI distribution across physical hosts |
| `enable_dedicated_host` | Reserves exclusive physical server for customer |
| `dedicated_host_id` | Specifies which dedicated host to use |

### Complete Networking Flow

```
VSI boots
    ↓
Attaches to subnet via network interface
    ↓
Subnet assigns private IP addresses
    ↓
Security groups and ACLs govern traffic
    ↓
Optional reserved IP management ensures persistence
    ↓
Optional additional IPs extend capabilities
    ↓
Optional floating IPs expose machine publicly
    ↓
Routing rules determine packet travel
    ↓
Placement rules determine physical location
```

---

## Layer 6: Security Groups

Security groups are one of the most important concepts in cloud networking because they control which traffic is allowed to enter or leave a VSI. A security group acts like a **virtual firewall** attached directly to the network interface of the VSI.

### Two Approaches

1. **Create new security group** - `create_security_group = true`
2. **Attach existing groups** - Use `security_group_ids`

> **Limit:** IBM Cloud allows a maximum of **5 security groups** per network interface.

### Traffic Direction

Every rule specifies either:

| Direction | Controls |
|-----------|----------|
| **inbound** | Traffic entering the VSI |
| **outbound** | Traffic leaving the VSI |

**Examples:**
- Allowing inbound TCP port 22 → Enables SSH access
- Allowing outbound HTTPS → Enables external API calls

### Protocols

The module supports:

- **TCP** - Reliable communication (SSH, HTTP, HTTPS, databases)
- **UDP** - Lightweight/real-time (DNS, streaming, VoIP)
- **ICMP** - Network diagnostics (ping)

### Port Ranges

For TCP and UDP, rules define port ranges using `port_min` and `port_max`.

**Common ports:**
```
22   → SSH
80   → HTTP
443  → HTTPS
5432 → PostgreSQL
3306 → MySQL
```

### Source Restrictions

The `source` field defines where traffic is allowed from:

- A specific IP
- A CIDR block
- Another security group
- All networks (0.0.0.0/0)

**Example isolation:**
```
Allow SSH only from office IPs
Allow web traffic from anywhere
Allow database access only from application servers
```

### Stateful Behavior

> **Critical Concept:** Security groups in IBM Cloud VPC are **stateful**. This means return traffic is automatically allowed.

**Example:**
```
User connects to port 443
    ↓
Security group allows inbound HTTPS
    ↓
Web server responds
    ↓
Response traffic automatically passes back (no explicit outbound rule needed)
```

### Validations

The module validates:
- ✓ Rule names are unique
- ✓ Directions are only inbound or outbound
- ✓ No duplicate security group IDs
- ✓ Maximum of five groups per interface

### Traffic Evaluation Process

```
Packet arrives at VSI network interface
         ↓
Attached security groups inspect packet
         ↓
Rules checked for matching:
  - Direction
  - Protocol
  - Port
  - Source
         ↓
If matching allow rule exists → Traffic proceeds
Otherwise → Packet dropped silently
```

The operating system never sees blocked traffic because filtering occurs at the cloud network layer before packets enter the virtual machine.

---

## Layer 7: Advanced Networking (Secondary Interfaces)

By default, a VSI is created with a single network interface attached to one subnet. However, advanced systems often require **traffic separation**. This is where secondary network interfaces become important.

### Multi-Homed Systems

A network interface is the networking attachment point between the VSI and a subnet. Each interface receives its own private IP address and participates independently in the VPC network.

**Conceptual example:**
```
Interface 1 → Public web traffic
Interface 2 → Internal database traffic
Interface 3 → Monitoring or backup traffic
```

### Configuration

The variable **`secondary_subnets`** defines additional interfaces. Each entry specifies a subnet where an additional interface should be attached.

> **Restriction:** Secondary subnets must exist in the **same availability zone** as the VSI.

### Benefits of Multiple Interfaces

- ✓ **Security** - Traffic isolation
- ✓ **Routing control** - Independent paths
- ✓ **Performance isolation** - Separate bandwidth
- ✓ **Administrative clarity** - Clear separation of concerns

### Real-World Example: Web Application Server

```
Frontend Interface
  └── Connects to subnet exposed to users/load balancers

Backend Interface
  └── Connects to private subnet where databases exist
  └── Never directly exposed publicly
```

This creates layered isolation. Even if attackers reach the frontend interface, they cannot directly access backend systems.

### Interface-Specific Security

Each secondary interface can have its own dedicated security groups through **`secondary_security_groups`**.

**Example policies:**
```
Frontend interface  → Allow HTTPS from internet
Backend interface   → Allow only database traffic from app servers
Monitoring interface → Allow traffic only from observability tools
```

The variable **`secondary_use_vsi_security_group`** controls whether the primary security group automatically applies to secondary interfaces.

### Secondary Floating IPs

Advanced workloads may require multiple externally reachable interfaces using **`secondary_floating_ips`**.

**Use cases:**
- One public IP for customer traffic
- Another public IP for partner APIs
- Another for administrative access

### IP Spoofing Control

The variable **`secondary_allow_ip_spoofing`** controls spoofing permissions on additional interfaces.

**When required:**
- Firewalls
- NAT gateways
- Virtual routers
- Packet inspection systems

> **Warning:** For normal application workloads, spoofing remains disabled because it weakens network trust boundaries.

### Operating System View

Inside the VSI, interfaces appear as separate network devices:

```
eth0 → Primary interface
eth1 → Secondary interface
eth2 → Another secondary interface
```

Each interface has:
- Its own IP address
- Its own subnet
- Its own routing behavior
- Its own security rules
- Its own optional floating IP

### Multi-Interface Packet Flow

```
Packet arrives on specific interface
         ↓
Security group attached to that interface evaluates it
         ↓
If allowed, operating system processes it
         ↓
OS routing table decides which interface sends responses
         ↓
Outgoing traffic exits through appropriate network path
```

---

## Layer 8: Load Balancer Integration

A load balancer is a networking component that sits in front of one or more VSIs and distributes incoming traffic across them. Instead of users connecting directly to individual servers, they connect to the load balancer, which then decides which VSI should handle the request.

### Architecture

```
        Users
          ↓
    Load Balancer
          ↓
    ┌─────┼─────┐
    ↓     ↓     ↓
  VSI-1 VSI-2 VSI-3
```

**Benefits:**
- ✓ Single stable endpoint
- ✓ Scalability
- ✓ Fault tolerance
- ✓ Centralized traffic management

### Load Balancer Types

| Type | Description |
|------|-------------|
| **Application Load Balancer (ALB)** | Understands HTTP/HTTPS, can inspect requests, makes smart routing decisions |
| **Network Load Balancer (NLB)** | Operates at TCP layer, forwards packets efficiently with lower overhead |

### Listener Configuration

A **listener** is the entry point where the load balancer waits for incoming traffic.

**Configuration:**
```
listener_protocol = https
listener_port = 443
```

This means:
- Load balancer accepts HTTPS traffic
- Clients connect on port 443

### Backend Pool

Once traffic enters the listener, the load balancer forwards it to backend VSIs through a **pool**. The pool contains registered VSI instances called **pool members**.

**Example:**
```
Load balancer listens on 443
Backend VSIs receive traffic on 8080
```

The load balancer acts as a translation layer between external traffic and internal application ports.

### Distribution Algorithms

The `algorithm` field controls which VSI receives the next request:

#### Round Robin
```
Request 1 → VSI-1
Request 2 → VSI-2
Request 3 → VSI-3
Request 4 → VSI-1 (cycle repeats)
```
Simple and works well when all servers are similar.

#### Weighted Round Robin
Some servers receive more traffic based on assigned weight. Useful when servers have different capacities.

#### Least Connections
Traffic goes to the server currently handling the fewest active connections. Useful for uneven workloads or long-lived sessions.

### Health Checks

A load balancer must know whether a VSI is healthy before sending traffic to it.

**Health check variables:**
- `health_delay` - Time between checks
- `health_timeout` - How long to wait for response
- `health_retries` - Failed attempts before marking unhealthy
- `health_type` - Check method (HTTP, TCP, etc.)

**Health check flow:**
```
VSI-2 crashes
    ↓
Health checks fail
    ↓
Load balancer stops sending traffic to VSI-2
    ↓
Users continue using VSI-1 and VSI-3
```

This is a core mechanism behind high availability systems.

### Protocol Configuration

The `protocol` field defines how traffic moves between load balancer and backend VSIs:

**Example setup:**
```
Internet → HTTPS → Load Balancer
Load Balancer → HTTP → VSI
```

In this setup:
- Encryption terminates at the load balancer
- Internal traffic remains unencrypted inside the VPC

### Connection Management

| Variable | Purpose |
|----------|---------|
| `connection_limit` | Maximum simultaneous client connections |
| `idle_connection_timeout` | How long inactive connections remain open |

### DNS Integration

Load balancers can integrate with DNS using the `dns` object.

**Example:**
```
app.company.com
      ↓
DNS Resolution
      ↓
Load Balancer IP
```

Users never need to know actual VSI IP addresses. DNS points to the load balancer endpoint, and the load balancer distributes traffic internally.

### Complete Traffic Flow

```
User sends request to application domain
         ↓
DNS resolves domain to load balancer IP
         ↓
Request reaches load balancer listener
         ↓
Load balancer checks backend health
         ↓
Distribution algorithm selects a VSI
         ↓
Request forwards to selected pool member
         ↓
VSI processes request and returns response
         ↓
Load balancer sends response back to user
```

---

## Layer 9: Observability & Monitoring

Observability is the ability to understand what is happening inside a running system without manually logging into it. Modern infrastructure embeds observability directly into the provisioning process.

> **Key Principle:** The VSI should become observable immediately from its first boot.

### Logging Agent

Enabled using **`install_logging_agent`**, the logging agent continuously collects logs from the VSI and sends them to an external logging platform.

#### Log Examples
```
Application started
User login successful
Database connection failed
Disk almost full
```

#### Logging Flow
```
VSI
 ↓
Logging Agent
 ↓
Cloud Logs Platform
```

#### Configuration Variables

| Variable | Purpose |
|----------|---------|
| `logging_target_host` | Ingestion endpoint of logging service |
| `logging_target_port` | Communication port (usually 443) |
| `logging_target_path` | API endpoint receiving logs |

#### Authentication Methods

**1. API Key Authentication**
```
logging_auth_mode = IAMAPIKey
logging_api_key = <key>
```
Agent authenticates using static API key.

**2. Trusted Profile Authentication**
```
logging_auth_mode = VSITrustedProfile
logging_trusted_profile_id = <profile>
```
VSI receives IAM identity automatically. More secure—no long-lived credentials stored on machine.

#### Additional Features

- **`logging_use_private_endpoint`** - Route traffic through private IBM Cloud networking
- **`logging_secure_access_enabled`** - Enhanced security controls
- **`logging_application_name`** - Metadata for log filtering
- **`logging_subsystem_name`** - Subsystem identification

### Monitoring Agent

Enabled using **`install_monitoring_agent`**, the monitoring agent continuously collects metrics.

#### What Monitoring Tracks

```
CPU utilization
Memory usage
Disk usage
Network throughput
Running processes
Security telemetry
```

#### Monitoring Flow
```
VSI
 ↓
Monitoring Agent
 ↓
Monitoring Collector
 ↓
Dashboards / Alerts
```

#### Configuration Variables

| Variable | Purpose |
|----------|---------|
| `monitoring_collector_endpoint` | Ingestion system receiving telemetry |
| `monitoring_collector_port` | Communication port |
| `monitoring_access_key` | Authorization for sending telemetry |
| `monitoring_tags` | Metadata for organizing metrics |

#### Monitoring Tags Example
```
env:prod
team:payments
region:us-south
```

### Continuous Operation

> **Important:** These agents run continuously in the background after installation. They are not one-time scripts.

**Runtime behavior:**
- Logging agents constantly tail log files
- Monitoring agents constantly collect metrics

### Complete Observability Flow

**Logging:**
```
Application writes logs locally
    ↓
Logging agent detects new log entries
    ↓
Logs enriched with metadata
    ↓
Agent authenticates with logging service
    ↓
Logs stream to centralized platform
```

**Monitoring:**
```
Monitoring agent reads system metrics
    ↓
Metrics aggregated periodically
    ↓
Agent authenticates with collector
    ↓
Telemetry transmits to monitoring backend
    ↓
Dashboards and alerts update
```

---

## Layer 10: Lifecycle Management & Recovery

The final stage focuses on consistency, recoverability, and predictability. The remaining concern is operational stability over time: ensuring resources keep recognizable names, volumes can be restored reliably, and environments can be recreated without manual rebuilding.

### Deterministic Naming

In cloud systems, resources are often created dynamically with auto-generated names. This creates operational problems because resource names may change between deployments.

**Default naming example:**
```
prod-vsi-7f3a-001
prod-vsi-7f3a-002
```

These names work but are not human-friendly.

#### Custom VSI Volume Names

The variable **`custom_vsi_volume_names`** allows deterministic naming with explicit control.

**Structured example:**
```
Subnet-A
  └── app-server-1
        ├── app-data-volume
        └── logs-volume
```

**Validations:**
- ✓ Volume counts must match configured storage volumes
- ✓ Volume names must be unique
- ✓ VSI names must remain globally unique
- ✓ Number of VSIs cannot exceed vsi_per_subnet

#### Static Boot Volume Names

The variable **`use_static_boot_volume_name`** forces boot volumes to follow a stable naming convention:

```
{hostname}_boot
```

This ensures the boot volume keeps the same recognizable identity even if the VSI is destroyed and recreated.

### Snapshots

A **snapshot** is a point-in-time copy of a disk volume. It freezes the exact state of the filesystem at a specific moment.

#### Snapshot Creation
```
OS installed
Applications configured
Database populated
    ↓
Create snapshot
```

That snapshot now contains:
- Operating system
- Installed packages
- Configurations
- Application files
- Data present at capture time

#### Boot Volume Snapshot Restoration

The variable **`boot_volume_snapshot_crn`** allows a new VSI boot volume to be created directly from a snapshot.

**Without snapshot restoration:**
```
Provision OS
    ↓
Install software
    ↓
Configure application
    ↓
Restore data
```

**With snapshot restoration:**
```
Restore snapshot
    ↓
Machine already configured
```

#### Use Cases

- ✓ Disaster recovery
- ✓ Environment cloning
- ✓ Backup restoration
- ✓ Rapid scaling
- ✓ Migration workflows

### Snapshot Consistency Groups

The variable **`snapshot_consistency_group_id`** extends snapshots to multiple volumes simultaneously.

**Why this matters:**
```
Volume-1 → Database files
Volume-2 → Transaction logs
Volume-3 → Application data
```

If snapshots are taken independently at different times, data inconsistency can corrupt applications during restoration.

**Consistency group solution:**
```
Freeze all volumes
    ↓
Capture snapshots simultaneously
    ↓
Restore together later
```

Now the restored environment preserves application consistency because every disk reflects the same exact point in time.

### Lifecycle Stability Summary

```
Deterministic names
  └── Operational continuity

Static boot volume names
  └── Recognizable storage identity

Snapshots
  └── Preserve machine and application state

Consistency groups
  └── Synchronize multi-volume recovery

Restoration workflows
  └── Recreate environments rapidly
```

> **Cloud-Native Principle:** Infrastructure should be reproducible. The entire environment—including naming, storage layout, and application state—can be recreated predictably through infrastructure definitions and snapshot restoration.

---

## Architecture Summary

### The Complete VSI

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

### Foundational Dependency Chain

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

### Terraform Mental Model

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

### Most Important Beginner Insight

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

## Visual Reference Models

### VSI Mental Memory Map

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

### Networking Mental Model

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

### Packet Flow Memory Model

**Inbound:**
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

**Outbound:**
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

### Storage Memory Model

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

### Security Memory Model

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

### Multi-Interface Architecture

```
                VSI
          ┌──────┼──────┐
          │      │      │
        eth0   eth1   eth2
          │      │      │
      frontend backend monitoring
       subnet   subnet   subnet
```

### Observability Flow

**Logging:**
```
Application Logs
      ↓
Logging Agent
      ↓
IBM Cloud Logs
      ↓
Search / Alerting
```

**Monitoring:**
```
CPU / RAM / Network
        ↓
Monitoring Agent
        ↓
Collector
        ↓
Dashboards / Alerts
```

### Recovery Architecture

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

### Reference Architecture (Production-Grade)

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

### Final Compression Model

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

---

## 📝 Knowledge Check: Test Your VSI Understanding

Test your knowledge of IBM Cloud VSI infrastructure with these questions, progressing from basic concepts to advanced scenarios.

---

### Easy Level Questions

??? question "1. What does VSI stand for?"
    - [ ] Virtual Storage Instance
    - [x] Virtual Server Instance
    - [ ] Virtual Security Instance
    - [ ] Virtual System Interface

    **Explanation:** VSI stands for Virtual Server Instance - a virtual machine running in IBM Cloud VPC.

??? question "2. What is the first layer in VSI provisioning?"
    - [ ] Network Foundation
    - [x] Resource Scoping & Ownership
    - [ ] Compute Instantiation
    - [ ] Storage Configuration

    **Explanation:** Resource scoping and ownership (resource_group_id, tags, prefix) comes first to establish administrative identity.

??? question "3. What must a VSI attach to in order to have network connectivity?"
    - [ ] A VPC
    - [x] A subnet
    - [ ] A security group
    - [ ] A floating IP

    **Explanation:** Every VSI must attach to at least one subnet via a network interface to have network connectivity.

??? question "4. How many boot sources can be used simultaneously for a VSI?"
    - [x] Only one (image_id, catalog_offering, or boot_volume_snapshot_crn)
    - [ ] Two
    - [ ] Three
    - [ ] As many as needed

    **Explanation:** The module enforces that only ONE boot source is used to ensure determinism and avoid conflicts.

??? question "5. What type of IP address does a VSI receive by default when attached to a subnet?"
    - [ ] Public IP
    - [x] Private IP
    - [ ] Floating IP
    - [ ] No IP address

    **Explanation:** By default, VSIs receive private IP addresses from the subnet's CIDR range.

---

### Medium Level Questions

??? question "6. What is the purpose of the `prefix` variable in VSI provisioning?"
    - [ ] To set the IP address prefix
    - [x] To establish consistent naming across all generated resources
    - [ ] To define the subnet prefix
    - [ ] To configure the boot volume prefix

    **Explanation:** The prefix becomes the naming foundation used throughout the module for all resources.

??? question "7. What does the `vsi_per_subnet` variable control?"
    - [ ] The number of subnets per VSI
    - [x] The number of VSI instances created in each subnet
    - [ ] The number of IPs per VSI
    - [ ] The number of volumes per VSI

    **Explanation:** `vsi_per_subnet` drives horizontal scaling by determining how many VSI instances are created in each provided subnet.

??? question "8. What is the purpose of `manage_reserved_ips`?"
    - [ ] To reserve more IP addresses
    - [x] To ensure the same private IP persists across VSI recreations
    - [ ] To manage public IPs
    - [ ] To allocate floating IPs

    **Explanation:** When enabled, reserved IPs ensure the same private IP persists across VSI recreations, preventing application/firewall rule breakage.

??? question "9. What is the maximum number of security groups that can be attached to a network interface?"
    - [ ] 3
    - [x] 5
    - [ ] 10
    - [ ] Unlimited

    **Explanation:** IBM Cloud allows a maximum of 5 security groups per network interface.

??? question "10. What does a Floating IP provide?"
    - [ ] Additional private IPs
    - [ ] Faster network speed
    - [x] Public internet accessibility to the VSI
    - [ ] Better security

    **Explanation:** A Floating IP exposes a VSI to the internet by providing a public IP address that NATs to the private IP.

??? question "11. What is the purpose of `snapshot_consistency_group_id`?"
    - [ ] To group similar snapshots
    - [x] To ensure synchronized snapshots across multiple volumes
    - [ ] To improve snapshot performance
    - [ ] To reduce snapshot costs

    **Explanation:** Consistency groups ensure all volumes are captured together as one atomic state, preventing data inconsistency.

??? question "12. What does `machine_type` determine?"
    - [ ] Only the CPU cores
    - [ ] Only the RAM
    - [x] CPU cores, RAM, and network throughput
    - [ ] Only the storage capacity

    **Explanation:** `machine_type` is a predefined hardware profile that determines CPU cores, RAM, and network throughput.

---

### Hard Level Questions

??? question "13. Why is the VSI provisioning flow described as 'strictly layered'?"
    - [ ] For better performance
    - [ ] To reduce costs
    - [x] Each layer depends on the previous layer and maps to specific API calls
    - [ ] To simplify the code

    **Explanation:** The flow is layered because each stage depends on the previous one, and each variable directly maps to specific API calls or resource configurations.

??? question "14. What happens if you enable both `enable_floating_ip` and use a public gateway?"
    - [ ] The VSI becomes inaccessible
    - [ ] Only one will work
    - [x] The VSI has both inbound (floating IP) and outbound (gateway) internet access
    - [ ] They conflict and cause errors

    **Explanation:** Floating IP provides inbound access, while public gateway provides outbound access. They can coexist for bidirectional internet connectivity.

??? question "15. What is the purpose of `primary_vni_additional_ip_count`?"
    - [ ] To add more network interfaces
    - [x] To assign multiple private IPs to the same network interface
    - [ ] To increase network bandwidth
    - [ ] To improve security

    **Explanation:** This variable allows multiple private IPs on the same network interface for hosting multiple applications, failover, or IP-based licensing.

??? question "16. Why would you use `placement_group_id`?"
    - [ ] To group VSIs logically
    - [x] To influence VSI distribution across physical hosts for availability or performance
    - [ ] To organize security groups
    - [ ] To manage IP addresses

    **Explanation:** Placement groups influence how VSIs are distributed across physical hosts, either for high availability (spread) or low latency (pack).

??? question "17. What is the difference between `create_security_group` and `security_group_ids`?"
    - [ ] They do the same thing
    - [x] First creates a new security group, second attaches existing ones
    - [ ] First is for inbound, second for outbound
    - [ ] First is faster than second

    **Explanation:** `create_security_group = true` creates a new security group, while `security_group_ids` attaches pre-existing security groups.

??? question "18. What problem does `allow_ip_spoofing` solve?**
    - [ ] Improves security
    - [ ] Increases network speed
    - [x] Allows VSI to send packets from non-assigned IP addresses (for advanced networking)
    - [ ] Prevents IP conflicts

    **Explanation:** IP spoofing allows a VSI to send packets with source IPs that aren't assigned to it, needed for advanced use cases like NAT appliances or load balancers.

??? question "19. What is the relationship between `vpc_id` and `subnets` in VSI provisioning?"
    - [ ] They are independent
    - [ ] vpc_id is optional if subnets are provided
    - [x] vpc_id anchors the VSI to a network, subnets determine exact placement and zones
    - [ ] They must match exactly

    **Explanation:** `vpc_id` selects the isolated virtual network, while `subnets` determine the exact network segments and availability zones where instances are placed.

??? question "20. Why can't you use multiple boot sources simultaneously?"
    - [ ] It's too expensive
    - [ ] It's too slow
    - [x] To ensure determinism - there must be exactly one source of truth for how the machine boots
    - [ ] IBM Cloud doesn't support it technically

    **Explanation:** The constraint ensures determinism by having exactly one source of truth for the boot process, avoiding conflicts or ambiguity.

---

### Expert Level Questions

??? question "21. A VSI needs to host 3 different applications, each requiring its own IP address. What's the solution?"
    - [ ] Create 3 separate VSIs
    - [ ] Use 3 floating IPs
    - [x] Use `primary_vni_additional_ip_count` to assign multiple private IPs
    - [ ] Create 3 subnets

    **Explanation:** `primary_vni_additional_ip_count` allows multiple private IPs on the same network interface, perfect for hosting multiple applications.

??? question "22. What happens if you don't specify `resource_group_id`?"
    - [ ] The VSI won't be created
    - [ ] It uses a random resource group
    - [x] Resources are created in the default resource group
    - [ ] It creates a new resource group automatically

    **Explanation:** If not specified, resources are created in the account's default resource group, but explicit specification is recommended for organization.

??? question "23. Why would you use `enable_dedicated_host` instead of shared infrastructure?"
    - [ ] It's cheaper
    - [ ] It's faster
    - [x] For compliance, isolation, or licensing requirements that need exclusive physical servers
    - [ ] It's easier to manage

    **Explanation:** Dedicated hosts provide exclusive physical servers for compliance requirements, enhanced isolation, or software licensing that requires dedicated hardware.

??? question "24. A database VSI has 3 volumes: database files, transaction logs, and application data. Why use a consistency group for snapshots?"
    - [ ] To save storage space
    - [ ] To speed up snapshots
    - [x] To ensure all volumes are captured at the same point in time, preventing data corruption
    - [ ] To reduce costs

    **Explanation:** Independent snapshots at different times can cause data inconsistency. Consistency groups capture all volumes atomically, ensuring data integrity during restoration.

??? question "25. What is the complete flow from VSI creation to internet accessibility?"
    - [ ] Create VSI → Add floating IP
    - [ ] Create VSI → Attach to VPC
    - [x] Resource scoping → Network foundation → Compute instantiation → Storage → Networking → Security groups → Optional floating IP
    - [ ] Create VSI → Configure security groups → Done

    **Explanation:** The complete flow is strictly layered: resource scoping defines ownership, VPC inputs define network placement, compute variables define the machine, storage attaches persistence, networking exposes the instance, security restricts traffic, and optional floating IPs provide public access.

---

### Scoring Guide

- **20-25 correct**: 🏆 **Expert** - You have mastered VSI infrastructure!
- **15-19 correct**: 🌟 **Advanced** - Strong understanding, review missed topics
- **10-14 correct**: 📚 **Intermediate** - Good foundation, continue learning
- **5-9 correct**: 🌱 **Beginner** - Review the material and try again
- **0-4 correct**: 📖 **Start Here** - Read through the guide carefully

---


**End of Document**
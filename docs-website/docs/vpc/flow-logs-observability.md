# 📡 Flow Logs and Observability — Deep Beginner Explanation

[← Previous: Load Balancer Architecture](./load-balancer-architecture.md) | [Index](./README.md) | [Next: Outputs and Downstream Consumption →](./outputs-downstream-consumption.md)

---

## 📋 Overview

One of the biggest beginner misconceptions in cloud networking is thinking that building infrastructure is enough.

It is not.

Enterprise environments must also:

- monitor traffic
- detect attacks
- troubleshoot failures
- investigate incidents
- prove compliance
- audit communication

Without visibility into network activity:

- security teams become blind
- troubleshooting becomes extremely difficult
- compliance audits fail
- attacks remain undetected

This is why observability is critical in cloud networking.

Flow logs are one of the most important observability mechanisms in IBM Cloud VPC networking.

---

## 👀 What Is Network Observability

Observability means:
> **understanding what is happening inside infrastructure**

In networking specifically, observability answers questions like:

- who communicated with whom
- which traffic was blocked
- which traffic was allowed
- where traffic originated
- what protocols were used
- whether suspicious traffic exists

Without observability:
> **network becomes invisible**

---

## 📮 Real World Analogy

Imagine a large office building.

Without CCTV cameras or entry logs:

- nobody knows who entered
- nobody knows which rooms accessed
- nobody knows suspicious activity

Flow logs act like:
> **network CCTV + access logs**

They record:

- traffic movement
- communication metadata
- allow/deny decisions

---

## 🧾 What Are Flow Logs

Flow logs capture:
> **metadata about network traffic**

### Important

Flow logs do NOT usually capture full packet content.

They capture:
> **traffic information about communication**

### Example Metadata

| Field | Meaning |
|-------|---------|
| Source IP | Who sent traffic |
| Destination IP | Who received traffic |
| Protocol | TCP/UDP/ICMP |
| Port | Communication port |
| Accepted/Rejected | Allowed or blocked |
| Interface | Which network interface used |
| Timestamp | When traffic occurred |

This is called:
> **network telemetry**

---

## ⚠️ Important Beginner Understanding

Flow logs are NOT:

- packet sniffers
- full payload captures
- Wireshark-level packet inspection

They are:
> **summarized traffic metadata records**

### Purpose

- scalable monitoring
- auditing
- threat detection

Capturing full packets at cloud scale would be:

- extremely expensive
- massive storage overhead
- performance heavy

Flow logs provide:
> **lightweight observability**

---

## ❓ What Problem Flow Logs Solve

Suppose:
> application cannot connect to database

Without logs:
> you guess blindly

### Possible Issues

- ACL blocking
- SG blocking
- routing failure
- wrong destination
- DNS problem

With flow logs:
> you can inspect traffic history

### Example

```text
10.0.2.15 → 10.0.3.10 TCP 5432
REJECTED
```

Now immediately visible:
> **database traffic blocked**

Flow logs dramatically improve troubleshooting.

---

## 🔧 What Terraform Creates

### Relevant Variables

```hcl
enable_flow_logs
COS bucket variables
collector definitions
```

Terraform creates:
> **flow log collectors**

### Example Terraform Resource

```hcl
ibm_is_flow_log
```

IBM internally:

- activates telemetry collection
- attaches collector to VPC/subnet/resources
- exports metadata records

---

## 🧲 What Is a Flow Log Collector

Flow Log Collector is:
> **IBM-managed telemetry collection service**

### Purpose

- monitor network traffic
- collect metadata
- export logs

### Conceptually

```text
Network Traffic
      ↓
Flow Log Collector
      ↓
Storage / Monitoring
```

Collector continuously observes:

- packet metadata
- traffic decisions
- network activity

---

## ⚙️ How Flow Logs Work Internally

IBM networking infrastructure continuously processes packets.

Flow log system observes:

- source/destination
- protocol
- traffic direction
- accept/reject state

When traffic flows:

```text
Packet
   ↓
Forwarding Decision
   ↓
Metadata Extracted
   ↓
Flow Log Record Created
```

This metadata is exported asynchronously.

Actual traffic forwarding continues normally.

---

## 🔄 Flow Log Pipeline

### 📊 Flow Log Data Flow Diagram (VSI → Flow Logs → COS)

```
┌─────────────────────────────────────────────────────────────────────┐
│              Flow Logs Data Collection Pipeline                      │
└─────────────────────────────────────────────────────────────────────┘

Step 1: Network Traffic Generation
┌─────────────────────────────────────────────────────────────────┐
│                        VPC Subnet                               │
│                                                                 │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐            │
│  │  Web VSI │─────▶│  App VSI │─────▶│  DB VSI  │            │
│  │10.0.1.10 │      │10.0.2.15 │      │10.0.3.20 │            │
│  └──────────┘      └──────────┘      └──────────┘            │
│       │                  │                  │                  │
│       │ Traffic Flow     │ Traffic Flow     │ Traffic Flow    │
│       ▼                  ▼                  ▼                  │
└───────┼──────────────────┼──────────────────┼──────────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
Step 2: IBM Networking Fabric (Packet Processing)
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │   IBM VPC Networking Infrastructure  │
        │                                      │
        │   • Packet Forwarding                │
        │   • ACL Evaluation                   │
        │   • Security Group Check             │
        │   • Routing Decision                 │
        │                                      │
        │   Metadata Extraction:               │
        │   ├─ Source IP: 10.0.2.15           │
        │   ├─ Dest IP: 10.0.3.20             │
        │   ├─ Protocol: TCP                   │
        │   ├─ Port: 5432                      │
        │   ├─ Action: ACCEPT                  │
        │   ├─ Bytes: 1024                     │
        │   └─ Timestamp: 2024-01-15T10:30:00 │
        └──────────────┬───────────────────────┘
                       │
Step 3: Flow Log Collector (Telemetry Aggregation)
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │     Flow Log Collector Service       │
        │                                      │
        │   • Aggregate metadata               │
        │   • Format log records               │
        │   • Buffer data                      │
        │   • Compress logs                    │
        │                                      │
        │   Log Record Created:                │
        │   {                                  │
        │     "src_ip": "10.0.2.15",          │
        │     "dst_ip": "10.0.3.20",          │
        │     "protocol": "TCP",               │
        │     "dst_port": 5432,                │
        │     "action": "ACCEPT",              │

### 📊 Flow Log Format Table (All Fields and Descriptions)

| Field Name | Type | Description | Example Value | Use Case |
|------------|------|-------------|---------------|----------|
| **version** | string | Flow log format version | "1.0.0" | Format compatibility |
| **account_id** | string | IBM Cloud account ID | "a1b2c3d4..." | Multi-tenant tracking |
| **vpc_id** | string | VPC identifier | "r006-abc123..." | VPC-level filtering |
| **vpc_name** | string | VPC name | "prod-vpc" | Human-readable identification |
| **subnet_id** | string | Subnet identifier | "r006-subnet123..." | Subnet-level analysis |
| **subnet_name** | string | Subnet name | "web-subnet-zone1" | Subnet identification |
| **instance_id** | string | VSI instance ID | "r006-vsi123..." | Instance-level tracking |
| **interface_id** | string | Network interface ID | "r006-nic123..." | Interface-specific logs |
| **src_ip** | string | Source IP address | "10.0.2.15" | Traffic origin |
| **dst_ip** | string | Destination IP address | "10.0.3.20" | Traffic destination |
| **src_port** | integer | Source port number | 52341 | Ephemeral port tracking |
| **dst_port** | integer | Destination port number | 5432 | Service identification |
| **protocol** | integer | IP protocol number | 6 (TCP), 17 (UDP) | Protocol type |
| **protocol_name** | string | Protocol name | "TCP", "UDP", "ICMP" | Human-readable protocol |
| **action** | string | Traffic action | "ACCEPT", "REJECT" | Allow/deny decision |
| **initiator_ip** | string | Connection initiator | "10.0.2.15" | Flow direction |
| **bytes** | integer | Total bytes transferred | 1024 | Bandwidth analysis |
| **packets** | integer | Total packets transferred | 8 | Packet count |
| **start_time** | timestamp | Flow start time | "2024-01-15T10:30:00Z" | Time range queries |
| **end_time** | timestamp | Flow end time | "2024-01-15T10:30:05Z" | Duration calculation |
| **capture_time** | timestamp | Log capture time | "2024-01-15T10:30:06Z" | Log processing time |
| **direction** | string | Traffic direction | "inbound", "outbound" | Directional analysis |
| **was_initiated** | boolean | Connection initiated | true, false | Flow origination |
| **was_terminated** | boolean | Connection terminated | true, false | Connection state |
| **tcp_flags** | integer | TCP flags bitmask | 18 (SYN+ACK) | TCP state analysis |
| **tos** | integer | Type of Service | 0 | QoS analysis |
| **region** | string | IBM Cloud region | "us-south" | Geographic tracking |
| **zone** | string | Availability zone | "us-south-1" | Zone-level analysis |

#### Common Protocol Numbers

| Protocol Number | Protocol Name | Common Use |
|----------------|---------------|------------|
| 1 | ICMP | Ping, network diagnostics |
| 6 | TCP | HTTP, HTTPS, SSH, databases |
| 17 | UDP | DNS, DHCP, streaming |
| 47 | GRE | VPN tunnels |
| 50 | ESP | IPsec encryption |

#### Action Field Values

| Action | Meaning | Cause |
|--------|---------|-------|
| **ACCEPT** | Traffic allowed | Passed ACL and Security Group rules |
| **REJECT** | Traffic blocked | Denied by ACL or Security Group |

#### TCP Flags (Bitmask)

| Flag | Bit | Meaning |
|------|-----|---------|
| FIN | 1 | Connection termination |
| SYN | 2 | Connection initiation |
| RST | 4 | Connection reset |
| PSH | 8 | Push data |
| ACK | 16 | Acknowledgment |
| URG | 32 | Urgent data |

> **Log Size:** Each flow log record is approximately 200-500 bytes. High-traffic environments can generate millions of records per hour.

        │     "bytes": 1024,                   │
        │     "packets": 8                     │
        │   }                                  │
        └──────────────┬───────────────────────┘
                       │
Step 4: Export to Cloud Object Storage
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │   IBM Cloud Object Storage (COS)     │
        │                                      │
        │   Bucket: vpc-flow-logs-bucket       │
        │                                      │
        │   Files:                             │
        │   ├─ 2024-01-15-10-00.json.gz       │
        │   ├─ 2024-01-15-11-00.json.gz       │
        │   ├─ 2024-01-15-12-00.json.gz       │
        │   └─ ...                             │
        │                                      │
        │   Retention: 90 days                 │
        │   Size: ~500GB/month                 │
        └──────────────┬───────────────────────┘
                       │
Step 5: Analysis & Monitoring
                       │
        ┌──────────────┴───────────────┐
        │                              │
        ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│  SIEM Platform  │          │  Log Analytics  │
│   (QRadar)      │          │   (LogDNA)      │
│                 │          │                 │
│ • Threat        │          │ • Troubleshoot  │
│   Detection     │          │ • Performance   │
│ • Compliance    │          │ • Audit         │
│ • Alerts        │          │ • Dashboards    │
└─────────────────┘          └─────────────────┘
```

> **Performance Impact:** Flow log collection is asynchronous and has minimal impact on actual network traffic performance (<1% overhead).

### Typical Architecture

```text
Network Traffic
      ↓
IBM Networking Fabric
      ↓
Flow Log Collector
      ↓
Cloud Object Storage
      ↓
SIEM / Monitoring Tools
```

---

## 🪣 Cloud Object Storage (COS)

Flow logs usually stored in:
> **IBM Cloud Object Storage**

### Why

Because flow logs generate:
> **huge data volumes**

### Example

Large enterprise may generate:
> **millions of flow records daily**

COS provides:

- scalable storage
- low cost archival
- long-term retention

---

## 📝 What Is Actually Logged

Suppose application server communicates with database.

### Traffic

```text
10.0.2.15 → 10.0.3.20 TCP 5432
```

Flow log entry may record:

- Timestamp
- Source IP
- Destination IP
- Protocol
- Port
- Bytes transferred
- Allowed/Rejected

This creates:
> **communication history**

---

## ✅ Accepted vs Rejected Traffic

One of the most useful fields.

### Accepted

Traffic successfully forwarded.

#### Example

```text
ACCEPT
10.0.2.15 → 10.0.3.20 TCP 5432
```

Means:
> database connection allowed

### Rejected

Traffic blocked.

#### Example

```text
REJECT
203.0.113.10 → 10.0.3.20 TCP 22
```

Means:
> SSH attempt blocked

This becomes extremely important for:

- attack detection
- troubleshooting
- compliance

---

## 🧭 Source IP and Destination IP

Flow logs identify:

- who initiated communication
- who received communication

### Example

**Source:**
```text
10.0.2.15
```

**Destination:**
```text
10.0.3.20
```

Security teams use this for:

- forensic analysis
- attack tracing
- workload mapping

---

## 📚 Protocol Information

Flow logs record:

- TCP
- UDP
- ICMP

### Purpose

Understand traffic type.

### Example

```text
TCP 443 → HTTPS
UDP 53 → DNS
ICMP → Ping
```

Useful for:

- traffic analysis
- application debugging

---

## 🛡️ Why Flow Logs Are Critical for Security

Suppose attacker compromises workload.

### Possible Malicious Activity

- scanning internal networks
- data exfiltration
- unusual outbound traffic
- lateral movement

Flow logs expose:
> **abnormal traffic behavior**

### Example

Server suddenly communicating with unknown external IPs.

Security teams investigate immediately.

---

## 🔍 Threat Analysis

Security analysts use flow logs to:

- identify suspicious traffic
- detect malware
- detect unauthorized access
- identify scanning behavior

### Example Suspicious Pattern

```text
Single IP scanning hundreds of ports
```

Flow logs reveal this behavior clearly.

---

## 🚨 Incident Response

Suppose security breach occurs.

First question:
> **Which systems communicated with attacker?**

Flow logs provide historical evidence.

### Example

```text
Compromised workload communicated with external IP for 3 days
```

Critical for:

- forensic investigation
- damage assessment
- containment planning

---

## 📑 Compliance Requirements

Enterprise regulations often require:

- network logging
- audit evidence
- communication tracking

### Examples

- FedRAMP
- PCI-DSS
- HIPAA
- FSCloud

Flow logs provide:
> **auditable traffic records**

Without logging:
> many compliance certifications fail

---

## 🧩 SCC Compliance

IBM Security and Compliance Center (SCC) uses observability heavily.

Flow logs help validate:

- network restrictions
- segmentation enforcement
- unauthorized communication detection

### Example

SCC may verify:
> **sensitive subnet not publicly reachable**

Flow logs provide evidence.

---

## 🛠️ Troubleshooting Use Cases

Suppose application timeout occurs.

Flow logs help determine:

- packet reached destination?
- traffic blocked?
- route exists?
- ACL rejected?
- SG rejected?

Without logs:
> network debugging becomes guesswork

---

## 🧪 Example Troubleshooting Scenario

### Problem

Application cannot access database.

### Flow Logs

```text
REJECT
10.0.2.15 → 10.0.3.20 TCP 5432
```

Immediately reveals:
> **traffic blocked**

Now engineer checks:

- ACL
- SG
- routing

Much faster troubleshooting.

---

## 📈 High-Volume Nature of Flow Logs

Large environments generate enormous traffic telemetry.

### Example

- Kubernetes clusters
- microservices
- service meshes

may generate:
> **millions of connections hourly**

Flow logging systems are designed for:

- scalability
- asynchronous processing
- efficient storage

---

## 🏗️ IBM Internal Flow Log Architecture

### Conceptually

```text
Packet Traverses Network
        ↓
Metadata Generated
        ↓

### 📊 Observability Architecture Diagram (Flow Logs + Monitoring Tools)

```
┌─────────────────────────────────────────────────────────────────────┐
│           Enterprise Observability Architecture                      │
└─────────────────────────────────────────────────────────────────────┘

Production VPC (10.0.0.0/16)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Application Workloads                       │  │
│  │                                                          │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │  │
│  │  │Web Tier │  │App Tier │  │DB Tier  │  │Cache    │   │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │  │
│  │       │            │            │            │         │  │
│  └───────┼────────────┼────────────┼────────────┼─────────┘  │
│          │            │            │            │            │
│          └────────────┴────────────┴────────────┘            │
│                       │                                       │
│          Network Traffic (All Layers)                        │
│                       │                                       │
└───────────────────────┼───────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │   Flow Log Collector (VPC-wide)   │
        │   • Capture all traffic metadata  │
        │   • 5-minute aggregation          │
        │   • Compress and export           │
        └───────────────┬───────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│              Cloud Object Storage (COS)                       │
│              Bucket: vpc-prod-flow-logs                       │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Flow Log Files (JSON/Parquet)                      │    │
│  │  • Hourly files: 2024-01-15-10-00.json.gz          │    │
│  │  • Retention: 90 days                               │    │
│  │  • Size: ~500GB/month                               │    │
│  │  • Lifecycle: Archive to Glacier after 30 days     │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────┬───────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌─────────────────────┐       ┌─────────────────────┐
│  Security Analytics │       │  Operations Tools   │
│      (SIEM)         │       │                     │
└─────────────────────┘       └─────────────────────┘
        │                               │
        ▼                               ▼
┌─────────────────────┐       ┌─────────────────────┐
│   IBM QRadar        │       │   IBM Log Analysis  │
│                     │       │   (LogDNA)          │
│ • Threat Detection  │       │                     │
│ • Anomaly Detection │       │ • Search & Filter   │
│ • Compliance        │       │ • Dashboards        │
│ • Incident Response │       │ • Troubleshooting   │
│                     │       │ • Performance       │
│ Alerts:             │       │                     │
│ ├─ Port Scanning    │       │ Views:              │
│ ├─ Data Exfiltration│       │ ├─ Top Talkers      │
│ ├─ Lateral Movement │       │ ├─ Rejected Traffic │
│ └─ Unusual Traffic  │       │ ├─ Protocol Dist.   │
└─────────────────────┘       │ └─ Bandwidth Usage  │
                              └─────────────────────┘
        │                               │
        ▼                               ▼
┌─────────────────────┐       ┌─────────────────────┐
│  Security Team      │       │  DevOps Team        │
│  Dashboard          │       │  Dashboard          │
│                     │       │                     │
│ • Real-time Alerts  │       │ • Traffic Patterns  │
│ • Threat Intel      │       │ • Connectivity      │
│ • Compliance Status │       │ • Performance       │
│ • Incident Queue    │       │ • Capacity Planning │
└─────────────────────┘       └─────────────────────┘

Additional Integrations:
────────────────────────
┌─────────────────────┐       ┌─────────────────────┐
│  IBM SCC            │       │  Custom Scripts     │
│  (Compliance)       │       │                     │
│                     │       │ • Python Analytics  │
│ • Policy Validation │       │ • Automated Reports │
│ • Audit Reports     │       │ • ML Anomaly Detect │
│ • Posture Mgmt      │       │ • Cost Analysis     │
└─────────────────────┘       └─────────────────────┘

Observability Layers:
─────────────────────
Layer 1: Network Flow Logs    → Traffic metadata
Layer 2: Application Logs      → Business logic
Layer 3: System Metrics        → Resource utilization
Layer 4: Distributed Tracing   → Request flows
Layer 5: Security Events       → Threat detection
```

> **Complete Observability:** Flow logs are one component of a comprehensive observability strategy. They provide network-level visibility that complements application logs, metrics, and traces.

Telemetry Pipeline
        ↓
Flow Log Collector
        ↓
Storage Export
```

IBM internally separates:

- packet forwarding
- observability collection

This minimizes:
> **networking performance impact**

---

## ⚖️ Flow Logs vs Application Logs

Very important distinction.

### Application Logs

```text
User login failed
Database query timeout
```

### Flow Logs

```text
10.0.2.15 → 10.0.3.20 TCP 5432 ACCEPT
```

Flow logs understand:
> **network communication**

Not:
> **application business logic**

---

## 📊 Flow Logs vs Monitoring Metrics

### Monitoring Metrics

- CPU
- memory
- latency

### Flow Logs

- traffic communication records

Different observability layers.

---

## 🏢 Enterprise Monitoring Pipeline

### Typical Architecture

```text
Network Traffic
      ↓
Flow Logs
      ↓
Cloud Object Storage
      ↓
SIEM Platform
      ↓
Security Dashboards / Alerts
```

### SIEM Examples

- QRadar
- Splunk
- Sentinel

---

## 🔧 Terraform Variables

Relevant variables:

```hcl
enable_flow_logs = true
```

Terraform then provisions:

- flow log collectors
- storage integrations
- telemetry export configuration

inside IBM Cloud infrastructure.

---

## 🏦 Real Enterprise Example

### Banking Environment

```text
Internet
 ↓
Load Balancer
 ↓
Web Tier
 ↓
App Tier
 ↓
Database Tier
```

Flow logs continuously record:

- internet requests
- app/database communication
- rejected attacks
- abnormal outbound traffic

Security teams analyze logs continuously.

---

## ☁️ Why Observability Is Essential in Cloud

Cloud environments are:

- distributed
- dynamic
- ephemeral

Servers appear/disappear rapidly.

Without observability:

- infrastructure becomes opaque
- failures difficult to trace
- attacks difficult to detect

Flow logs provide:
> **visibility into network behavior**

---

## 🧠 Complete Beginner Mental Model

Think of networking like a city road system.

| Real World | IBM Cloud |
|------------|-----------|
| Roads | Network Paths |
| Cars | Packets |
| CCTV Cameras | Flow Logs |
| Traffic Control Center | SIEM |
| Police Investigation | Incident Response |
| Security Audit Logs | Compliance Evidence |

Flow logs are essentially:
> **the surveillance and telemetry system of cloud networking**

They provide visibility into how traffic moves through the infrastructure.

---

[← Previous: Load Balancer Architecture](./load-balancer-architecture.md) | [Index](./README.md) | [Next: Outputs and Downstream Consumption →](./outputs-downstream-consumption.md)
# Layer 9: Observability & Monitoring

> Embedding logging and monitoring directly into VSI provisioning

---

## Overview

Observability is the ability to understand what is happening inside a running system without manually logging into it. Modern infrastructure embeds observability directly into the provisioning process.

> **Key Principle:** The VSI should become observable immediately from its first boot.

---

## Logging Agent

Enabled using **`install_logging_agent`**, the logging agent continuously collects logs from the VSI and sends them to an external logging platform.

### What Gets Logged

```
Application started
User login successful
Database connection failed
Disk almost full
Security event detected
```

### Logging Flow

```
VSI
 ↓
Logging Agent
 ↓
Cloud Logs Platform
```

---

## Logging Configuration

| Variable | Purpose |
|----------|---------|
| `logging_target_host` | Ingestion endpoint of logging service |
| `logging_target_port` | Communication port (usually 443) |
| `logging_target_path` | API endpoint receiving logs |

**Example:**
```hcl
install_logging_agent = true
logging_target_host   = "logs.us-south.logging.cloud.ibm.com"
logging_target_port   = 443
logging_target_path   = "/logs/ingest"
```

---

## Authentication Methods

### 1. API Key Authentication

```hcl
logging_auth_mode = "IAMAPIKey"
logging_api_key   = "<api-key>"
```

Agent authenticates using static API key.

**Characteristics:**
- Simple configuration
- Requires key management
- Key stored on VSI

### 2. Trusted Profile Authentication

```hcl
logging_auth_mode          = "VSITrustedProfile"
logging_trusted_profile_id = "<profile-id>"
```

VSI receives IAM identity automatically. More secure—no long-lived credentials stored on machine.

**Characteristics:**
- ✓ No credentials on VSI
- ✓ Automatic identity
- ✓ Better security posture
- ✓ Easier rotation

---

## Additional Logging Features

| Variable | Purpose |
|----------|---------|
| `logging_use_private_endpoint` | Route traffic through private IBM Cloud networking |
| `logging_secure_access_enabled` | Enhanced security controls |
| `logging_application_name` | Metadata for log filtering |
| `logging_subsystem_name` | Subsystem identification |

**Example:**
```hcl
logging_use_private_endpoint  = true
logging_secure_access_enabled = true
logging_application_name      = "web-app"
logging_subsystem_name        = "frontend"
```

---

## Monitoring Agent

Enabled using **`install_monitoring_agent`**, the monitoring agent continuously collects metrics.

### What Monitoring Tracks

```
CPU utilization
Memory usage
Disk usage
Network throughput
Running processes
Security telemetry
```

### Monitoring Flow

```
VSI
 ↓
Monitoring Agent
 ↓
Monitoring Collector
 ↓
Dashboards / Alerts
```

---

## Monitoring Configuration

| Variable | Purpose |
|----------|---------|
| `monitoring_collector_endpoint` | Ingestion system receiving telemetry |
| `monitoring_collector_port` | Communication port |
| `monitoring_access_key` | Authorization for sending telemetry |
| `monitoring_tags` | Metadata for organizing metrics |

**Example:**
```hcl
install_monitoring_agent      = true
monitoring_collector_endpoint = "ingest.us-south.monitoring.cloud.ibm.com"
monitoring_collector_port     = 6443
monitoring_access_key         = "<access-key>"
monitoring_tags               = ["env:prod", "team:platform", "region:us-south"]
```

---

## Monitoring Tags

Tags help organize and filter metrics:

**Example tags:**
```
env:prod
team:payments
region:us-south
app:web-server
```

**Benefits:**
- ✓ Filter metrics by environment
- ✓ Aggregate by team
- ✓ Alert on specific tags
- ✓ Cost allocation

---

## Continuous Operation

> **Important:** These agents run continuously in the background after installation. They are not one-time scripts.

**Runtime behavior:**
- Logging agents constantly tail log files
- Monitoring agents constantly collect metrics
- Both send data periodically to backend systems

---

## Complete Observability Flow

### Logging

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

### Monitoring

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

## Best Practices

### 1. Use Trusted Profiles

```
✓ Good: VSITrustedProfile authentication
✗ Bad: API keys stored on VSI
```

### 2. Private Endpoints

```
✓ Good: Use private endpoints for security
✗ Bad: Public endpoints for sensitive data
```

### 3. Meaningful Tags

```
✓ Good: env:prod, team:platform, app:web
✗ Bad: tag1, tag2, tag3
```

### 4. Application Context

```
✓ Good: Set application_name and subsystem_name
✗ Bad: Generic logging without context
```

---

## Common Patterns

### Pattern 1: Production Web Server

```hcl
# Logging
install_logging_agent         = true
logging_auth_mode             = "VSITrustedProfile"
logging_trusted_profile_id    = "profile-id"
logging_use_private_endpoint  = true
logging_application_name      = "web-app"
logging_subsystem_name        = "frontend"

# Monitoring
install_monitoring_agent      = true
monitoring_collector_endpoint = "ingest.us-south.monitoring.cloud.ibm.com"
monitoring_access_key         = "access-key"
monitoring_tags               = ["env:prod", "app:web", "tier:frontend"]
```

### Pattern 2: Database Server

```hcl
# Logging
install_logging_agent         = true
logging_auth_mode             = "VSITrustedProfile"
logging_trusted_profile_id    = "profile-id"
logging_application_name      = "database"
logging_subsystem_name        = "postgres"

# Monitoring
install_monitoring_agent      = true
monitoring_tags               = ["env:prod", "app:database", "type:postgres"]
```

### Pattern 3: Development Environment

```hcl
# Logging
install_logging_agent         = true
logging_auth_mode             = "IAMAPIKey"
logging_api_key               = "dev-api-key"
logging_application_name      = "dev-app"

# Monitoring
install_monitoring_agent      = true
monitoring_tags               = ["env:dev", "team:engineering"]
```

---

## Observability Architecture

```
┌─────────────────────────────────────┐
│              VSI                    │
│  ┌──────────┐      ┌──────────┐   │
│  │   App    │      │  System  │   │
│  │   Logs   │      │  Metrics │   │
│  └────┬─────┘      └────┬─────┘   │
│       │                 │          │
│  ┌────▼─────┐      ┌────▼─────┐   │
│  │ Logging  │      │Monitoring│   │
│  │  Agent   │      │  Agent   │   │
│  └────┬─────┘      └────┬─────┘   │
└───────┼──────────────────┼─────────┘
        │                  │
        ▼                  ▼
  ┌──────────┐      ┌──────────┐
  │  Cloud   │      │  Cloud   │
  │   Logs   │      │Monitoring│
  └──────────┘      └──────────┘
        │                  │
        ▼                  ▼
  ┌──────────┐      ┌──────────┐
  │  Search  │      │Dashboard │
  │  Alerts  │      │  Alerts  │
  └──────────┘      └──────────┘
```

---

## Next Layer

Once observability is configured, proceed to:

**[Layer 10: Lifecycle & Recovery →](vsi-lifecycle-recovery.md)**

---

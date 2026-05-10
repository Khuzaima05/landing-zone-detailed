# Layer 8: Load Balancer Integration

> Distributing traffic across multiple VSIs for scalability and high availability

---

## Overview

A load balancer is a networking component that sits in front of one or more VSIs and distributes incoming traffic across them. Instead of users connecting directly to individual servers, they connect to the load balancer, which then decides which VSI should handle the request.

---

## Architecture

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

---

## Load Balancer Types

| Type | Description |
|------|-------------|
| **Application Load Balancer (ALB)** | Understands HTTP/HTTPS, can inspect requests, makes smart routing decisions |
| **Network Load Balancer (NLB)** | Operates at TCP layer, forwards packets efficiently with lower overhead |

---

## Listener Configuration

A **listener** is the entry point where the load balancer waits for incoming traffic.

**Configuration:**
```hcl
load_balancer = {
  listener_protocol = "https"
  listener_port     = 443
}
```

This means:
- Load balancer accepts HTTPS traffic
- Clients connect on port 443

---

## Backend Pool

Once traffic enters the listener, the load balancer forwards it to backend VSIs through a **pool**. The pool contains registered VSI instances called **pool members**.

**Example:**
```
Load balancer listens on 443
Backend VSIs receive traffic on 8080
```

The load balancer acts as a translation layer between external traffic and internal application ports.

**Configuration:**
```hcl
load_balancer = {
  pool_member_port = 8080
}
```

---

## Distribution Algorithms

The `algorithm` field controls which VSI receives the next request:

### Round Robin

```
Request 1 → VSI-1
Request 2 → VSI-2
Request 3 → VSI-3
Request 4 → VSI-1 (cycle repeats)
```

Simple and works well when all servers are similar.

### Weighted Round Robin

Some servers receive more traffic based on assigned weight. Useful when servers have different capacities.

### Least Connections

Traffic goes to the server currently handling the fewest active connections. Useful for uneven workloads or long-lived sessions.

**Configuration:**
```hcl
load_balancer = {
  algorithm = "round_robin"  # or "weighted_round_robin", "least_connections"
}
```

---

## Health Checks

A load balancer must know whether a VSI is healthy before sending traffic to it.

### Health Check Variables

| Variable | Purpose |
|----------|---------|
| `health_delay` | Time between checks (seconds) |
| `health_timeout` | How long to wait for response (seconds) |
| `health_retries` | Failed attempts before marking unhealthy |
| `health_type` | Check method (HTTP, TCP, HTTPS) |

**Configuration:**
```hcl
load_balancer = {
  health_delay   = 10
  health_timeout = 5
  health_retries = 3
  health_type    = "http"
}
```

### Health Check Flow

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

---

## Protocol Configuration

The `protocol` field defines how traffic moves between load balancer and backend VSIs:

**Example setup:**
```
Internet → HTTPS → Load Balancer
Load Balancer → HTTP → VSI
```

In this setup:
- Encryption terminates at the load balancer
- Internal traffic remains unencrypted inside the VPC

**Configuration:**
```hcl
load_balancer = {
  listener_protocol = "https"
  protocol          = "http"
}
```

---

## Connection Management

| Variable | Purpose |
|----------|---------|
| `connection_limit` | Maximum simultaneous client connections |
| `idle_connection_timeout` | How long inactive connections remain open (seconds) |

**Configuration:**
```hcl
load_balancer = {
  connection_limit         = 1000
  idle_connection_timeout  = 60
}
```

---

## DNS Integration

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

**Configuration:**
```hcl
load_balancer = {
  dns = {
    instance_crn = "crn:..."
    zone_id      = "zone-id"
  }
}
```

---

## Complete Traffic Flow

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

## Best Practices

### 1. Use Health Checks

```
✓ Good: Configure appropriate health checks
✗ Bad: No health monitoring
```

### 2. Right-Size Connection Limits

```
✓ Good: Set limits based on expected traffic
✗ Bad: Unlimited connections
```

### 3. SSL Termination

```
✓ Good: Terminate SSL at load balancer
✗ Bad: End-to-end encryption (higher overhead)
```

### 4. Appropriate Algorithm

```
✓ Good: Least connections for variable workloads
✗ Bad: Round robin for long-lived connections
```

---

## Common Patterns

### Pattern 1: Web Application

```hcl
load_balancer = {
  listener_protocol       = "https"
  listener_port           = 443
  protocol                = "http"
  pool_member_port        = 8080
  algorithm               = "round_robin"
  health_type             = "http"
  health_delay            = 10
  health_timeout          = 5
  health_retries          = 3
  connection_limit        = 2000
  idle_connection_timeout = 60
}
```

### Pattern 2: API Gateway

```hcl
load_balancer = {
  listener_protocol       = "https"
  listener_port           = 443
  protocol                = "https"
  pool_member_port        = 443
  algorithm               = "least_connections"
  health_type             = "https"
  health_delay            = 5
  health_timeout          = 3
  health_retries          = 2
  connection_limit        = 5000
  idle_connection_timeout = 120
}
```

### Pattern 3: TCP Service

```hcl
load_balancer = {
  listener_protocol       = "tcp"
  listener_port           = 3306
  protocol                = "tcp"
  pool_member_port        = 3306
  algorithm               = "least_connections"
  health_type             = "tcp"
  health_delay            = 10
  health_timeout          = 5
  health_retries          = 3
}
```

---

## High Availability Architecture

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
     │ Zone 1  │                 │ Zone 2  │
     └─────────┘                 └─────────┘
```

---

## Next Layer

Once load balancer integration is configured, proceed to:

**[Layer 9: Observability & Monitoring →](vsi-observability.md)**

---

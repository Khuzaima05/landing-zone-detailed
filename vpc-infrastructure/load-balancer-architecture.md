# ⚖️ Load Balancer Architecture — Overview

[← Previous: Floating IP Architecture](./12-floating-ip-architecture.md) | [Index](./README.md) | [Next: Flow Logs and Observability →](./14-flow-logs-observability.md)

---

> 📌 **NOTE**: Load Balancers are managed through a **separate IBM Cloud module** and are not directly part of the terraform-ibm-landing-zone-vpc module. This document provides a high-level overview of how Load Balancers integrate with VPC networking.

---

## 📋 Overview

Load Balancers are critical infrastructure components that distribute traffic across multiple backend servers, providing scalability, high availability, and fault tolerance for applications.

### Key Concepts

**What Load Balancers Do:**
- Distribute incoming traffic across multiple servers
- Perform health checks on backend servers
- Remove failed servers from rotation automatically
- Provide high availability for applications
- Enable horizontal scaling

**Why They Matter:**
- Single servers cannot handle large traffic volumes
- Applications need fault tolerance
- Scaling requires traffic distribution
- Public exposure should be controlled

---

## 🔗 VPC Integration Points

### Network Placement

Load Balancers exist within VPC networking:

```
Internet/Internal Clients
         ↓
Load Balancer (in VPC subnet)
         ↓
Backend Servers (in VPC subnets)
```

### VPC Resources Used

| Resource | Purpose |
|----------|---------|
| **Subnets** | Load balancer frontend placement |
| **Security Groups** | Control traffic to/from load balancer |
| **Network ACLs** | Subnet-level filtering |
| **Private IPs** | Backend server addressing |

---

## 🌐 Public vs Private Load Balancers

### Public Load Balancer

**Purpose:** Internet-facing applications

```
Internet
   ↓
Public Load Balancer
   ↓
Private Application Servers
```

**Use Cases:**
- Web applications
- Public APIs
- Customer-facing services

### Private Load Balancer

**Purpose:** Internal applications

```
Internal Applications
   ↓
Private Load Balancer
   ↓
Internal Services
```

**Use Cases:**
- Microservices
- Internal APIs
- Database clusters
- Kubernetes ingress

---

## 🏗️ Architecture Patterns

### Multi-Tier Architecture

```
Internet
   ↓
Public Load Balancer
   ↓
Web Tier
   ↓
Private Load Balancer
   ↓
Application Tier
   ↓
Database Tier
```

### Benefits

- ✅ Scalability through horizontal scaling
- ✅ High availability through redundancy
- ✅ Fault tolerance through health checks
- ✅ Security through private backends
- ✅ Simplified public exposure

---

## 🔐 Security Integration

### Security Groups

Load balancers use Security Groups for traffic control:

**Frontend Security Group:**
```
Allow: HTTPS from internet
Deny: All other traffic
```

**Backend Security Group:**
```
Allow: Traffic only from load balancer SG
Deny: Direct internet access
```

### Network ACLs

Subnet-level filtering applies to load balancer traffic:
- Inbound rules for client traffic
- Outbound rules for backend communication

---

## 🩺 Health Checks

Load balancers continuously monitor backend health:

**Health Check Process:**
```
Load Balancer
   ↓
Periodic health check (e.g., GET /health)
   ↓
Backend Server Response
   ↓
Healthy: Keep in pool
Unhealthy: Remove from pool
```

**Why Critical:**
- Automatic failover
- No manual intervention needed
- Improved application availability

---

## ☸️ Kubernetes/OpenShift Integration

Load balancers are essential for Kubernetes:

```
Internet
   ↓
IBM Load Balancer
   ↓
OpenShift Ingress Controllers
   ↓
Application Pods
```

**Use Cases:**
- Ingress traffic
- Service exposure
- API endpoints

---

## 🆚 Load Balancer vs Floating IP

| Feature | Load Balancer | Floating IP |
|---------|---------------|-------------|
| **Scope** | Multiple backends | Single server |
| **HA** | Built-in | Manual |
| **Health Checks** | Automatic | None |
| **Scaling** | Easy | Difficult |
| **Enterprise Use** | Preferred | Limited |

**Recommendation:** Use Load Balancers for production applications instead of Floating IPs.

---

## 🔧 VPC Module Integration

### How VPC Module Supports Load Balancers

The terraform-ibm-landing-zone-vpc module creates the networking foundation:

**VPC Module Provides:**
- Subnets for load balancer placement
- Security groups for traffic control
- Network ACLs for subnet filtering
- Route tables for traffic flow

**Separate Load Balancer Module Handles:**
- Load balancer creation
- Listener configuration
- Backend pool management
- Health check setup

### Typical Workflow

```
1. VPC Module: Create networking foundation
2. Load Balancer Module: Deploy load balancers
3. Application Module: Deploy backend servers
4. Integration: Connect components
```

---

## 💡 Best Practices

### 1. Use Load Balancers for Production

```
✅ Load Balancer → Multiple servers
❌ Floating IP → Single server
```

### 2. Implement Health Checks

```
Configure appropriate health check endpoints
Set reasonable timeout values
Monitor health check status
```

### 3. Secure Backend Servers

```
Keep backends private
Use Security Groups to restrict access
Only allow traffic from load balancer
```

### 4. Plan for Scaling

```
Design for horizontal scaling
Use auto-scaling groups
Monitor capacity
```

### 5. Multi-Zone Deployment

```
Deploy backends across zones
Improve availability
Handle zone failures
```

---

## 🏢 Enterprise Pattern

### Typical Architecture

```
                Transit Gateway
                       |
        +--------------+--------------+
        |                             |
Management VPC              Production VPC
    |                              |
Bastion Host              Public Load Balancer
                                   |
                          +--------+--------+
                          |                 |
                      Web Tier         Web Tier
                     (Zone 1)         (Zone 2)
                          |                 |
                  Private Load Balancer
                          |
                  +-------+-------+
                  |               |
              App Tier        App Tier
             (Zone 1)        (Zone 2)
```

---

## 🔑 Key Takeaways

### 1. Load Balancers Are Separate Infrastructure

Not part of VPC module, but integrate with VPC networking.

### 2. Essential for Production

Provide HA, scaling, and fault tolerance.

### 3. Security Through Isolation

Keep backends private, expose only load balancer.

### 4. VPC Provides Foundation

Subnets, security groups, and routing enable load balancers.

### 5. Plan Architecture Early

Design multi-tier architecture from the start.

---

## 📚 Related Resources

- **IBM Cloud Load Balancer Documentation**: Detailed configuration guide
- **VPC Security Groups**: Traffic control for load balancers
- **Network ACLs**: Subnet-level filtering
- **Multi-Zone Architecture**: High availability patterns

---

[← Previous: Floating IP Architecture](./12-floating-ip-architecture.md) | [Index](./README.md) | [Next: Flow Logs and Observability →](./14-flow-logs-observability.md)
# 🌐 Floating IP Architecture — Overview

[← Previous: Transit Gateway Integration](./11-transit-gateway-integration.md) | [Index](./README.md) | [Next: Load Balancer Architecture →](./13-load-balancer-architecture.md)

---

> 📌 **NOTE**: Floating IPs are **workload-specific resources** typically managed at the application/compute layer, not directly by the VPC module. This document provides a high-level overview of how Floating IPs relate to VPC networking.

---

## 📋 Overview

By default, workloads in IBM Cloud VPC are private and not accessible from the public internet. Floating IPs provide a mechanism to map public internet-routable IP addresses to private workload interfaces.

### Key Concepts

**What Floating IPs Do:**
- Map public IP addresses to private network interfaces
- Enable inbound internet connectivity to workloads
- Provide direct public exposure for specific servers

**Why They Exist:**
- Some workloads require direct internet access (e.g., bastion hosts)
- Public services need internet-routable addresses
- Edge appliances need public connectivity

---

## 🎯 What Is a Floating IP

A Floating IP is:
> **A public internet-routable IP address dynamically mapped to a private network interface**

### Important Understanding

```
Public Internet
       ↓
Floating IP (169.48.x.x)
       ↓
Private VSI Interface (10.0.2.15)
```

**The workload still uses its private IP internally.** The Floating IP acts as a public front-end mapping.

---

## 🔗 VPC Relationship

### How Floating IPs Integrate with VPC

**VPC Provides:**
- Private network interfaces (NICs)
- Security groups for traffic control
- Network ACLs for subnet filtering
- Private IP addressing

**Floating IP Adds:**
- Public IP mapping
- Internet reachability
- Inbound connectivity

### Attachment Point

Floating IPs attach to:
> **Network Interface Cards (NICs)**

NOT to:
- Subnets
- VPCs
- Security Groups

---

## 🆚 Floating IP vs Public Gateway

| Feature | Floating IP | Public Gateway |
|---------|-------------|----------------|
| **Direction** | Inbound + Outbound | Outbound only |
| **Scope** | Single interface | Entire subnet |
| **Use Case** | Direct server access | Internet access for private servers |
| **Security Risk** | High | Lower |

**Key Difference:**
- **Public Gateway**: Workloads remain private, can access internet
- **Floating IP**: Workloads become publicly accessible

---

## 🛡️ Common Use Cases

### 1. Bastion Hosts

**Most common use case:**

```
Admin Laptop
     ↓
Internet
     ↓
Bastion Floating IP
     ↓
Bastion Host
     ↓
Private Internal Servers
```

**Purpose:**
- Secure administrative access
- Jump server for internal resources
- Minimizes public exposure

### 2. Edge Appliances

```
Internet
   ↓
Firewall/VPN Appliance (Floating IP)
   ↓
Internal Network
```

**Examples:**
- VPN gateways
- Firewall appliances
- Reverse proxies

### 3. Public Services (Not Recommended)

```
Internet
   ↓
Web Server (Floating IP)
```

**Note:** Load Balancers are preferred for production applications.

---

## ⚠️ Security Considerations

### Major Security Risk

Floating IPs dramatically increase attack surface:

**Without Floating IP:**
```
Workload is private and invisible to internet
```

**With Floating IP:**
```
Workload is publicly accessible
Internet attackers can directly target server
```

### Required Security Measures

**1. Restrictive Security Groups**
```
Allow only required ports
Restrict source IP ranges when possible
```

**2. Network ACLs**
```
Subnet-level filtering
Defense in depth
```

**3. Hardened OS**
```
Minimal services
Security patches
Strong authentication
```

**4. Monitoring**
```
Flow logs enabled
Security monitoring
Intrusion detection
```

---

## 🏢 Enterprise Best Practices

### 1. Minimize Floating IP Usage

```
✅ Use Load Balancers for applications
✅ Use bastion hosts for admin access
❌ Avoid direct server exposure
```

### 2. Bastion-Only Pattern

```
Internet
   ↓
Bastion (only Floating IP)
   ↓
All other servers private
```

### 3. Security Group Restrictions

```
Allow SSH only from corporate IP ranges
Not from entire internet (0.0.0.0/0)
```

### 4. Audit Floating IP Usage

```
Regularly review Floating IP assignments
Remove unnecessary public exposure
Document justification for each Floating IP
```

---

## 🆚 Floating IP vs Load Balancer

| Aspect | Floating IP | Load Balancer |
|--------|-------------|---------------|
| **Backends** | Single server | Multiple servers |
| **HA** | None | Built-in |
| **Health Checks** | None | Automatic |
| **Scaling** | Manual | Easy |
| **Security** | Direct exposure | Controlled entry |
| **Enterprise Use** | Limited | Preferred |

**Recommendation:** Use Load Balancers for production applications instead of Floating IPs.

---

## 🔧 VPC Module Integration

### VPC Module Role

The terraform-ibm-landing-zone-vpc module creates the networking foundation:

**VPC Module Provides:**
- Network interfaces for workloads
- Security groups for traffic control
- Network ACLs for subnet filtering
- Private IP addressing

**Workload/Compute Modules Handle:**
- Floating IP allocation
- Floating IP attachment to NICs
- Public IP management

### Typical Workflow

```
1. VPC Module: Create networking foundation
2. Compute Module: Deploy workloads
3. Compute Module: Attach Floating IPs (if needed)
4. Security: Configure restrictive rules
```

---

## 💡 Key Takeaways

### 1. Floating IPs Are Workload-Specific

Not part of core VPC infrastructure, managed at compute layer.

### 2. Minimize Public Exposure

Use sparingly, only when absolutely necessary.

### 3. Prefer Load Balancers

For production applications, use Load Balancers instead.

### 4. Bastion Pattern Is Common

Single bastion host with Floating IP, all else private.

### 5. Security Is Critical

Restrictive Security Groups and ACLs are mandatory.

---

## 🏗️ Enterprise Architecture Pattern

### Recommended Design

```
Internet
   ↓
Bastion Host (Floating IP)
   ↓
Management VPC
   ↓
Transit Gateway
   ↓
Production VPC (all private)
   ↓
Load Balancer (public)
   ↓
Application Servers (private)
```

**Key Points:**
- Only bastion has Floating IP
- Production workloads use Load Balancer
- Internal servers remain private
- Minimal attack surface

---

## 📚 Related Resources

- **Security Groups**: Essential for Floating IP security
- **Network ACLs**: Subnet-level protection
- **Load Balancers**: Preferred alternative for applications
- **Bastion Hosts**: Secure administrative access patterns

---

[← Previous: Transit Gateway Integration](./11-transit-gateway-integration.md) | [Index](./README.md) | [Next: Load Balancer Architecture →](./13-load-balancer-architecture.md)
# Layer 6: Security Groups

> Virtual firewall rules controlling VSI traffic

---

## Overview

Security groups are one of the most important concepts in cloud networking because they control which traffic is allowed to enter or leave a VSI. A security group acts like a **virtual firewall** attached directly to the network interface of the VSI.

---

## Two Approaches

1. **Create new security group** - `create_security_group = true`
2. **Attach existing groups** - Use `security_group_ids`

> **Limit:** IBM Cloud allows a maximum of **5 security groups** per network interface.

---

## Traffic Direction

Every rule specifies either:

| Direction | Controls |
|-----------|----------|
| **inbound** | Traffic entering the VSI |
| **outbound** | Traffic leaving the VSI |

**Examples:**
- Allowing inbound TCP port 22 → Enables SSH access
- Allowing outbound HTTPS → Enables external API calls

---

## Protocols

The module supports:

- **TCP** - Reliable communication (SSH, HTTP, HTTPS, databases)
- **UDP** - Lightweight/real-time (DNS, streaming, VoIP)
- **ICMP** - Network diagnostics (ping)

---

## Port Ranges

For TCP and UDP, rules define port ranges using `port_min` and `port_max`.

**Common ports:**
```
22   → SSH
80   → HTTP
443  → HTTPS
5432 → PostgreSQL
3306 → MySQL
```

**Example rule:**
```hcl
{
  name      = "allow-ssh"
  direction = "inbound"
  protocol  = "tcp"
  port_min  = 22
  port_max  = 22
  source    = "0.0.0.0/0"
}
```

---

## Source Restrictions

The `source` field defines where traffic is allowed from:

- A specific IP: `192.168.1.100`
- A CIDR block: `10.0.0.0/8`
- Another security group: `sg-abc123`
- All networks: `0.0.0.0/0`

**Example isolation:**
```
Allow SSH only from office IPs: 203.0.113.0/24
Allow web traffic from anywhere: 0.0.0.0/0
Allow database access only from app servers: sg-app-servers
```

---

## Stateful Behavior

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

---

## Creating Security Groups

### Option 1: Create New Group

```hcl
create_security_group = true

security_group_rules = [
  {
    name      = "allow-ssh"
    direction = "inbound"
    protocol  = "tcp"
    port_min  = 22
    port_max  = 22
    source    = "0.0.0.0/0"
  },
  {
    name      = "allow-https"
    direction = "inbound"
    protocol  = "tcp"
    port_min  = 443
    port_max  = 443
    source    = "0.0.0.0/0"
  },
  {
    name      = "allow-all-outbound"
    direction = "outbound"
    protocol  = "all"
    source    = "0.0.0.0/0"
  }
]
```

### Option 2: Use Existing Groups

```hcl
create_security_group = false

security_group_ids = [
  "r006-sg-web-servers",
  "r006-sg-monitoring"
]
```

---

## Validations

The module validates:

- ✓ Rule names are unique
- ✓ Directions are only inbound or outbound
- ✓ No duplicate security group IDs
- ✓ Maximum of five groups per interface

---

## Traffic Evaluation Process

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

## Best Practices

### 1. Principle of Least Privilege

```
✓ Good: Only allow necessary ports
✗ Bad: Allow all traffic (0.0.0.0/0 on all ports)
```

### 2. Specific Source Restrictions

```
✓ Good: SSH from office IP only (203.0.113.0/24)
✗ Bad: SSH from anywhere (0.0.0.0/0)
```

### 3. Descriptive Rule Names

```
✓ Good: "allow-https-from-load-balancer"
✗ Bad: "rule-1"
```

### 4. Separate Groups by Function

```
✓ Good: web-sg, db-sg, monitoring-sg
✗ Bad: One group for everything
```

### 5. Document Rules

```
✓ Good: Comment why each rule exists
✗ Bad: Unexplained rules
```

---

## Common Patterns

### Pattern 1: Web Server

```hcl
security_group_rules = [
  {
    name      = "allow-http"
    direction = "inbound"
    protocol  = "tcp"
    port_min  = 80
    port_max  = 80
    source    = "0.0.0.0/0"
  },
  {
    name      = "allow-https"
    direction = "inbound"
    protocol  = "tcp"
    port_min  = 443
    port_max  = 443
    source    = "0.0.0.0/0"
  },
  {
    name      = "allow-ssh-admin"
    direction = "inbound"
    protocol  = "tcp"
    port_min  = 22
    port_max  = 22
    source    = "203.0.113.0/24"  # Office IP
  }
]
```

### Pattern 2: Database Server

```hcl
security_group_rules = [
  {
    name      = "allow-postgres-from-app"
    direction = "inbound"
    protocol  = "tcp"
    port_min  = 5432
    port_max  = 5432
    source    = "sg-app-servers"  # Only from app servers
  },
  {
    name      = "allow-ssh-admin"
    direction = "inbound"
    protocol  = "tcp"
    port_min  = 22
    port_max  = 22
    source    = "10.0.0.0/8"  # Internal only
  }
]
```

### Pattern 3: Application Server

```hcl
security_group_rules = [
  {
    name      = "allow-app-from-lb"
    direction = "inbound"
    protocol  = "tcp"
    port_min  = 8080
    port_max  = 8080
    source    = "sg-load-balancer"
  },
  {
    name      = "allow-all-outbound"
    direction = "outbound"
    protocol  = "all"
    source    = "0.0.0.0/0"
  }
]
```

---

## Security Layers

Security groups are one layer in a defense-in-depth strategy:

```
ACL (Subnet level)
    ↓
Security Group (Instance level)
    ↓
OS Firewall (iptables/firewalld)
    ↓
Application Auth
```

Each layer provides additional protection.

---

## Next Layer

Once security groups are configured, proceed to:

**[Layer 7: Secondary Interfaces →](vsi-secondary-interfaces.md)**

---

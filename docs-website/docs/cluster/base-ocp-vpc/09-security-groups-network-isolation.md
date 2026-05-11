# Security Groups and Network Isolation

## Introduction

Security groups are virtual firewalls that control network traffic to and from your OpenShift cluster nodes. Proper security group configuration is essential for protecting your cluster while allowing necessary communication. This chapter explains security groups, network isolation strategies, and best practices for securing your OpenShift cluster on IBM Cloud VPC.

## Security Group Fundamentals

### What Are Security Groups?

**Security groups** are stateful firewalls that control inbound and outbound traffic at the network interface level.

**Key Characteristics**:
- **Stateful**: Return traffic automatically allowed
- **Instance-Level**: Applied to network interfaces
- **Rule-Based**: Allow or deny based on rules
- **Default Deny**: Traffic denied unless explicitly allowed

**Think of it as**: A bouncer at a club who checks a list of who's allowed in and out.

### Security Groups vs Network ACLs

**Security Groups**:
```
Level: Network interface (instance)
State: Stateful
Rules: Allow only
Default: Deny all
Return Traffic: Automatic
```

**Network ACLs**:
```
Level: Subnet
State: Stateless
Rules: Allow and deny
Default: Allow all
Return Traffic: Must be explicit
```

**When to Use Each**:
- **Security Groups**: Primary defense, instance-level control
- **Network ACLs**: Additional layer, subnet-level control

## Default Security Group Configuration

### IBM Cloud Default Rules

When you create an OpenShift cluster, IBM Cloud automatically creates security groups with rules for cluster operation.

**Control Plane Security Group**:
```
Inbound Rules:
- Allow TCP 6443 from worker nodes (API server)
- Allow TCP 2379-2380 from control plane (etcd)
- Allow TCP 10250-10259 from all nodes (kubelet, scheduler)
- Allow ICMP from VPC (health checks)

Outbound Rules:
- Allow all traffic (default)
```

**Worker Node Security Group**:
```
Inbound Rules:
- Allow TCP 10250 from control plane (kubelet)
- Allow TCP 30000-32767 from load balancers (NodePort)
- Allow all from same security group (pod-to-pod)
- Allow ICMP from VPC (health checks)

Outbound Rules:
- Allow all traffic (default)
```

**Load Balancer Security Group**:
```
Inbound Rules:
- Allow TCP 80 from internet (HTTP)
- Allow TCP 443 from internet (HTTPS)
- Allow health check ports

Outbound Rules:
- Allow TCP to worker nodes (backend)
```

### Why These Rules Exist

**API Server Access (6443)**:
- Workers need to communicate with control plane
- kubectl/oc commands go through API server
- Operators and controllers need API access

**etcd Communication (2379-2380)**:
- Control plane nodes form etcd cluster
- Requires peer-to-peer communication
- Critical for cluster state

**Kubelet Port (10250)**:
- Control plane manages worker nodes
- Logs and exec commands
- Metrics collection

**NodePort Range (30000-32767)**:
- Services exposed via NodePort
- Load balancers connect to NodePorts
- External access to applications

## Custom Security Group Configuration

### Restricting API Server Access

**Problem**: Default allows API access from all worker nodes
**Solution**: Restrict to specific sources

**Example: Private API Only**:
```
Remove: Allow TCP 6443 from 0.0.0.0/0
Add: Allow TCP 6443 from VPC CIDR (10.0.0.0/16)
Add: Allow TCP 6443 from VPN gateway IP
```

**Benefits**:
- API not accessible from internet
- Only VPC and VPN can access
- Improved security posture

**Considerations**:
- Need VPN for remote access
- CI/CD must be in VPC or use VPN
- More complex setup

### Restricting Worker Node Access

**Problem**: Workers accept traffic from anywhere in VPC
**Solution**: Limit to necessary sources

**Example: Strict Worker Rules**:
```
Remove: Allow all from VPC
Add: Allow TCP 10250 from control plane IPs
Add: Allow TCP 30000-32767 from load balancer IPs
Add: Allow all from worker security group (pod-to-pod)
```

**Benefits**:
- Reduced attack surface
- Clear traffic patterns
- Better compliance

**Considerations**:
- Must update when adding load balancers
- More maintenance overhead
- Requires careful planning

### Application-Specific Rules

**Example: Database Access**:
```
Scenario: PostgreSQL database in cluster
Requirement: Only backend pods should access

Solution:
1. Create dedicated worker pool for database
2. Apply custom security group
3. Allow TCP 5432 only from backend worker IPs
4. Deny all other traffic to port 5432
```

**Example: External API Access**:
```
Scenario: Application calls external API
Requirement: Only specific workers need internet

Solution:
1. Create worker pool for external-facing apps
2. Attach public gateway to subnet
3. Allow outbound HTTPS (443) to specific IPs
4. Other workers have no internet access
```

## Network Isolation Strategies

### Strategy 1: Zone-Based Isolation

**Approach**: Separate security groups per zone

```
Zone 1 Security Group:
- Allow traffic from Zone 1 workers
- Allow traffic from control plane
- Deny cross-zone worker traffic

Zone 2 Security Group:
- Allow traffic from Zone 2 workers
- Allow traffic from control plane
- Deny cross-zone worker traffic

Zone 3 Security Group:
- Allow traffic from Zone 3 workers
- Allow traffic from control plane
- Deny cross-zone worker traffic
```

**Use Cases**:
- Data locality requirements
- Compliance needs
- Cost optimization (avoid cross-zone traffic)

**Considerations**:
- Breaks pod-to-pod communication across zones
- Requires careful application design
- May impact high availability

### Strategy 2: Workload-Based Isolation

**Approach**: Different security groups for different workload types

```
Frontend Security Group:
- Allow TCP 80, 443 from load balancer
- Allow TCP 8080 from frontend pods
- Deny access to backend ports

Backend Security Group:
- Allow TCP 8080 from frontend security group
- Allow TCP 5432 to database security group
- Deny direct external access

Database Security Group:
- Allow TCP 5432 from backend security group
- Deny all other traffic
- No internet access
```

**Use Cases**:
- Multi-tier applications
- Microservices architecture
- Defense in depth

**Benefits**:
- Clear security boundaries
- Principle of least privilege
- Easier to audit

### Strategy 3: Environment-Based Isolation

**Approach**: Separate security groups for different environments

```
Production Security Group:
- Strict rules
- Minimal access
- Audited changes

Development Security Group:
- Relaxed rules
- Broader access
- Faster iteration
```

**Use Cases**:
- Multiple environments in same cluster
- Different security requirements
- Compliance separation

**Implementation**:
- Use different worker pools
- Apply appropriate security groups
- Use namespaces for logical separation

## Security Group Best Practices

### 1. Principle of Least Privilege

**Rule**: Only allow necessary traffic

```
Bad:
- Allow all traffic from VPC
- Allow all ports from internet
- Allow all outbound traffic

Good:
- Allow specific ports from specific sources
- Allow only required protocols
- Restrict outbound to necessary destinations
```

### 2. Use Descriptive Names

```
Good:
- ocp-prod-control-plane-sg
- ocp-prod-workers-frontend-sg
- ocp-prod-workers-backend-sg

Bad:
- sg-1
- security-group
- default
```

### 3. Document Rules

```
Rule: Allow TCP 6443 from 10.0.0.0/16
Purpose: API server access from VPC
Added: 2024-01-15
Owner: Platform Team
```

### 4. Regular Audits

**Monthly Review**:
- Check for unused rules
- Verify rule necessity
- Update documentation
- Remove obsolete rules

**Audit Questions**:
- Is this rule still needed?
- Can it be more restrictive?
- Is it properly documented?
- Does it follow best practices?

### 5. Test Changes

**Before Production**:
1. Test in development environment
2. Verify application functionality
3. Check for unintended blocks
4. Document expected behavior

**Rollback Plan**:
- Keep previous configuration
- Document rollback steps
- Test rollback procedure
- Have emergency contacts

## Common Security Group Patterns

### Pattern 1: Public-Facing Application

```
Internet → Load Balancer → Frontend Workers → Backend Workers → Database

Load Balancer SG:
- Inbound: TCP 80, 443 from 0.0.0.0/0
- Outbound: TCP 30000-32767 to frontend workers

Frontend Worker SG:
- Inbound: TCP 30000-32767 from load balancer
- Outbound: TCP 8080 to backend workers

Backend Worker SG:
- Inbound: TCP 8080 from frontend workers
- Outbound: TCP 5432 to database workers

Database Worker SG:
- Inbound: TCP 5432 from backend workers
- Outbound: None (no external access)
```

### Pattern 2: Internal-Only Application

```
VPN → API Server → Workers → Database

API Server SG:
- Inbound: TCP 6443 from VPN IP
- Outbound: TCP 10250 to workers

Worker SG:
- Inbound: TCP 10250 from control plane
- Inbound: All from same SG (pod-to-pod)
- Outbound: TCP 5432 to database

Database SG:
- Inbound: TCP 5432 from worker SG
- Outbound: None
```

### Pattern 3: Hybrid Application

```
Internet → Public Apps
VPN → Private Apps
Both → Shared Services

Public Worker SG:
- Inbound: TCP 80, 443 from internet
- Outbound: TCP 8080 to shared services

Private Worker SG:
- Inbound: TCP 8080 from VPN
- Outbound: TCP 8080 to shared services

Shared Services SG:
- Inbound: TCP 8080 from public and private SGs
- Outbound: As needed
```

## Troubleshooting Security Group Issues

### Common Problems

**Problem**: Can't access API server
**Check**:
```bash
# Verify security group rules
ibmcloud is security-group <sg-id>

# Check if your IP is allowed
# Look for rule allowing TCP 6443 from your IP

# Test connectivity
curl -k https://<api-server>:6443/healthz
```

**Problem**: Pods can't communicate
**Check**:
```bash
# Verify pod-to-pod rules
# Should allow all traffic from same security group

# Test from pod
oc run -it --rm debug --image=busybox --restart=Never -- \
  wget -O- http://<service-name>

# Check network policies
oc get networkpolicies
```

**Problem**: Load balancer can't reach workers
**Check**:
```bash
# Verify NodePort range is allowed
# Should allow TCP 30000-32767 from load balancer

# Check service NodePort
oc get svc <service-name> -o yaml | grep nodePort

# Test from load balancer subnet
```

### Diagnostic Commands

```bash
# List security groups
ibmcloud is security-groups

# View security group details
ibmcloud is security-group <sg-id>

# List security group rules
ibmcloud is security-group-rules <sg-id>

# View network interface security groups
ibmcloud is instance-network-interface <instance-id> <nic-id>
```

## Advanced Security Group Features

### Security Group Tagging

**Purpose**: Organize and manage security groups

```
Tags:
- environment:production
- application:ecommerce
- managed-by:terraform
- cost-center:engineering
```

**Benefits**:
- Easy filtering and searching
- Cost allocation
- Automation
- Compliance tracking

### Security Group Logging

**Flow Logs**:
- Capture traffic allowed/denied by security groups
- Analyze traffic patterns
- Detect anomalies
- Troubleshoot issues

**Configuration**:
```
Enable flow logs for VPC
Filter by security group
Store in Cloud Object Storage
Analyze with Log Analysis
```

### Dynamic Security Groups

**Concept**: Security groups that adapt to changes

**Example with Terraform**:
```hcl
# Automatically allow traffic from all worker nodes
resource "ibm_is_security_group_rule" "allow_workers" {
  for_each = toset(var.worker_ips)
  
  group     = ibm_is_security_group.control_plane.id
  direction = "inbound"
  remote    = each.value
  tcp {
    port_min = 6443
    port_max = 6443
  }
}
```

## Integration with Network Policies

### Layered Security

**Security Groups** (VPC level):
- Coarse-grained control
- Instance-level
- Managed outside cluster

**Network Policies** (Kubernetes level):
- Fine-grained control
- Pod-level
- Managed within cluster

**Combined Approach**:
```
Layer 1 (Security Groups):
- Allow traffic between worker nodes
- Allow traffic from load balancers
- Block everything else

Layer 2 (Network Policies):
- Allow frontend to backend
- Allow backend to database
- Deny all other pod-to-pod traffic
```

**Benefits**:
- Defense in depth
- Multiple security layers
- Flexibility
- Better compliance

## Key Takeaways

✅ Security groups are stateful firewalls
✅ Default rules allow necessary cluster communication
✅ Custom rules enable fine-grained control
✅ Multiple isolation strategies available
✅ Regular audits ensure security
✅ Combine with network policies for defense in depth

## Next Steps

Learn about:
- KMS encryption for data at rest
- Cloud Object Storage for registry
- Cluster endpoint configuration

---

**Navigation**: [← Back: Operating System Selection](08-operating-system-selection.md) | [Next: KMS Encryption →](10-kms-encryption.md)
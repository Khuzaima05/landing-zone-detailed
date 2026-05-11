# Cluster Endpoints

## Introduction

Cluster endpoints control how users and applications access the OpenShift API server and cluster services. Choosing between public and private endpoints affects security, accessibility, and network architecture. This chapter explains endpoint types, configuration options, and best practices for securing cluster access.

## Understanding Cluster Endpoints

### What Are Cluster Endpoints?

**Cluster endpoints** are network addresses used to access the OpenShift API server:

**API Server Endpoint**:
- URL for kubectl/oc commands
- Used by CI/CD pipelines
- Required for cluster management
- Format: `https://api.<cluster-name>.<region>.containers.appdomain.cloud:6443`

**Service Endpoints**:
- URLs for accessing cluster services
- Application ingress routes
- Load balancer endpoints
- Internal service discovery

### Endpoint Types

**Public Endpoint**:
```
Access: From internet
URL: Public DNS name
IP: Public IP address
Security: Requires strong authentication
Use: Remote access, CI/CD
```

**Private Endpoint**:
```
Access: From VPC or VPN only
URL: Private DNS name
IP: Private IP address
Security: Network-level isolation
Use: Internal access, enhanced security
```

**Both Endpoints**:
```
Access: Public and private
Flexibility: Maximum
Security: Configurable
Use: Hybrid scenarios
```

## Public Endpoints

### Characteristics

**Accessibility**:
- Accessible from anywhere on internet
- No VPN required
- Easy for remote teams
- Simple CI/CD integration

**Security Considerations**:
- Exposed to internet
- Requires strong authentication
- Subject to attacks
- Needs IP allowlisting

**Use Cases**:
- Development clusters
- Remote team access
- Public-facing applications
- CI/CD from external services

### Configuration

**Enable Public Endpoint**:
```
During cluster creation:
- Select "Public endpoint"
- Optionally add IP allowlist
- Configure authentication

Result:
- Public DNS name assigned
- Load balancer created
- API accessible from internet
```

**IP Allowlisting**:
```
Purpose: Restrict access to specific IPs
Configuration:
- Add allowed IP ranges
- Block all other IPs
- Update as needed

Example:
- Office IP: 203.0.113.0/24
- VPN IP: 198.51.100.0/24
- CI/CD IP: 192.0.2.0/24
```

### Security Best Practices

**1. Use Strong Authentication**:
```
- Multi-factor authentication
- Short-lived tokens
- Regular credential rotation
- Audit access logs
```

**2. Implement IP Allowlisting**:
```
- Restrict to known IPs
- Update regularly
- Document changes
- Monitor violations
```

**3. Enable Audit Logging**:
```
- Log all API access
- Monitor for anomalies
- Alert on suspicious activity
- Retain logs for compliance
```

**4. Use TLS/SSL**:
```
- Always use HTTPS
- Verify certificates
- Use strong cipher suites
- Disable weak protocols
```

## Private Endpoints

### Characteristics

**Accessibility**:
- Only from VPC or connected networks
- Requires VPN for remote access
- Not exposed to internet
- Enhanced security

**Security Benefits**:
- Network-level isolation
- Reduced attack surface
- No internet exposure
- Better compliance posture

**Use Cases**:
- Production clusters
- Sensitive workloads
- Compliance requirements
- Internal-only access

### Configuration

**Enable Private Endpoint**:
```
During cluster creation:
- Select "Private endpoint"
- Configure VPC access
- Set up VPN if needed

Result:
- Private DNS name assigned
- Internal load balancer created
- API accessible only from VPC
```

**VPN Setup for Remote Access**:
```
Options:
1. Site-to-Site VPN
2. Client VPN
3. Direct Link

Configuration:
- Create VPN gateway
- Configure routing
- Set up authentication
- Test connectivity
```

### Access Patterns

**From Within VPC**:
```
Source: VPC resources
Access: Direct
Authentication: IAM or certificates
Use: Applications, operators
```

**From Corporate Network**:
```
Source: Office network
Access: Via VPN
Authentication: VPN + IAM
Use: Administrators, developers
```

**From Remote Users**:
```
Source: Individual users
Access: Via client VPN
Authentication: VPN + IAM
Use: Remote administration
```

## Hybrid Configuration (Both Endpoints)

### When to Use Both

**Scenarios**:
- Gradual migration to private-only
- Different access needs
- Flexibility during transition
- Mixed team locations

**Configuration**:
```
Enable both endpoints:
- Public for external CI/CD
- Private for internal access
- Different security policies
- Separate monitoring
```

### Access Control Strategy

**Public Endpoint**:
```
Use: External CI/CD, remote developers
Security: IP allowlist, strong auth
Monitoring: Enhanced logging
Restrictions: Limited permissions
```

**Private Endpoint**:
```
Use: Production access, operators
Security: VPC isolation
Monitoring: Standard logging
Permissions: Full access
```

## Service Endpoints

### Ingress Routes

**Public Routes**:
```
Purpose: Expose applications to internet
Configuration:
- Create Route resource
- Specify hostname
- Configure TLS
- Map to service

Example:
myapp.apps.<cluster-name>.<region>.containers.appdomain.cloud
```

**Private Routes**:
```
Purpose: Internal-only applications
Configuration:
- Use private ingress controller
- Internal DNS
- VPC-only access
- No internet exposure
```

### Load Balancer Services

**Public Load Balancer**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-public
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
```

**Private Load Balancer**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-private
  annotations:
    service.kubernetes.io/ibm-load-balancer-cloud-provider-ip-type: "private"
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
```

## DNS Configuration

### Cluster DNS

**Public DNS**:
```
Format: api.<cluster-name>.<region>.containers.appdomain.cloud
Managed by: IBM Cloud
Resolution: Public DNS servers
TTL: Configurable
```

**Private DNS**:
```
Format: api.private.<cluster-name>.<region>.containers.appdomain.cloud
Managed by: IBM Cloud
Resolution: VPC DNS
TTL: Configurable
```

### Custom Domains

**Public Custom Domain**:
```
Steps:
1. Register domain
2. Create DNS record (CNAME or A)
3. Point to cluster ingress
4. Configure TLS certificate
5. Create route with custom hostname
```

**Private Custom Domain**:
```
Steps:
1. Configure private DNS zone
2. Create DNS record
3. Point to private ingress
4. Configure TLS certificate
5. Create route with custom hostname
```

## Network Architecture Patterns

### Pattern 1: Public-Only

```
Internet → Public Endpoint → API Server
Internet → Public Ingress → Applications

Use Case: Development, public applications
Security: IP allowlist, strong auth
Cost: Lower (no VPN)
```

### Pattern 2: Private-Only

```
VPN → Private Endpoint → API Server
VPN → Private Ingress → Applications

Use Case: Production, sensitive data
Security: Network isolation
Cost: Higher (VPN required)
```

### Pattern 3: Hybrid

```
Internet → Public Endpoint → API Server (limited)
VPN → Private Endpoint → API Server (full access)
Internet → Public Ingress → Public apps
VPN → Private Ingress → Internal apps

Use Case: Mixed requirements
Security: Layered approach
Cost: Medium
```

## Monitoring and Troubleshooting

### Checking Endpoint Status

```bash
# View cluster endpoints
ibmcloud oc cluster get --cluster <cluster-name> | grep Endpoint

# Test public endpoint
curl -k https://api.<cluster-name>.<region>.containers.appdomain.cloud:6443/healthz

# Test private endpoint (from VPC)
curl -k https://api.private.<cluster-name>.<region>.containers.appdomain.cloud:6443/healthz

# Check DNS resolution
nslookup api.<cluster-name>.<region>.containers.appdomain.cloud
```

### Common Issues

**Problem**: Cannot access API server
**Solutions**:
```
1. Check endpoint type (public/private)
2. Verify network connectivity
3. Check IP allowlist
4. Verify VPN connection
5. Check security groups
6. Verify DNS resolution
```

**Problem**: Slow API response
**Solutions**:
```
1. Check network latency
2. Verify load balancer health
3. Check control plane status
4. Review API server logs
5. Monitor resource usage
```

## Security Considerations

### Defense in Depth

**Layer 1: Network**:
```
- Private endpoints
- VPN access
- Security groups
- Network ACLs
```

**Layer 2: Authentication**:
```
- IAM integration
- Certificate-based auth
- Service accounts
- Token expiration
```

**Layer 3: Authorization**:
```
- RBAC policies
- Namespace isolation
- Resource quotas
- Pod security policies
```

**Layer 4: Audit**:
```
- API audit logs
- Access monitoring
- Anomaly detection
- Compliance reporting
```

### Compliance Requirements

**HIPAA**:
```
Requirement: Private endpoints mandatory
Implementation: Disable public endpoint
Monitoring: Enhanced audit logging
```

**PCI-DSS**:
```
Requirement: Network segmentation
Implementation: Private endpoints + VPN
Monitoring: Access logging
```

**SOC 2**:
```
Requirement: Access controls
Implementation: Private endpoints preferred
Monitoring: Audit trails
```

## Migration Scenarios

### Public to Private

**Planning**:
```
1. Assess current access patterns
2. Set up VPN infrastructure
3. Test private endpoint access
4. Update CI/CD pipelines
5. Communicate changes to team
```

**Migration Steps**:
```
1. Enable private endpoint
2. Configure VPN access
3. Update kubeconfig files
4. Test all integrations
5. Disable public endpoint
6. Verify functionality
```

### Private to Hybrid

**Use Case**: Need external CI/CD access

**Implementation**:
```
1. Enable public endpoint
2. Configure IP allowlist
3. Set up separate credentials
4. Limit public endpoint permissions
5. Monitor both endpoints
```

## Best Practices

### Security

✅ Use private endpoints for production
✅ Implement IP allowlisting for public endpoints
✅ Enable audit logging
✅ Use strong authentication
✅ Regular security reviews
✅ Monitor access patterns

### Operations

✅ Document endpoint configuration
✅ Test failover scenarios
✅ Monitor endpoint health
✅ Keep DNS records updated
✅ Maintain VPN infrastructure
✅ Regular connectivity tests

### Cost Optimization

✅ Use private endpoints to avoid VPN costs (if internal only)
✅ Consolidate VPN connections
✅ Monitor data transfer costs
✅ Optimize routing

## Key Takeaways

✅ Private endpoints provide better security
✅ Public endpoints offer easier access
✅ Hybrid configuration provides flexibility
✅ VPN required for remote access to private endpoints
✅ IP allowlisting essential for public endpoints
✅ Choose based on security requirements

## Next Steps

Learn about:
- Add-ons and extensions
- Autoscaling configuration
- Load balancer and VPE security

---

**Navigation**: [← Back: COS Registry Storage](11-cos-registry-storage.md) | [Next: Add-ons and Extensions →](13-addons-extensions.md)
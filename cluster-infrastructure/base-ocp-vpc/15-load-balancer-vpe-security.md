# Load Balancer and VPE Security

## Introduction

Load balancers and Virtual Private Endpoints (VPEs) are critical components for securely exposing and accessing OpenShift services. Understanding how to configure them properly ensures both accessibility and security. This chapter covers load balancer types, VPE configuration, and security best practices.

## Load Balancer Types

### Application Load Balancer (ALB)

**Characteristics**:
- Layer 7 (HTTP/HTTPS)
- Content-based routing
- SSL/TLS termination
- WebSocket support
- Path and host-based routing

**Use Cases**:
- Web applications
- REST APIs
- Microservices
- Multi-tenant applications

### Network Load Balancer (NLB)

**Characteristics**:
- Layer 4 (TCP/UDP)
- High performance
- Low latency
- Preserves source IP
- Protocol agnostic

**Use Cases**:
- Non-HTTP protocols
- High-throughput applications
- Gaming servers
- Database connections

## Load Balancer Configuration

### Public Load Balancer

**Service Configuration**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-public
  annotations:
    service.kubernetes.io/ibm-load-balancer-cloud-provider-ip-type: "public"
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: https
    port: 443
    targetPort: 8443
```

**Features**:
- Internet-accessible
- Public IP address
- External DNS
- Higher security risk

### Private Load Balancer

**Service Configuration**:
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
  - name: http
    port: 80
    targetPort: 8080
```

**Features**:
- VPC-only access
- Private IP address
- Internal DNS
- Enhanced security

## Virtual Private Endpoints (VPE)

### What Are VPEs?

**VPEs** provide private connectivity to IBM Cloud services without traversing the public internet.

**Benefits**:
- Private network access
- No public internet exposure
- Lower latency
- No egress charges
- Enhanced security

### VPE for IBM Cloud Services

**Supported Services**:
- Cloud Object Storage
- Key Protect
- Hyper Protect Crypto Services
- Secrets Manager
- Container Registry

**Configuration**:
```
1. Create VPE gateway
2. Select service
3. Choose subnets
4. Configure security groups
5. Update service endpoints
```

### VPE Security Groups

**Recommended Rules**:
```
Inbound:
- Allow HTTPS (443) from VPC CIDR
- Allow specific service ports
- Deny all other traffic

Outbound:
- Allow to service endpoints
- Deny all other traffic
```

## Security Best Practices

### Load Balancer Security

**1. Use Private Load Balancers**:
```
When: Internal applications
Benefit: No internet exposure
Implementation: Set annotation to "private"
```

**2. Implement SSL/TLS**:
```
Minimum: TLS 1.2
Recommended: TLS 1.3
Certificates: Valid, trusted CAs
Cipher Suites: Strong only
```

**3. Configure Health Checks**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  annotations:
    service.kubernetes.io/ibm-load-balancer-cloud-provider-health-check-path: "/health"
    service.kubernetes.io/ibm-load-balancer-cloud-provider-health-check-port: "8080"
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
```

**4. Restrict Source IPs**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  type: LoadBalancer
  loadBalancerSourceRanges:
  - 203.0.113.0/24
  - 198.51.100.0/24
```

### VPE Security

**1. Use Dedicated Security Groups**:
```
Create: VPE-specific security group
Rules: Minimal required access
Monitor: Access patterns
Audit: Regular reviews
```

**2. Implement Network Segmentation**:
```
Separate: VPE subnets from workload subnets
Isolate: Different services
Control: Traffic flow
Monitor: Cross-subnet traffic
```

**3. Enable Logging**:
```
Flow Logs: VPE traffic
Activity Tracker: Service access
Monitoring: Anomaly detection
Alerts: Suspicious activity
```

## Ingress Configuration

### OpenShift Router

**Default Ingress Controller**:
```yaml
apiVersion: operator.openshift.io/v1
kind: IngressController
metadata:
  name: default
  namespace: openshift-ingress-operator
spec:
  replicas: 2
  endpointPublishingStrategy:
    type: LoadBalancerService
    loadBalancer:
      scope: External
```

**Private Ingress Controller**:
```yaml
apiVersion: operator.openshift.io/v1
kind: IngressController
metadata:
  name: private
  namespace: openshift-ingress-operator
spec:
  replicas: 2
  domain: private.apps.example.com
  endpointPublishingStrategy:
    type: LoadBalancerService
    loadBalancer:
      scope: Internal
```

### Route Configuration

**Public Route**:
```yaml
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: myapp-public
spec:
  host: myapp.apps.example.com
  to:
    kind: Service
    name: myapp
  port:
    targetPort: 8080
  tls:
    termination: edge
    insecureEdgeTerminationPolicy: Redirect
```

**Private Route**:
```yaml
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: myapp-private
  labels:
    router: private
spec:
  host: myapp.private.apps.example.com
  to:
    kind: Service
    name: myapp
  port:
    targetPort: 8080
  tls:
    termination: edge
```

## SSL/TLS Configuration

### Certificate Management

**Let's Encrypt**:
```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: myapp-cert
spec:
  secretName: myapp-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - myapp.example.com
```

**Custom Certificates**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: custom-tls
type: kubernetes.io/tls
data:
  tls.crt: <base64-encoded-cert>
  tls.key: <base64-encoded-key>
```

### TLS Termination

**Edge Termination**:
```
TLS: Terminated at router
Backend: HTTP
Use: Most common
```

**Passthrough Termination**:
```
TLS: Terminated at pod
Backend: HTTPS
Use: End-to-end encryption
```

**Re-encryption**:
```
TLS: Terminated at router, re-encrypted to pod
Backend: HTTPS
Use: Enhanced security
```

## Monitoring and Troubleshooting

### Load Balancer Health

**Check Status**:
```bash
# View services
oc get svc

# Check load balancer
ibmcloud is load-balancers

# View load balancer details
ibmcloud is load-balancer <lb-id>

# Check health
ibmcloud is load-balancer-pool-members <lb-id> <pool-id>
```

### VPE Health

**Check Status**:
```bash
# List VPE gateways
ibmcloud is virtual-endpoint-gateways

# View VPE details
ibmcloud is virtual-endpoint-gateway <vpe-id>

# Check connectivity
curl -v https://<service-endpoint>
```

### Common Issues

**Problem**: Load balancer not getting IP
**Solutions**:
```
1. Check service type is LoadBalancer
2. Verify annotations correct
3. Check quota limits
4. Review cloud provider logs
```

**Problem**: Cannot access via load balancer
**Solutions**:
```
1. Check security groups
2. Verify health checks passing
3. Check backend pods running
4. Review load balancer configuration
```

## Best Practices Summary

### Load Balancers

✅ Use private load balancers when possible
✅ Implement SSL/TLS termination
✅ Configure health checks
✅ Restrict source IPs
✅ Monitor performance
✅ Regular security audits

### VPEs

✅ Use for all IBM Cloud service access
✅ Dedicated security groups
✅ Network segmentation
✅ Enable logging
✅ Monitor access patterns
✅ Regular reviews

### General

✅ Defense in depth
✅ Principle of least privilege
✅ Regular updates
✅ Monitoring and alerting
✅ Documentation
✅ Incident response plan

## Key Takeaways

✅ Load balancers expose services securely
✅ VPEs provide private service access
✅ Private load balancers enhance security
✅ SSL/TLS termination is essential
✅ Health checks ensure availability
✅ Monitoring prevents issues

## Next Steps

Learn about:
- Context-based restrictions
- Secrets Manager integration
- Cluster lifecycle management

---

**Navigation**: [← Back: Autoscaling Configuration](14-autoscaling-configuration.md) | [Next: CBR Rules →](16-cbr-rules.md)
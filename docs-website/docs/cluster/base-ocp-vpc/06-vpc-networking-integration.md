# VPC Networking Integration

## Introduction

OpenShift clusters on IBM Cloud VPC rely on sophisticated networking integration to provide secure, high-performance connectivity. This chapter explains how OpenShift integrates with IBM Cloud VPC networking, covering subnets, routing, load balancers, and network architecture patterns.

## VPC Networking Fundamentals

### What is IBM Cloud VPC?

IBM Cloud **Virtual Private Cloud (VPC)** is a logically isolated network environment where you can:
- Define your own IP address ranges
- Create subnets across availability zones
- Control traffic with security groups and ACLs
- Connect to other networks securely

**Think of it as**: Your own private data center in the cloud, with complete control over networking.

> **For detailed VPC architecture:** See [VPC Infrastructure](../../vpc/README.md), [VPC Foundation](../../vpc/vpc-foundation.md), and [Subnet Service Internals](../../vpc/subnet-service-internals.md)

### VPC Components for OpenShift

**1. VPC Instance**:
- The top-level network container
- Has a CIDR block (e.g., 10.0.0.0/16)
- Spans all availability zones in a region
- Isolated from other VPCs

**2. Subnets**:
- Subdivisions of the VPC CIDR
- Exist in a single availability zone
- Where cluster nodes are placed
- Have their own CIDR blocks

**3. Public Gateways**:
- Provide outbound internet access
- Attached to subnets
- Enable NAT for private instances
- Optional per subnet

**4. Security Groups**:
- Virtual firewalls for instances
- Control inbound and outbound traffic
- Stateful (return traffic automatically allowed)
- Applied to network interfaces

**5. Network ACLs**:
- Subnet-level firewalls
- Control traffic entering/leaving subnets
- Stateless (must explicitly allow return traffic)
- Applied to entire subnets

## Network Architecture Patterns

### Pattern 1: Single-Zone Cluster

**Use Case**: Development, testing, cost-sensitive workloads

```
VPC: 10.0.0.0/16
│
└── Zone 1 (us-south-1)
    └── Subnet: 10.0.1.0/24
        ├── Control Plane: 1 node
        └── Workers: 3 nodes
```

**Characteristics**:
- ✅ Simple architecture
- ✅ Lower cost
- ✅ Easy to manage
- ❌ No high availability
- ❌ Zone failure = cluster down

**When to Use**:
- Development environments
- Testing and experimentation
- Non-critical workloads
- Budget constraints

### Pattern 2: Multi-Zone Cluster (Recommended)

**Use Case**: Production workloads requiring high availability

```
VPC: 10.0.0.0/16
│
├── Zone 1 (us-south-1)
│   └── Subnet: 10.0.1.0/24
│       ├── Control Plane: 1 node
│       └── Workers: 3 nodes
│
├── Zone 2 (us-south-2)
│   └── Subnet: 10.0.2.0/24
│       ├── Control Plane: 1 node
│       └── Workers: 3 nodes
│
└── Zone 3 (us-south-3)
    └── Subnet: 10.0.3.0/24
        ├── Control Plane: 1 node
        └── Workers: 3 nodes
```

**Characteristics**:
- ✅ High availability
- ✅ Survives zone failures
- ✅ Automatic failover
- ✅ Production-ready
- ⚠️ Higher cost (3x infrastructure)
- ⚠️ More complex networking

**When to Use**:
- Production workloads
- Business-critical applications
- SLA requirements
- Compliance needs

### Pattern 3: Shared VPC with Multiple Clusters

**Use Case**: Multiple clusters sharing network infrastructure

```
VPC: 10.0.0.0/16
│
├── Cluster 1 Subnets
│   ├── Zone 1: 10.0.1.0/24
│   ├── Zone 2: 10.0.2.0/24
│   └── Zone 3: 10.0.3.0/24
│
└── Cluster 2 Subnets
    ├── Zone 1: 10.0.4.0/24
    ├── Zone 2: 10.0.5.0/24
    └── Zone 3: 10.0.6.0/24
```

**Characteristics**:
- ✅ Shared infrastructure
- ✅ Easier inter-cluster communication
- ✅ Centralized network management
- ⚠️ Requires careful CIDR planning
- ⚠️ Potential for IP exhaustion

**When to Use**:
- Multiple related clusters
- Microservices across clusters
- Shared services architecture
- Cost optimization

## Subnet Design and CIDR Planning

### Understanding CIDR Notation

**CIDR (Classless Inter-Domain Routing)** defines IP address ranges:

```
10.0.0.0/16
│       │ └─ Prefix length (16 bits for network)
│       └─── IP address
└─────────── Network portion

/16 = 65,536 IP addresses
/24 = 256 IP addresses
/28 = 16 IP addresses
```

**Common CIDR Blocks**:
```
/8  = 16,777,216 IPs (Class A)
/16 = 65,536 IPs     (Recommended for VPC)
/24 = 256 IPs        (Recommended for subnets)
/28 = 16 IPs         (Minimum for subnet)
```

### VPC CIDR Selection

**Recommended VPC CIDR Blocks**:

**Option 1: 10.0.0.0/16** (Recommended)
```
Range: 10.0.0.0 - 10.0.255.255
Total IPs: 65,536
Subnets: Can create 256 /24 subnets

Pros:
- Large address space
- Room for growth
- Standard choice

Cons:
- May conflict with corporate networks using 10.x
```

**Option 2: 172.16.0.0/16**
```
Range: 172.16.0.0 - 172.16.255.255
Total IPs: 65,536
Subnets: Can create 256 /24 subnets

Pros:
- Less common than 10.x
- Same capacity as 10.0.0.0/16

Cons:
- May conflict with some networks
```

**Option 3: 192.168.0.0/16**
```
Range: 192.168.0.0 - 192.168.255.255
Total IPs: 65,536
Subnets: Can create 256 /24 subnets

Pros:
- Familiar to many users
- Standard home network range

Cons:
- Very common, high conflict potential
```

### Subnet CIDR Planning

**Subnet Size Recommendations**:

**Small Cluster** (< 10 workers per zone):
```
Subnet: /26 (64 IPs)
- Workers: 10 IPs
- Control plane: 1 IP
- Load balancers: 2 IPs
- Reserved: 5 IPs
- Available: 46 IPs
```

**Medium Cluster** (10-50 workers per zone):
```
Subnet: /24 (256 IPs)
- Workers: 50 IPs
- Control plane: 1 IP
- Load balancers: 5 IPs
- Reserved: 5 IPs
- Available: 195 IPs
```

**Large Cluster** (> 50 workers per zone):
```
Subnet: /23 (512 IPs)
- Workers: 100 IPs
- Control plane: 1 IP
- Load balancers: 10 IPs
- Reserved: 5 IPs
- Available: 396 IPs
```

### IP Address Allocation

**Reserved IPs per Subnet**:
IBM Cloud reserves the first 4 and last 1 IP addresses:

```
10.0.1.0/24 (256 total IPs)
├── 10.0.1.0   - Network address (reserved)
├── 10.0.1.1   - VPC router (reserved)
├── 10.0.1.2   - DNS server (reserved)
├── 10.0.1.3   - Future use (reserved)
├── 10.0.1.4   - First usable IP
├── ...
├── 10.0.1.254 - Last usable IP
└── 10.0.1.255 - Broadcast address (reserved)

Usable IPs: 251 (256 - 5 reserved)
```

**IP Allocation Example**:
```
Subnet: 10.0.1.0/24 (251 usable IPs)

Control Plane Node: 10.0.1.4
Worker Node 1:      10.0.1.5
Worker Node 2:      10.0.1.6
Worker Node 3:      10.0.1.7
Load Balancer 1:    10.0.1.8
Load Balancer 2:    10.0.1.9
...
Future growth:      10.0.1.10 - 10.0.1.254
```

### Multi-Zone CIDR Planning

**Example for 3-Zone Cluster**:

```
VPC: 10.0.0.0/16

Zone 1 (us-south-1):
├── Control Plane Subnet: 10.0.1.0/28  (16 IPs)
└── Worker Subnet:        10.0.1.16/24 (256 IPs)

Zone 2 (us-south-2):
├── Control Plane Subnet: 10.0.2.0/28  (16 IPs)
└── Worker Subnet:        10.0.2.16/24 (256 IPs)

Zone 3 (us-south-3):
├── Control Plane Subnet: 10.0.3.0/28  (16 IPs)
└── Worker Subnet:        10.0.3.16/24 (256 IPs)

Management Subnet:        10.0.4.0/24  (256 IPs)
Future Use:               10.0.5.0/24 - 10.0.255.0/24
```

**Why This Works**:
- Clear zone separation
- Easy to identify resources by IP
- Room for growth
- Separate control plane and worker subnets

## Public vs. Private Subnets

### Public Subnets

**Characteristics**:
- Attached to public gateway
- Instances can access internet
- Outbound traffic uses NAT
- Inbound traffic requires load balancer or floating IP

**Use Cases**:
- Worker nodes needing internet access
- Pulling container images from public registries
- Accessing external APIs
- Software updates and patches

**Configuration**:
```
Subnet: 10.0.1.0/24
Public Gateway: Attached
Outbound: Allowed via NAT
Inbound: Blocked (unless explicitly allowed)
```

### Private Subnets

**Characteristics**:
- No public gateway attached
- No direct internet access
- More secure
- Requires VPN or Direct Link for external access

**Use Cases**:
- Control plane nodes (recommended)
- Sensitive workloads
- Compliance requirements
- Internal-only services

**Configuration**:
```
Subnet: 10.0.1.0/24
Public Gateway: None
Outbound: Blocked
Inbound: Only from VPC or connected networks
```

### Hybrid Approach (Recommended)

**Best Practice**:
```
Control Plane Subnets: Private
Worker Subnets: Public (with restrictions)
Management Subnet: Private

Benefits:
- Control plane isolated from internet
- Workers can pull images and updates
- Management access via VPN
- Balanced security and functionality
```

## Load Balancer Integration

### Load Balancer Types

**1. Application Load Balancer (ALB)**:
- Layer 7 (HTTP/HTTPS)
- Content-based routing
- SSL termination
- WebSocket support

**2. Network Load Balancer (NLB)**:
- Layer 4 (TCP/UDP)
- High performance
- Low latency
- Preserves source IP

### Load Balancer for Cluster API

**Purpose**: Provide highly available access to API server

**Configuration**:
```
Type: Network Load Balancer
Protocol: TCP
Port: 6443 (Kubernetes API)
Backend: Control plane nodes
Health Check: TCP on port 6443

Zones:
- Zone 1: Backend = Control plane node 1
- Zone 2: Backend = Control plane node 2
- Zone 3: Backend = Control plane node 3
```

**How It Works**:
1. Client connects to load balancer IP
2. Load balancer selects healthy control plane node
3. Traffic forwarded to API server
4. If node fails, traffic goes to other nodes

### Load Balancer for Applications

**Ingress Load Balancer**:
```
Type: Application Load Balancer
Protocol: HTTPS
Port: 443
Backend: Ingress controller pods
SSL: Terminated at load balancer

Routing:
- app1.example.com → App 1 service
- app2.example.com → App 2 service
- api.example.com  → API service
```

**Service Load Balancer**:
```
Type: Network Load Balancer
Protocol: TCP
Port: Application-specific
Backend: Service pods
Health Check: Application-specific

Example:
- Database: Port 5432
- Redis: Port 6379
- Custom app: Port 8080
```

## Network Traffic Flows

### Pod-to-Pod Communication

**Within Same Node**:
```
Pod A → Container Network → Pod B
- Direct communication
- No network overhead
- Fastest path
```

**Across Nodes (Same Zone)**:
```
Pod A → Node A Network → VPC Network → Node B Network → Pod B
- Encapsulated by CNI
- Low latency (<1ms)
- High bandwidth
```

**Across Zones**:
```
Pod A (Zone 1) → VPC Network → Pod B (Zone 2)
- Cross-zone traffic
- Slightly higher latency (1-2ms)
- May incur data transfer costs
```

### External Traffic to Cluster

**Via Load Balancer**:
```
Internet → Load Balancer → Ingress Controller → Service → Pod
1. Client makes HTTPS request
2. Load balancer terminates SSL
3. Forwards to ingress controller
4. Ingress routes to appropriate service
5. Service load balances to pod
```

**Via NodePort**:
```
Internet → Node IP:NodePort → Service → Pod
1. Client connects to any node IP
2. Kube-proxy forwards to service
3. Service load balances to pod
- Less common in production
- Used for testing or specific use cases
```

### Cluster to External Services

**Via Public Gateway**:
```
Pod → Node → Public Gateway → Internet
1. Pod makes outbound request
2. Traffic routed through node
3. Public gateway performs NAT
4. Request goes to internet
```

**Via VPN or Direct Link**:
```
Pod → Node → VPN/Direct Link → Corporate Network
1. Pod makes request to private IP
2. Traffic routed through VPN tunnel
3. Reaches corporate network
- Secure connection
- No internet exposure
```

## DNS Configuration

### Cluster Internal DNS

**CoreDNS**:
- Provides DNS for cluster
- Resolves service names
- Handles pod DNS queries

**DNS Resolution**:
```
Service Name: myapp
Namespace: production
Full DNS: myapp.production.svc.cluster.local

Resolution:
1. Pod queries myapp
2. CoreDNS adds namespace and domain
3. Returns service ClusterIP
4. Pod connects to service
```

### External DNS

**IBM Cloud DNS**:
- Resolves external domain names
- Configured automatically
- Uses IBM Cloud DNS servers

**Custom DNS**:
```
Can configure custom DNS servers:
- Corporate DNS
- Public DNS (8.8.8.8, 1.1.1.1)
- Hybrid approach
```

## Network Policies

### Default Behavior

**Without Network Policies**:
- All pods can communicate with all pods
- All pods can access external networks
- No restrictions

**With Network Policies**:
- Explicit allow rules required
- Default deny for unmatched traffic
- Fine-grained control

### Example Network Policies

**Isolate Namespace**:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

**Allow Specific Traffic**:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

## VPC Peering and Connectivity

### VPC-to-VPC Connectivity

**Transit Gateway**:
- Connects multiple VPCs
- Enables cross-VPC communication
- Centralized routing

**Use Cases**:
- Multiple clusters in different VPCs
- Shared services VPC
- Hub-and-spoke architecture

### VPN Connectivity

**Site-to-Site VPN**:
- Connect VPC to on-premises network
- IPsec tunnel
- Secure communication

**Client VPN**:
- Individual user access
- Remote administration
- Secure remote access

### Direct Link

**Dedicated Connection**:
- Physical connection to IBM Cloud
- High bandwidth
- Low latency
- Predictable performance

**Use Cases**:
- Large data transfers
- Hybrid cloud
- Latency-sensitive applications

## Network Performance Optimization

### Bandwidth Considerations

**Instance Network Bandwidth**:
```
bx2-2x8:   4 Gbps
bx2-4x16:  8 Gbps
bx2-8x32:  16 Gbps
bx2-16x64: 32 Gbps
```

**Optimization Tips**:
- Choose appropriate instance types
- Distribute workload across nodes
- Use local storage when possible
- Minimize cross-zone traffic

### Latency Optimization

**Within Zone**: < 1ms
**Cross-Zone**: 1-2ms
**Cross-Region**: 50-200ms

**Best Practices**:
- Place related services in same zone
- Use caching to reduce external calls
- Implement connection pooling
- Use CDN for static content

## Troubleshooting Network Issues

### Common Problems

**Problem**: Pods can't communicate
**Check**:
- Network policies blocking traffic
- Security groups misconfigured
- CNI plugin issues
- DNS resolution failures

**Problem**: Can't access cluster API
**Check**:
- Load balancer health
- Control plane node status
- Security group rules
- Network ACLs

**Problem**: Slow network performance
**Check**:
- Instance bandwidth limits
- Cross-zone traffic
- Network congestion
- MTU settings

### Diagnostic Commands

```bash
# Check pod networking
oc get pods -o wide

# Test DNS resolution
oc run -it --rm debug --image=busybox --restart=Never -- nslookup kubernetes

# Test connectivity
oc run -it --rm debug --image=busybox --restart=Never -- wget -O- http://service-name

# Check network policies
oc get networkpolicies

# View service endpoints
oc get endpoints
```

## Key Takeaways

✅ VPC provides isolated network environment
✅ Multi-zone deployment requires subnets in each zone
✅ Proper CIDR planning prevents IP exhaustion
✅ Load balancers provide high availability
✅ Network policies control traffic flow
✅ Understanding traffic flows aids troubleshooting

## Next Steps

Learn about:
- Worker pool configuration
- Operating system selection
- Security groups and network isolation

---

**Navigation**: [← Back: Resource Scoping](05-resource-scoping.md) | [Next: Worker Pools Configuration →](07-worker-pools-configuration.md)
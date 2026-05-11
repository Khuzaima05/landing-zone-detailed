# Cluster Architecture

## Introduction

Now that you understand OpenShift fundamentals, let's dive deeper into how an OpenShift cluster is actually structured and how it operates on IBM Cloud VPC infrastructure. This chapter explains the architecture in detail, preparing you for deployment planning.

## High-Level Architecture Overview

An OpenShift cluster on IBM Cloud VPC consists of several layers working together:

```
┌─────────────────────────────────────────────────────────────┐
│                     User Applications                        │
│              (Your containerized workloads)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   OpenShift Platform                         │
│        (Container orchestration and management)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  IBM Cloud VPC Infrastructure                │
│     (Virtual servers, networking, storage, security)         │
└─────────────────────────────────────────────────────────────┘
```

Each layer has specific responsibilities and components. Let's explore them in detail.

## Control Plane Architecture

The control plane is the "brain" of your OpenShift cluster. It makes all the decisions about what runs where and maintains the desired state of your applications.

### Control Plane Components

#### 1. API Server

**What It Does**:
- Central point for all cluster operations
- Processes REST API requests from users, tools, and other components
- Validates and stores configuration in etcd
- Serves as the gateway to the cluster

**Why It Matters**:
- Every interaction with OpenShift goes through the API server
- It enforces authentication and authorization
- Provides audit logging of all operations

**In Practice**:
When you run a command like `oc create deployment myapp`, the API server:
1. Authenticates your identity
2. Checks if you have permission
3. Validates the configuration
4. Stores it in etcd
5. Notifies other components about the change

#### 2. etcd Database

**What It Does**:
- Distributed key-value store
- Stores all cluster state and configuration
- Provides consistency across control plane nodes
- Enables cluster recovery

**Why It Matters**:
- Single source of truth for cluster state
- Must be highly available and backed up
- Performance impacts overall cluster responsiveness

**Key Characteristics**:
- **Distributed**: Runs on multiple control plane nodes
- **Consistent**: Uses Raft consensus algorithm
- **Reliable**: Survives node failures
- **Fast**: In-memory with disk persistence

**In Practice**:
etcd stores:
- All pod definitions
- Service configurations
- Secrets and ConfigMaps
- Network policies
- RBAC rules
- Everything about your cluster

#### 3. Scheduler

**What It Does**:
- Decides which worker node should run each new pod
- Considers resource requirements (CPU, memory)
- Respects constraints and policies
- Balances workload across nodes

**Why It Matters**:
- Ensures efficient resource utilization
- Prevents overloading nodes
- Respects application requirements (like "must run on SSD storage")

**Scheduling Process**:
1. **Filtering**: Eliminate nodes that can't run the pod
   - Not enough resources
   - Doesn't match node selector
   - Has taints that pod doesn't tolerate

2. **Scoring**: Rank remaining nodes
   - Prefer nodes with more available resources
   - Spread pods across nodes for high availability
   - Consider affinity/anti-affinity rules

3. **Binding**: Assign pod to highest-scoring node

**In Practice**:
If you request a pod with 4 CPU cores and 8GB RAM, the scheduler:
- Finds nodes with sufficient resources
- Prefers nodes with more headroom
- Avoids placing all replicas on the same node
- Respects any zone or node preferences you specified

#### 4. Controller Manager

**What It Does**:
- Runs multiple controllers that maintain desired state
- Continuously monitors cluster state
- Takes corrective action when actual state differs from desired state

**Key Controllers**:

**Replication Controller**:
- Ensures correct number of pod replicas
- Creates new pods if some fail
- Deletes excess pods if scaled down

**Node Controller**:
- Monitors node health
- Marks nodes as unhealthy if they stop responding
- Evicts pods from failed nodes

**Service Account Controller**:
- Creates default service accounts for namespaces
- Manages authentication tokens

**Endpoint Controller**:
- Updates service endpoints when pods are added/removed
- Maintains the list of healthy pods backing each service

**In Practice**:
If you specify 3 replicas of your application:
- Controller manager continuously counts running pods
- If one crashes, it immediately creates a replacement
- If you scale to 5, it creates 2 more
- If you scale to 1, it terminates 2 pods

#### 5. Cloud Controller Manager

**What It Does**:
- Integrates OpenShift with IBM Cloud infrastructure
- Manages cloud-specific resources
- Handles load balancer provisioning
- Manages persistent volume creation

**IBM Cloud Integration**:
- Creates IBM Cloud Load Balancers for LoadBalancer services
- Provisions IBM Cloud Block Storage for persistent volumes
- Updates node metadata from IBM Cloud
- Handles node lifecycle events

**In Practice**:
When you create a LoadBalancer service:
1. Cloud controller manager detects the request
2. Calls IBM Cloud API to create a load balancer
3. Configures backend pool with worker node IPs
4. Updates service with load balancer IP address

### Control Plane High Availability

For production clusters, the control plane must be highly available to prevent single points of failure.

#### Multi-Master Architecture

**Standard Configuration**:
- **3 control plane nodes** (minimum for production)
- Spread across different availability zones
- Each runs all control plane components
- etcd forms a quorum across all three

**Why 3 Nodes?**:
- etcd requires a majority (quorum) to function
- With 3 nodes, cluster survives 1 node failure
- With 5 nodes, cluster survives 2 node failures
- Odd numbers prevent split-brain scenarios

**Failure Scenarios**:

**1 Control Plane Node Fails**:
- ✅ Cluster continues operating normally
- ✅ API server requests go to remaining nodes
- ✅ etcd maintains quorum (2 out of 3)
- ⚠️ Reduced redundancy until node recovers

**2 Control Plane Nodes Fail**:
- ❌ etcd loses quorum (1 out of 3)
- ❌ Cluster becomes read-only
- ❌ Cannot create/update/delete resources
- ✅ Existing workloads continue running

**Key Insight**: Worker nodes and running applications continue functioning even if control plane is unavailable. You just can't make changes until it recovers.

### Control Plane Sizing

Control plane nodes need adequate resources:

**Minimum Requirements**:
- **CPU**: 4 cores per node
- **Memory**: 16 GB per node
- **Storage**: 100 GB for etcd and logs

**Scaling Considerations**:
- Larger clusters need more control plane resources
- More frequent API calls require more CPU
- More objects (pods, services) need more memory
- etcd performance depends on disk I/O speed

**IBM Cloud Instance Types**:
- Small clusters: `bx2-4x16` (4 vCPU, 16 GB RAM)
- Medium clusters: `bx2-8x32` (8 vCPU, 32 GB RAM)
- Large clusters: `bx2-16x64` (16 vCPU, 64 GB RAM)

## Worker Node Architecture

Worker nodes run your actual application workloads. They receive instructions from the control plane and execute them.

### Worker Node Components

#### 1. Kubelet

**What It Does**:
- Primary node agent that runs on every worker
- Communicates with API server
- Ensures containers are running as specified
- Reports node and pod status

**Responsibilities**:
- **Pod Lifecycle**: Starts, stops, and monitors containers
- **Health Checks**: Runs liveness and readiness probes
- **Resource Management**: Enforces CPU and memory limits
- **Volume Management**: Mounts storage volumes
- **Metrics Collection**: Gathers resource usage data

**In Practice**:
When a pod is scheduled to a node:
1. Kubelet receives pod specification from API server
2. Pulls container images from registry
3. Creates and starts containers
4. Monitors container health
5. Reports status back to API server

#### 2. Container Runtime (CRI-O)

**What It Does**:
- Actually runs the containers
- Manages container images
- Handles container networking
- Provides container isolation

**Why CRI-O in OpenShift?**:
- Lightweight and optimized for Kubernetes
- Better security than Docker
- Faster startup times
- Lower resource overhead
- Built specifically for container orchestration

**Container Lifecycle**:
1. **Image Pull**: Download container image from registry
2. **Container Creation**: Set up filesystem, networking, namespaces
3. **Container Start**: Execute the main process
4. **Container Monitoring**: Track resource usage and health
5. **Container Stop**: Graceful shutdown or forced termination
6. **Container Cleanup**: Remove stopped containers

#### 3. Kube Proxy

**What It Does**:
- Manages network rules on each node
- Implements service networking
- Provides load balancing for services
- Handles connection forwarding

**How It Works**:
- Watches API server for service and endpoint changes
- Updates iptables or IPVS rules on the node
- Routes traffic to appropriate pods
- Balances load across healthy pods

**In Practice**:
When a pod tries to connect to a service:
1. Connection goes to service's virtual IP
2. Kube proxy intercepts the connection
3. Selects a healthy backend pod
4. Forwards traffic to that pod
5. Maintains connection state

#### 4. Node Problem Detector

**What It Does**:
- Monitors node health
- Detects hardware and kernel issues
- Reports problems to control plane
- Enables automated remediation

**Monitored Conditions**:
- Disk pressure (running out of space)
- Memory pressure (low available memory)
- PID pressure (too many processes)
- Network unavailability
- Kernel deadlocks
- Hardware errors

### Worker Node Sizing

Choosing the right worker node size is crucial for performance and cost.

#### Factors to Consider

**1. Application Requirements**:
- CPU-intensive: More cores
- Memory-intensive: More RAM
- I/O-intensive: Faster storage
- Network-intensive: Higher bandwidth

**2. Pod Density**:
- How many pods per node?
- Each pod needs resources
- Leave headroom for system processes

**3. Failure Domain**:
- Smaller nodes = more failure domains
- Larger nodes = fewer but bigger failures
- Balance between cost and resilience

**4. Scaling Granularity**:
- Smaller nodes = finer scaling increments
- Larger nodes = coarser but potentially cheaper

#### Common IBM Cloud Instance Types

**General Purpose (bx2 family)**:
- `bx2-2x8`: 2 vCPU, 8 GB RAM - Development/testing
- `bx2-4x16`: 4 vCPU, 16 GB RAM - Small production workloads
- `bx2-8x32`: 8 vCPU, 32 GB RAM - Medium workloads
- `bx2-16x64`: 16 vCPU, 64 GB RAM - Large workloads

**Compute Optimized (cx2 family)**:
- Higher CPU-to-memory ratio
- Good for compute-intensive applications
- Web servers, batch processing

**Memory Optimized (mx2 family)**:
- Higher memory-to-CPU ratio
- Good for memory-intensive applications
- Databases, caching, analytics

**Very High Memory (vx2 family)**:
- Extremely high memory-to-CPU ratio
- In-memory databases
- Large-scale analytics

### Worker Pool Architecture

Worker nodes are organized into **worker pools** - groups of nodes with identical configuration.

**Why Worker Pools?**:
- **Consistency**: All nodes in pool have same size and configuration
- **Scaling**: Add/remove nodes as a group
- **Isolation**: Different workload types on different pools
- **Updates**: Roll out changes pool by pool

**Common Pool Strategies**:

**1. Single Pool**:
```
All workers: bx2-8x32
- Simple to manage
- Works for homogeneous workloads
- Less flexibility
```

**2. Workload-Based Pools**:
```
Pool 1 (web): bx2-4x16 - Frontend applications
Pool 2 (api): bx2-8x32 - Backend services
Pool 3 (data): mx2-16x128 - Data processing
```

**3. Environment-Based Pools**:
```
Pool 1 (prod): bx2-8x32 - Production workloads
Pool 2 (dev): bx2-2x8 - Development/testing
```

## Multi-Zone Architecture

For high availability, OpenShift clusters span multiple availability zones within an IBM Cloud region.

### What Are Availability Zones?

**Availability Zones (AZs)** are physically separate data centers within the same region:
- Independent power supplies
- Separate network connections
- Different physical locations
- Low-latency connections between them

**IBM Cloud Regions and Zones**:
- **us-south** (Dallas): us-south-1, us-south-2, us-south-3
- **us-east** (Washington DC): us-east-1, us-east-2, us-east-3
- **eu-gb** (London): eu-gb-1, eu-gb-2, eu-gb-3
- **eu-de** (Frankfurt): eu-de-1, eu-de-2, eu-de-3

### Multi-Zone Cluster Design

**Standard Configuration**:
```
Zone 1:
  - 1 Control Plane Node
  - N Worker Nodes

Zone 2:
  - 1 Control Plane Node
  - N Worker Nodes

Zone 3:
  - 1 Control Plane Node
  - N Worker Nodes
```

**Benefits**:
- ✅ Survives entire zone failure
- ✅ No single point of failure
- ✅ Automatic failover
- ✅ Continuous availability

**Considerations**:
- ⚠️ Higher cost (3x infrastructure)
- ⚠️ Cross-zone network latency (typically <2ms)
- ⚠️ Data transfer costs between zones
- ⚠️ More complex networking

### Application Deployment Across Zones

**Pod Anti-Affinity**:
Spread pod replicas across zones:

```yaml
# This ensures replicas run in different zones
podAntiAffinity:
  preferredDuringSchedulingIgnoredDuringExecution:
  - weight: 100
    podAffinityTerm:
      topologyKey: topology.kubernetes.io/zone
```

**Zone-Aware Storage**:
- Persistent volumes are zone-specific
- Pods must run in same zone as their storage
- Use replication for cross-zone data availability

**Load Balancing**:
- IBM Cloud Load Balancers distribute across zones
- Health checks ensure traffic goes to healthy zones
- Automatic failover if zone becomes unavailable

## Networking Architecture

OpenShift networking on IBM Cloud VPC is multi-layered and sophisticated.

### Network Layers

#### 1. VPC Network (Infrastructure Layer)

**What It Provides**:
- Isolated virtual network in IBM Cloud
- Private IP address space (RFC 1918)
- Subnets in each availability zone
- Routing between subnets

**Typical Configuration**:
```
VPC: 10.0.0.0/16

Zone 1 Subnet: 10.0.1.0/24
Zone 2 Subnet: 10.0.2.0/24
Zone 3 Subnet: 10.0.3.0/24
```

**Worker Node IPs**:
- Each worker gets an IP from its zone's subnet
- Used for node-to-node communication
- Used for external access to nodes

#### 2. Pod Network (Overlay Layer)

**What It Provides**:
- Every pod gets its own IP address
- Pods can communicate across nodes
- Isolated from VPC network

**Default Configuration**:
```
Pod Network: 172.30.0.0/16
Service Network: 172.21.0.0/16
```

**How It Works**:
- Software-defined networking (SDN)
- Overlay network on top of VPC
- Encapsulates pod traffic
- Routes between nodes

**Pod-to-Pod Communication**:
1. Pod A wants to talk to Pod B
2. Traffic goes through node's network interface
3. SDN encapsulates packet
4. Routes to destination node
5. SDN decapsulates packet
6. Delivers to Pod B

#### 3. Service Network (Abstraction Layer)

**What It Provides**:
- Stable virtual IPs for services
- Load balancing across pods
- Service discovery via DNS

**Service Types**:

**ClusterIP** (default):
- Internal-only access
- Virtual IP within cluster
- Used for pod-to-pod communication

**NodePort**:
- Exposes service on each node's IP
- Accessible from outside cluster
- Port range: 30000-32767

**LoadBalancer**:
- Creates IBM Cloud Load Balancer
- Public or private IP
- Production-grade external access

**ExternalName**:
- Maps to external DNS name
- Used for external services

### Network Policies

Control traffic flow between pods using network policies.

**Default Behavior**:
- All pods can communicate with all other pods
- No restrictions by default

**With Network Policies**:
```yaml
# Only allow traffic from frontend to backend
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-policy
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
```

**Use Cases**:
- Isolate sensitive workloads
- Implement zero-trust networking
- Comply with security requirements
- Prevent lateral movement

## Storage Architecture

OpenShift on IBM Cloud VPC integrates with multiple storage types.

### Storage Types

#### 1. Ephemeral Storage (Temporary)

**What It Is**:
- Storage that exists only while pod is running
- Deleted when pod is deleted
- Stored on node's local disk

**Use Cases**:
- Temporary files
- Caches
- Logs (before shipping to central location)

**Characteristics**:
- ✅ Fast (local disk)
- ✅ No additional cost
- ❌ Not persistent
- ❌ Lost on pod restart

#### 2. IBM Cloud Block Storage (Persistent)

**What It Is**:
- Network-attached block storage
- Persists beyond pod lifecycle
- Backed by IBM Cloud infrastructure

**Performance Tiers**:
- **General Purpose**: 3 IOPS/GB
- **5 IOPS/GB**: Higher performance
- **10 IOPS/GB**: High performance
- **Custom**: Up to 48,000 IOPS

**Use Cases**:
- Databases
- Application state
- User uploads
- Any data that must survive pod restarts

**Characteristics**:
- ✅ Persistent
- ✅ Reliable
- ✅ Snapshots and backups
- ⚠️ Zone-specific (pod must run in same zone)
- ⚠️ Additional cost

#### 3. IBM Cloud Object Storage (Shared)

**What It Is**:
- S3-compatible object storage
- Accessible from any zone
- Highly durable and scalable

**Use Cases**:
- Container image registry
- Backups and archives
- Large files and media
- Data lakes

**Characteristics**:
- ✅ Multi-zone availability
- ✅ Unlimited scalability
- ✅ Very durable (11 nines)
- ⚠️ Higher latency than block storage
- ⚠️ Not suitable for databases

### Storage Classes

Storage classes define different types of storage available in the cluster.

**Default Storage Classes**:
```
ibmc-vpc-block-general-purpose
ibmc-vpc-block-5iops-tier
ibmc-vpc-block-10iops-tier
ibmc-vpc-block-custom
ibmc-vpc-block-retain-general-purpose
```

**Reclaim Policies**:
- **Delete**: Storage deleted when PVC is deleted
- **Retain**: Storage kept for manual cleanup

## Security Architecture

Security is built into every layer of the OpenShift cluster.

### Identity and Access Management

**Authentication**:
- IBM Cloud IAM integration
- LDAP/Active Directory integration
- OAuth 2.0 tokens
- Service account tokens

**Authorization (RBAC)**:
- Role-Based Access Control
- Cluster roles vs. namespace roles
- Fine-grained permissions
- Principle of least privilege

### Network Security

**Security Groups**:
- Control traffic to/from worker nodes
- Applied at VPC level
- Stateful firewall rules

**Network Policies**:
- Control traffic between pods
- Applied at OpenShift level
- Namespace-scoped

**Private Endpoints**:
- Keep cluster API private
- Access only from VPC or VPN
- No public internet exposure

### Data Security

**Encryption at Rest**:
- etcd data encrypted
- Persistent volumes encrypted
- Uses IBM Key Protect or HPCS

**Encryption in Transit**:
- TLS for all API communication
- Encrypted pod-to-pod traffic (optional)
- Secure container image pulls

**Secrets Management**:
- Kubernetes secrets encrypted in etcd
- IBM Secrets Manager integration
- Automatic secret rotation

## Putting It All Together

Let's see how all these components work together in a real scenario.

### Example: Deploying a Web Application

**1. User Creates Deployment**:
```bash
oc create deployment webapp --image=myapp:v1 --replicas=3
```

**2. API Server Processes Request**:
- Authenticates user
- Validates deployment configuration
- Stores in etcd

**3. Controller Manager Creates ReplicaSet**:
- Detects new deployment
- Creates ReplicaSet with 3 replicas
- Stores in etcd

**4. Scheduler Assigns Pods to Nodes**:
- Finds 3 suitable worker nodes
- Considers resources, zones, policies
- Binds pods to nodes

**5. Kubelet Starts Containers**:
- Pulls image from registry
- Creates containers on assigned nodes
- Starts application processes

**6. Kube Proxy Configures Networking**:
- Sets up service endpoints
- Configures load balancing rules
- Enables pod-to-pod communication

**7. Application Runs**:
- Pods serve traffic
- Health checks monitor status
- Logs and metrics collected

**8. User Creates Service**:
```bash
oc expose deployment webapp --port=80 --type=LoadBalancer
```

**9. Cloud Controller Manager Creates Load Balancer**:
- Calls IBM Cloud API
- Provisions load balancer
- Configures backend pool
- Returns public IP

**10. Traffic Flows**:
```
Internet → Load Balancer → Worker Nodes → Pods → Application
```

## Key Takeaways

Before moving to the next section, ensure you understand:

✅ **Control plane** manages the cluster (API server, scheduler, controllers)
✅ **Worker nodes** run application workloads (kubelet, container runtime)
✅ **Multi-zone** deployment provides high availability
✅ **Networking** has multiple layers (VPC, pod network, services)
✅ **Storage** options include ephemeral, block, and object storage
✅ **Security** is implemented at every layer
✅ **Components** work together to maintain desired state

## Next Steps

Now that you understand cluster architecture, you're ready to learn about:
- Prerequisites and planning for your deployment
- Sizing and resource requirements
- Network design considerations

---

**Navigation**: [← Back: OpenShift Fundamentals](01-openshift-fundamentals.md) | [Next: Prerequisites and Planning →](03-prerequisites-planning.md)
# Cluster Provisioning Flow

## Introduction

Understanding how an OpenShift cluster is provisioned helps you troubleshoot issues, estimate deployment time, and appreciate the complexity that the `terraform-ibm-base-ocp-vpc` module handles automatically. This chapter walks through the entire provisioning process step by step.

## High-Level Provisioning Overview

The cluster provisioning process involves multiple phases:

```
1. Infrastructure Preparation
   ↓
2. Control Plane Deployment
   ↓
3. Worker Node Provisioning
   ↓
4. Network Configuration
   ↓
5. Storage Setup
   ↓
6. Security Configuration
   ↓
7. Add-ons Installation
   ↓
8. Validation and Health Checks
```

Each phase has specific tasks and dependencies. Let's explore each in detail.

## Phase 1: Infrastructure Preparation

### What Happens

Before any cluster components are created, the underlying infrastructure must be prepared.

**Tasks Performed**:

1. **VPC Validation or Creation**
   - If using existing VPC: Validate it exists and is accessible
   - If creating new VPC: Create VPC with specified CIDR block
   - Set up VPC routing tables

2. **Subnet Creation**
   - Create subnets in each specified availability zone
   - Assign CIDR blocks to each subnet
   - Configure subnet routing
   - Attach subnets to VPC

3. **Public Gateway Setup** (if needed)
   - Create public gateways for internet access
   - Attach to subnets that need outbound connectivity
   - Configure NAT for private instances

4. **Security Group Creation**
   - Create default security groups
   - Configure initial rules for cluster communication
   - Set up rules for control plane and worker nodes

**Duration**: 2-5 minutes

**What You'll See**:
```
Creating VPC...
Creating subnet in us-south-1...
Creating subnet in us-south-2...
Creating subnet in us-south-3...
Creating security groups...
```

### Why This Matters

The infrastructure layer provides:
- Network isolation for your cluster
- IP address space for nodes and pods
- Security boundaries
- Foundation for all other components

**Common Issues**:
- CIDR block conflicts with existing networks
- Insufficient IP addresses in subnets
- Missing permissions to create VPC resources
- Region or zone unavailability

## Phase 2: Control Plane Deployment

### What Happens

The control plane is the "brain" of your cluster and must be deployed first.

**Tasks Performed**:

1. **Control Plane Node Provisioning**
   - Create virtual server instances for control plane
   - One node per availability zone (typically 3 total)
   - Attach to appropriate subnets
   - Assign private IP addresses

2. **etcd Cluster Setup**
   - Initialize etcd on first control plane node
   - Join additional nodes to etcd cluster
   - Establish quorum (majority consensus)
   - Configure data replication

3. **API Server Configuration**
   - Start API server on each control plane node
   - Configure authentication and authorization
   - Set up TLS certificates
   - Create load balancer for API endpoint

4. **Controller Manager and Scheduler**
   - Start controller manager processes
   - Start scheduler processes
   - Verify communication with API server
   - Begin monitoring cluster state

**Duration**: 15-25 minutes

**What You'll See**:
```
Provisioning control plane nodes...
Initializing etcd cluster...
Configuring API server...
Starting controller manager...
Starting scheduler...
Control plane ready
```

### Control Plane Bootstrap Process

The bootstrap process follows a specific sequence:

**Step 1: First Control Plane Node**
```
1. Create VM instance
2. Install OpenShift components
3. Initialize etcd as single-node cluster
4. Start API server (single instance)
5. Start controller manager
6. Start scheduler
```

**Step 2: Additional Control Plane Nodes**
```
For each additional node:
1. Create VM instance
2. Install OpenShift components
3. Join etcd cluster
4. Start API server
5. Start controller manager
6. Start scheduler
7. Verify cluster health
```

**Step 3: High Availability Configuration**
```
1. Configure load balancer for API servers
2. Set up health checks
3. Enable automatic failover
4. Verify quorum
```

### Why This Matters

The control plane must be fully operational before worker nodes can join:
- API server must accept requests
- Scheduler must be ready to place pods
- Controllers must manage cluster state
- etcd must store configuration

**Common Issues**:
- etcd fails to form quorum
- Certificate generation errors
- Network connectivity between control plane nodes
- Insufficient resources on control plane nodes

## Phase 3: Worker Node Provisioning

### What Happens

Once the control plane is ready, worker nodes are provisioned to run application workloads.

**Tasks Performed**:

1. **Worker Node Creation**
   - Create virtual server instances for workers
   - Distribute across availability zones
   - Attach to appropriate subnets
   - Assign private IP addresses

2. **Node Registration**
   - Install kubelet on each worker
   - Configure kubelet to communicate with API server
   - Generate node certificates
   - Register node with cluster

3. **Container Runtime Setup**
   - Install CRI-O container runtime
   - Configure container networking
   - Set up image pull credentials
   - Initialize container storage

4. **Node Labeling and Tainting**
   - Apply zone labels (topology.kubernetes.io/zone)
   - Apply instance type labels
   - Apply custom labels (if specified)
   - Apply taints (if specified)

**Duration**: 10-20 minutes (depends on number of workers)

**What You'll See**:
```
Provisioning worker nodes...
Creating worker pool 'default'...
  Creating worker in us-south-1...
  Creating worker in us-south-2...
  Creating worker in us-south-3...
Registering workers with cluster...
Workers ready: 3/3
```

### Worker Node Bootstrap Process

Each worker node goes through initialization:

**Step 1: Instance Creation**
```
1. Create VM from specified image
2. Attach to subnet
3. Configure network interfaces
4. Apply security groups
5. Inject SSH key
```

**Step 2: Software Installation**
```
1. Update operating system
2. Install kubelet
3. Install CRI-O
4. Install CNI plugins
5. Configure system services
```

**Step 3: Cluster Join**
```
1. Obtain bootstrap token from API server
2. Generate node certificate
3. Register with API server
4. Download cluster configuration
5. Start kubelet service
```

**Step 4: Readiness**
```
1. Kubelet reports node status
2. Node marked as Ready
3. Scheduler can place pods
4. Node begins accepting workloads
```

### Why This Matters

Worker nodes provide the compute capacity for your applications:
- More workers = more capacity
- Workers in multiple zones = high availability
- Proper initialization ensures reliable operation

**Common Issues**:
- Workers fail to join cluster (network/firewall)
- Certificate errors
- Insufficient resources on workers
- Image pull failures

## Phase 4: Network Configuration

### What Happens

The cluster networking layer is configured to enable pod-to-pod and service communication.

**Tasks Performed**:

1. **Pod Network Setup**
   - Deploy CNI (Container Network Interface) plugin
   - Configure pod CIDR blocks
   - Set up overlay network
   - Enable pod-to-pod communication

2. **Service Network Configuration**
   - Configure service CIDR block
   - Deploy kube-proxy on all nodes
   - Set up service load balancing
   - Enable service discovery (DNS)

3. **DNS Configuration**
   - Deploy CoreDNS pods
   - Configure DNS service
   - Set up cluster DNS resolution
   - Enable external DNS lookups

4. **Ingress Controller Setup**
   - Deploy OpenShift router pods
   - Create default ingress controller
   - Configure load balancer for ingress
   - Set up default routes

**Duration**: 5-10 minutes

**What You'll See**:
```
Configuring cluster networking...
Deploying CNI plugin...
Setting up service network...
Deploying DNS services...
Configuring ingress controller...
```

### Network Component Deployment

**CNI Plugin (Calico or OVN-Kubernetes)**:
```
1. Deploy CNI daemonset (runs on every node)
2. Configure network policies
3. Set up IP address management
4. Enable network encryption (if configured)
```

**CoreDNS**:
```
1. Deploy CoreDNS pods (typically 2 replicas)
2. Create DNS service
3. Configure cluster domain (cluster.local)
4. Set up upstream DNS servers
```

**Ingress Controller**:
```
1. Deploy router pods (typically 2+ replicas)
2. Create load balancer service
3. Configure default certificate
4. Set up health checks
```

### Why This Matters

Networking enables:
- Pods to communicate with each other
- Services to load balance across pods
- External traffic to reach applications
- DNS-based service discovery

**Common Issues**:
- Pod network CIDR conflicts
- DNS resolution failures
- Ingress controller not getting load balancer IP
- Network policy blocking traffic

## Phase 5: Storage Setup

### What Happens

Storage systems are configured to provide persistent volumes for applications.

**Tasks Performed**:

1. **Storage Classes Creation**
   - Create IBM Cloud Block Storage classes
   - Configure different performance tiers
   - Set reclaim policies
   - Enable volume expansion

2. **CSI Driver Deployment**
   - Deploy Container Storage Interface (CSI) driver
   - Configure driver to communicate with IBM Cloud
   - Set up volume provisioning
   - Enable snapshot capabilities

3. **Object Storage Configuration** (for registry)
   - Create or configure Cloud Object Storage bucket
   - Set up service credentials
   - Configure registry to use COS
   - Enable image storage

**Duration**: 3-5 minutes

**What You'll See**:
```
Configuring storage...
Creating storage classes...
Deploying CSI driver...
Configuring image registry storage...
```

### Storage Component Deployment

**CSI Driver**:
```
1. Deploy CSI controller (manages volumes)
2. Deploy CSI node plugin (mounts volumes)
3. Create storage classes
4. Verify driver functionality
```

**Image Registry**:
```
1. Create COS bucket (if not existing)
2. Generate service credentials
3. Configure registry operator
4. Deploy registry pods
5. Verify image push/pull
```

### Why This Matters

Storage enables:
- Persistent data for databases
- Shared storage for applications
- Container image storage
- Backup and disaster recovery

**Common Issues**:
- COS bucket creation failures
- CSI driver not starting
- Volume provisioning errors
- Registry not accessible

## Phase 6: Security Configuration

### What Happens

Security features are configured to protect the cluster and workloads.

**Tasks Performed**:

1. **Encryption Setup** (if enabled)
   - Configure Key Protect or HPCS integration
   - Enable etcd encryption
   - Configure persistent volume encryption
   - Set up key rotation

2. **Security Context Constraints**
   - Apply default SCCs
   - Configure pod security policies
   - Set up service account permissions
   - Enable security admission controllers

3. **Network Policies**
   - Apply default network policies
   - Configure namespace isolation
   - Set up ingress/egress rules
   - Enable policy enforcement

4. **RBAC Configuration**
   - Create default roles and role bindings
   - Configure service accounts
   - Set up cluster admin access
   - Enable IAM integration

**Duration**: 3-5 minutes

**What You'll See**:
```
Configuring security...
Setting up encryption...
Applying security policies...
Configuring RBAC...
```

### Security Component Configuration

**Encryption**:
```
1. Verify Key Protect/HPCS access
2. Create or retrieve encryption keys
3. Configure etcd encryption
4. Enable volume encryption
5. Verify encryption status
```

**RBAC**:
```
1. Create cluster roles
2. Create role bindings
3. Configure service accounts
4. Set up IAM integration
5. Verify access controls
```

### Why This Matters

Security configuration:
- Protects sensitive data
- Controls access to resources
- Isolates workloads
- Meets compliance requirements

**Common Issues**:
- Key Protect access errors
- RBAC misconfiguration
- Network policy blocking legitimate traffic
- Certificate errors

## Phase 7: Add-ons Installation

### What Happens

Optional add-ons and operators are installed to extend cluster functionality.

**Tasks Performed**:

1. **Monitoring Stack** (if enabled)
   - Deploy Prometheus operator
   - Configure metrics collection
   - Set up Grafana dashboards
   - Enable alerting

2. **Logging Stack** (if enabled)
   - Deploy logging operator
   - Configure log collection
   - Set up log forwarding
   - Enable log analysis

3. **Cluster Autoscaler** (if enabled)
   - Deploy autoscaler operator
   - Configure scaling policies
   - Set min/max node counts
   - Enable automatic scaling

4. **Additional Operators**
   - Install specified operators
   - Configure operator settings
   - Verify operator functionality

**Duration**: 5-15 minutes (depends on add-ons)

**What You'll See**:
```
Installing add-ons...
Deploying monitoring stack...
Configuring logging...
Setting up autoscaler...
```

### Add-on Deployment Process

**Monitoring**:
```
1. Deploy Prometheus operator
2. Create Prometheus instances
3. Deploy Grafana
4. Configure data sources
5. Import dashboards
```

**Logging**:
```
1. Deploy logging operator
2. Create log collector daemonset
3. Configure log forwarding
4. Set up log storage
5. Verify log collection
```

### Why This Matters

Add-ons provide:
- Visibility into cluster health
- Automatic scaling capabilities
- Enhanced security features
- Operational tools

**Common Issues**:
- Insufficient resources for add-ons
- Configuration errors
- Operator installation failures
- Integration issues

## Phase 8: Validation and Health Checks

### What Happens

The final phase verifies that all components are functioning correctly.

**Tasks Performed**:

1. **Component Health Checks**
   - Verify all control plane components running
   - Check all worker nodes are Ready
   - Validate networking functionality
   - Confirm storage is operational

2. **Cluster Validation**
   - Run cluster validation tests
   - Verify API server accessibility
   - Test pod scheduling
   - Validate service networking

3. **Operator Status**
   - Check all operators are running
   - Verify operator health
   - Validate operator configurations
   - Confirm operator functionality

4. **Final Configuration**
   - Apply any custom configurations
   - Run post-deployment scripts
   - Generate cluster credentials
   - Provide access information

**Duration**: 2-5 minutes

**What You'll See**:
```
Running health checks...
Validating cluster components...
Checking operator status...
Cluster ready!
```

### Validation Checks

**Control Plane**:
```
✓ API server responding
✓ etcd cluster healthy
✓ Scheduler running
✓ Controller manager running
✓ Cloud controller manager running
```

**Worker Nodes**:
```
✓ All nodes in Ready state
✓ Kubelet running on all nodes
✓ Container runtime operational
✓ Network connectivity verified
```

**Networking**:
```
✓ Pod network operational
✓ Service network functional
✓ DNS resolution working
✓ Ingress controller ready
```

**Storage**:
```
✓ Storage classes available
✓ CSI driver running
✓ Image registry operational
✓ Volume provisioning working
```

### Why This Matters

Validation ensures:
- Cluster is fully operational
- All components are healthy
- Applications can be deployed
- No configuration issues

**Common Issues**:
- Components stuck in pending state
- Health checks failing
- Timeout errors
- Configuration drift

## Complete Provisioning Timeline

### Typical Timeline for Standard Cluster

```
Phase 1: Infrastructure Preparation     [2-5 min]
Phase 2: Control Plane Deployment      [15-25 min]
Phase 3: Worker Node Provisioning      [10-20 min]
Phase 4: Network Configuration         [5-10 min]
Phase 5: Storage Setup                 [3-5 min]
Phase 6: Security Configuration        [3-5 min]
Phase 7: Add-ons Installation          [5-15 min]
Phase 8: Validation                    [2-5 min]

Total: 45-90 minutes
```

### Factors Affecting Duration

**Faster Provisioning**:
- Smaller cluster (fewer workers)
- Single zone deployment
- Minimal add-ons
- Existing VPC infrastructure
- Fast network connectivity

**Slower Provisioning**:
- Large cluster (many workers)
- Multi-zone deployment
- Many add-ons
- New VPC creation
- Network latency issues
- Resource contention

## Monitoring Provisioning Progress

### Using Terraform

When deploying with Terraform, you'll see detailed progress:

```bash
terraform apply

# Output shows each resource being created:
ibm_is_vpc.cluster_vpc: Creating...
ibm_is_subnet.zone1: Creating...
ibm_container_vpc_cluster.cluster: Creating...
  [This step takes longest - 30-60 minutes]
ibm_container_vpc_worker_pool.pool: Creating...
```

### Using IBM Cloud Console

You can monitor progress in the IBM Cloud Console:

1. Navigate to "OpenShift" → "Clusters"
2. Find your cluster in the list
3. Click on cluster name
4. View "Status" field:
   - `Deploying` - Provisioning in progress
   - `Normal` - Cluster ready
   - `Warning` - Issues detected
   - `Critical` - Serious problems

### Using CLI

Monitor with the IBM Cloud CLI:

```bash
# Check cluster status
ibmcloud oc cluster get --cluster <cluster-name>

# Watch worker status
ibmcloud oc workers --cluster <cluster-name>

# View cluster events
ibmcloud oc cluster events --cluster <cluster-name>
```

## What Happens Behind the Scenes

### IBM Cloud Automation

IBM Cloud performs many automated tasks:

1. **Resource Allocation**
   - Selects physical hosts for VMs
   - Allocates network resources
   - Provisions storage volumes
   - Assigns IP addresses

2. **Software Installation**
   - Downloads OpenShift images
   - Installs operating system
   - Configures system services
   - Applies security patches

3. **Configuration Management**
   - Generates certificates
   - Creates configuration files
   - Sets up authentication
   - Configures networking

4. **Health Monitoring**
   - Monitors component health
   - Detects failures
   - Triggers remediation
   - Reports status

### OpenShift Operators

OpenShift uses operators to manage components:

**Cluster Version Operator**:
- Manages OpenShift version
- Coordinates upgrades
- Ensures component versions match

**Network Operator**:
- Manages CNI plugin
- Configures networking
- Handles network policies

**Storage Operator**:
- Manages CSI drivers
- Configures storage classes
- Handles volume provisioning

**Image Registry Operator**:
- Manages internal registry
- Configures storage backend
- Handles image replication

## Troubleshooting Provisioning Issues

### Common Problems and Solutions

**Problem**: Provisioning stuck at "Creating control plane"
**Possible Causes**:
- Network connectivity issues
- Insufficient permissions
- Resource quota exceeded
- Zone unavailability

**Solutions**:
- Check network configuration
- Verify IAM permissions
- Review resource quotas
- Try different zone

**Problem**: Workers not joining cluster
**Possible Causes**:
- Security group blocking traffic
- Incorrect subnet configuration
- Certificate errors
- API server not accessible

**Solutions**:
- Review security group rules
- Verify subnet routing
- Check certificate validity
- Test API server connectivity

**Problem**: Provisioning fails with timeout
**Possible Causes**:
- Slow network
- Resource contention
- Service outage
- Configuration error

**Solutions**:
- Retry provisioning
- Check IBM Cloud status page
- Review configuration
- Contact support if persistent

## Post-Provisioning Steps

After provisioning completes:

1. **Verify Cluster Access**
   ```bash
   ibmcloud oc cluster config --cluster <cluster-name>
   oc get nodes
   oc get pods --all-namespaces
   ```

2. **Review Cluster Configuration**
   - Check node count and types
   - Verify zones and distribution
   - Review security settings
   - Validate networking

3. **Configure Access Control**
   - Set up user authentication
   - Create namespaces
   - Configure RBAC
   - Grant team access

4. **Install Additional Tools**
   - Deploy monitoring
   - Set up logging
   - Install operators
   - Configure CI/CD

5. **Deploy Test Application**
   - Verify pod scheduling
   - Test networking
   - Validate storage
   - Check ingress

## Key Takeaways

✅ Provisioning follows a specific sequence of phases
✅ Control plane must be ready before workers join
✅ Typical provisioning takes 45-90 minutes
✅ Many automated tasks happen behind the scenes
✅ Monitoring progress helps identify issues early
✅ Validation ensures cluster is fully operational
✅ Post-provisioning configuration is important

## Next Steps

Now that you understand the provisioning flow, learn about:
- Resource scoping and sizing
- VPC networking integration
- Worker pool configuration
- Security and encryption options

---

**Navigation**: [← Back: Prerequisites and Planning](03-prerequisites-planning.md) | [Next: Resource Scoping →](05-resource-scoping.md)
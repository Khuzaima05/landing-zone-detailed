# Worker Pools Configuration

## Introduction

Worker pools are groups of worker nodes with identical configuration that run your application workloads. Understanding how to configure and manage worker pools is essential for building scalable, resilient OpenShift clusters. This chapter covers worker pool concepts, configuration options, and best practices.

## What Are Worker Pools?

### Definition

A **worker pool** is a collection of worker nodes that share:
- Same instance type (CPU, memory, storage)
- Same operating system
- Same zone distribution
- Same labels and taints
- Same configuration

**Think of it as**: A template that defines a group of identical workers that can be scaled together.

### Why Use Worker Pools?

**Benefits**:

1. **Consistency**: All nodes in a pool are identical
2. **Scalability**: Add/remove nodes as a group
3. **Workload Isolation**: Different pools for different workload types
4. **Simplified Management**: Configure once, apply to many
5. **Cost Optimization**: Right-size pools for specific workloads

**Example Scenario**:
```
Pool 1 (web-servers):
- Instance: bx2-4x16 (4 CPU, 16 GB RAM)
- Purpose: Frontend web applications
- Count: 6 nodes (2 per zone)

Pool 2 (api-servers):
- Instance: bx2-8x32 (8 CPU, 32 GB RAM)
- Purpose: Backend API services
- Count: 9 nodes (3 per zone)

Pool 3 (data-processing):
- Instance: mx2-16x128 (16 CPU, 128 GB RAM)
- Purpose: Data analytics workloads
- Count: 3 nodes (1 per zone)
```

## Default Worker Pool

### What Is the Default Pool?

Every OpenShift cluster has a **default worker pool** created during cluster provisioning.

**Characteristics**:
- Created automatically with cluster
- Cannot be deleted (while cluster exists)
- Can be resized or reconfigured
- Typically used for general workloads

**Default Configuration**:
```
Name: default
Instance Type: As specified during creation
Node Count: As specified during creation
Zones: All zones where cluster is deployed
Labels: Standard OpenShift labels
Taints: None (accepts all workloads)
```

### When to Use Default Pool

**Good For**:
- Small clusters with homogeneous workloads
- Development and testing
- Getting started quickly
- Simple deployments

**Not Ideal For**:
- Mixed workload types
- Specialized resource requirements
- Complex scaling needs
- Strict workload isolation

## Creating Additional Worker Pools

### Why Create Multiple Pools?

**Use Cases**:

1. **Workload Segregation**:
   - Separate compute-intensive from memory-intensive
   - Isolate production from development
   - Dedicated nodes for specific applications

2. **Resource Optimization**:
   - Right-size instances for workload needs
   - Avoid over-provisioning
   - Reduce costs

3. **Scaling Flexibility**:
   - Scale different workload types independently
   - Respond to specific demand patterns
   - Optimize resource utilization

4. **Compliance and Security**:
   - Isolate sensitive workloads
   - Meet regulatory requirements
   - Implement security zones

### Pool Configuration Options

**Instance Type**:
```
General Purpose (bx2):
- bx2-2x8, bx2-4x16, bx2-8x32, bx2-16x64
- Balanced CPU and memory
- Good for most workloads

Compute Optimized (cx2):
- cx2-2x4, cx2-4x8, cx2-8x16, cx2-16x32
- Higher CPU-to-memory ratio
- Web servers, batch processing

Memory Optimized (mx2):
- mx2-2x16, mx2-4x32, mx2-8x64, mx2-16x128
- Higher memory-to-CPU ratio
- Databases, caching, analytics

Very High Memory (vx2):
- vx2-2x28, vx2-4x56, vx2-8x112, vx2-16x224
- Extremely high memory
- In-memory databases, large datasets
```

**Node Count**:
```
Minimum: 1 node per zone
Recommended: 2+ nodes per zone for HA
Maximum: Depends on quota and requirements

Example for 3-zone cluster:
- 3 nodes total = 1 per zone
- 6 nodes total = 2 per zone
- 9 nodes total = 3 per zone
```

**Zone Distribution**:
```
Single Zone:
- All nodes in one zone
- Lower cost
- No zone-level HA

Multi-Zone:
- Nodes distributed across zones
- Higher availability
- Survives zone failures
```

## Worker Pool Sizing Strategies

### Strategy 1: Homogeneous Pools

**Approach**: All pools use same instance type

```
All Pools: bx2-8x32

Pros:
- Simple to manage
- Predictable performance
- Easy capacity planning

Cons:
- May waste resources
- Not optimized for specific workloads
- Higher costs
```

**When to Use**:
- Small to medium clusters
- Similar workload types
- Simplicity is priority

### Strategy 2: Workload-Specific Pools

**Approach**: Different pools for different workload types

```
Frontend Pool: bx2-4x16
- Web servers
- Static content
- Low resource needs

Backend Pool: bx2-8x32
- API servers
- Business logic
- Moderate resource needs

Database Pool: mx2-16x128
- Databases
- Caching
- High memory needs

Batch Pool: cx2-16x32
- Data processing
- Compute-intensive
- High CPU needs
```

**Pros**:
- Optimized resource usage
- Cost-effective
- Better performance

**Cons**:
- More complex
- Requires workload analysis
- More pools to manage

**When to Use**:
- Large clusters
- Diverse workload types
- Cost optimization important

### Strategy 3: Environment-Based Pools

**Approach**: Separate pools for different environments

```
Production Pool: bx2-16x64
- Production workloads
- High resources
- High availability

Staging Pool: bx2-8x32
- Pre-production testing
- Moderate resources
- Some redundancy

Development Pool: bx2-4x16
- Development and testing
- Lower resources
- Cost-optimized
```

**Pros**:
- Clear environment separation
- Different SLAs per environment
- Risk mitigation

**Cons**:
- Requires multiple clusters or namespaces
- More infrastructure
- Higher complexity

**When to Use**:
- Strict environment separation
- Different SLA requirements
- Compliance needs

## Node Labels and Selectors

### What Are Node Labels?

**Labels** are key-value pairs attached to nodes for:
- Identifying node characteristics
- Selecting nodes for pod placement
- Organizing and categorizing nodes

**Automatic Labels**:
```
topology.kubernetes.io/zone: us-south-1
topology.kubernetes.io/region: us-south
node.kubernetes.io/instance-type: bx2-8x32
kubernetes.io/os: linux
kubernetes.io/arch: amd64
```

### Custom Labels

**Adding Custom Labels**:
```
Examples:
- workload-type: frontend
- environment: production
- tier: web
- gpu: true
- ssd: true
```

**Use Cases**:
- Route specific workloads to specific nodes
- Implement multi-tenancy
- Separate workload types
- Hardware-specific requirements

### Node Selectors

**Using Node Selectors in Pods**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: frontend-app
spec:
  nodeSelector:
    workload-type: frontend
    environment: production
  containers:
  - name: app
    image: myapp:latest
```

**How It Works**:
1. Pod specifies required node labels
2. Scheduler finds nodes with matching labels
3. Pod is placed only on matching nodes
4. If no match, pod remains pending

## Node Taints and Tolerations

### What Are Taints?

**Taints** repel pods from nodes unless pods have matching tolerations.

**Taint Components**:
```
Key: workload-type
Value: database
Effect: NoSchedule

Meaning: Don't schedule pods here unless they tolerate this taint
```

**Taint Effects**:

**NoSchedule**:
- New pods without toleration won't be scheduled
- Existing pods remain running
- Most common effect

**PreferNoSchedule**:
- Try to avoid scheduling here
- Will schedule if no other option
- Soft preference

**NoExecute**:
- New pods won't be scheduled
- Existing pods without toleration are evicted
- Strongest effect

### Using Taints for Workload Isolation

**Example: Dedicated Database Pool**:

**Taint the nodes**:
```
Key: workload
Value: database
Effect: NoSchedule
```

**Add toleration to database pods**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: postgres
spec:
  tolerations:
  - key: workload
    operator: Equal
    value: database
    effect: NoSchedule
  nodeSelector:
    workload-type: database
  containers:
  - name: postgres
    image: postgres:14
```

**Result**:
- Only database pods run on database nodes
- Database nodes don't run other workloads
- Clear workload isolation

## Autoscaling Worker Pools

### Cluster Autoscaler

**What It Does**:
- Automatically adds nodes when pods can't be scheduled
- Removes nodes when underutilized
- Maintains min/max node counts
- Optimizes costs

**Configuration**:
```
Min Nodes: 3 (1 per zone)
Max Nodes: 15 (5 per zone)
Scale Up: When pods pending for 30 seconds
Scale Down: When node <50% utilized for 10 minutes
```

**How It Works**:

**Scale Up**:
1. Pod can't be scheduled (insufficient resources)
2. Autoscaler detects pending pod
3. Calculates required node size
4. Adds node to appropriate pool
5. Pod is scheduled on new node

**Scale Down**:
1. Node is underutilized
2. All pods can fit on other nodes
3. Node is cordoned (no new pods)
4. Pods are drained to other nodes
5. Node is removed

### Autoscaling Best Practices

**1. Set Appropriate Limits**:
```
Min: Enough for baseline workload
Max: Budget and quota limits

Example:
Min: 3 nodes (handle minimum load)
Max: 20 nodes (budget constraint)
```

**2. Use Pod Resource Requests**:
```yaml
resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi
```

**Why**: Autoscaler uses requests to calculate capacity

**3. Configure Pod Disruption Budgets**:
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: myapp-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: myapp
```

**Why**: Prevents autoscaler from disrupting too many pods

**4. Monitor Autoscaling Events**:
```bash
# View autoscaler logs
oc logs -n kube-system deployment/cluster-autoscaler

# Check node status
oc get nodes

# View events
oc get events --sort-by='.lastTimestamp'
```

## Worker Pool Lifecycle Management

### Adding Nodes to a Pool

**When to Add Nodes**:
- Increased workload demand
- Need more capacity
- Improving availability
- Preparing for traffic spike

**Considerations**:
- Nodes take 10-15 minutes to provision
- Plan ahead for known events
- Monitor resource utilization
- Consider autoscaling instead

### Removing Nodes from a Pool

**When to Remove Nodes**:
- Reduced workload demand
- Cost optimization
- Decommissioning workloads
- Downsizing cluster

**Safe Removal Process**:
1. **Cordon** node (prevent new pods)
2. **Drain** node (move pods to other nodes)
3. **Delete** node
4. **Verify** workloads running elsewhere

**Commands**:
```bash
# Cordon node
oc adm cordon <node-name>

# Drain node
oc adm drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Delete node
ibmcloud oc worker rm --cluster <cluster> --worker <worker-id>
```

### Replacing Nodes

**When to Replace**:
- Node hardware issues
- OS updates requiring reboot
- Changing instance type
- Refreshing cluster

**Replacement Strategies**:

**Rolling Replacement**:
```
1. Add new node
2. Drain old node
3. Remove old node
4. Repeat for each node
```

**Blue-Green Replacement**:
```
1. Create new pool with updated config
2. Migrate workloads to new pool
3. Remove old pool
```

## Multi-Pool Deployment Patterns

### Pattern 1: Tiered Architecture

```
Tier 1 (Frontend): bx2-4x16
- Web servers
- Static content
- 6 nodes (2 per zone)

Tier 2 (Application): bx2-8x32
- Business logic
- API servers
- 9 nodes (3 per zone)

Tier 3 (Data): mx2-16x128
- Databases
- Caching
- 3 nodes (1 per zone)
```

**Benefits**:
- Clear separation of concerns
- Optimized resource allocation
- Independent scaling

### Pattern 2: Workload Segregation

```
Pool 1 (Stateless): bx2-8x32
- Stateless applications
- Can be scaled aggressively
- 12 nodes (4 per zone)

Pool 2 (Stateful): mx2-16x128
- Databases
- Stateful applications
- 6 nodes (2 per zone)

Pool 3 (Batch): cx2-16x32
- Batch processing
- Scheduled jobs
- 3 nodes (1 per zone)
```

**Benefits**:
- Different scaling policies
- Workload isolation
- Resource optimization

### Pattern 3: Multi-Tenant

```
Pool 1 (Tenant A): bx2-8x32
- Dedicated to Tenant A
- Isolated resources
- 6 nodes (2 per zone)

Pool 2 (Tenant B): bx2-8x32
- Dedicated to Tenant B
- Isolated resources
- 6 nodes (2 per zone)

Pool 3 (Shared): bx2-4x16
- Shared services
- Common utilities
- 3 nodes (1 per zone)
```

**Benefits**:
- Tenant isolation
- Resource guarantees
- Simplified billing

## Monitoring Worker Pools

### Key Metrics

**Node-Level Metrics**:
```
- CPU utilization
- Memory utilization
- Disk usage
- Network throughput
- Pod count per node
```

**Pool-Level Metrics**:
```
- Total nodes
- Available capacity
- Resource requests vs. limits
- Autoscaling events
- Node failures
```

### Monitoring Commands

```bash
# View node resource usage
oc adm top nodes

# View node details
oc describe node <node-name>

# View pool information
ibmcloud oc worker-pool get --cluster <cluster> --worker-pool <pool>

# View all workers
ibmcloud oc workers --cluster <cluster>

# View worker pool zones
ibmcloud oc zone ls --worker-pool <pool> --cluster <cluster>
```

## Troubleshooting Worker Pools

### Common Issues

**Problem**: Nodes not joining cluster
**Possible Causes**:
- Network connectivity issues
- Security group blocking traffic
- Insufficient IAM permissions
- Quota exceeded

**Solutions**:
- Check security group rules
- Verify network configuration
- Review IAM policies
- Check resource quotas

**Problem**: Pods not scheduling on new nodes
**Possible Causes**:
- Node taints without tolerations
- Node selectors not matching
- Resource requests too high
- Node not ready

**Solutions**:
- Check node labels and taints
- Verify pod selectors and tolerations
- Review resource requests
- Check node status

**Problem**: Autoscaler not scaling
**Possible Causes**:
- Already at max nodes
- Pods don't have resource requests
- Pod disruption budgets blocking
- Autoscaler not enabled

**Solutions**:
- Check min/max settings
- Add resource requests to pods
- Review PDBs
- Verify autoscaler configuration

## Best Practices

### 1. Start Simple, Add Complexity

```
Phase 1: Single default pool
Phase 2: Add specialized pools as needed
Phase 3: Implement autoscaling
Phase 4: Fine-tune with labels and taints
```

### 2. Use Descriptive Names

```
Good:
- frontend-web-servers
- backend-api-services
- data-processing-workers

Bad:
- pool1
- workers
- misc
```

### 3. Document Pool Purpose

```
Pool: frontend-web-servers
Purpose: Serve web traffic for customer-facing applications
Instance: bx2-4x16
Min Nodes: 6 (2 per zone)
Max Nodes: 18 (6 per zone)
Labels: tier=frontend, environment=production
```

### 4. Monitor and Adjust

- Review utilization weekly
- Adjust sizes based on data
- Optimize costs continuously
- Plan for growth

### 5. Test Scaling

- Test autoscaling before production
- Verify pod disruption budgets
- Practice node replacement
- Document procedures

## Key Takeaways

✅ Worker pools group identical nodes for management
✅ Multiple pools enable workload segregation
✅ Labels and taints control pod placement
✅ Autoscaling optimizes capacity and costs
✅ Proper sizing balances performance and cost
✅ Regular monitoring ensures optimal operation

## Next Steps

Learn about:
- Operating system selection
- Security groups and network isolation
- KMS encryption configuration

---

**Navigation**: [← Back: VPC Networking Integration](06-vpc-networking-integration.md) | [Next: Operating System Selection →](08-operating-system-selection.md)
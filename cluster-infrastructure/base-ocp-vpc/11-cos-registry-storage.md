# Cloud Object Storage for Registry

## Introduction

OpenShift's internal container image registry requires persistent storage to store container images. IBM Cloud Object Storage (COS) provides scalable, durable, and cost-effective storage for the registry. This chapter explains how COS integrates with OpenShift, configuration options, and best practices.

## Understanding the Image Registry

### What Is the Image Registry?

The **internal image registry** is a built-in container registry that:
- Stores container images built within the cluster
- Provides images for pod deployment
- Integrates with OpenShift build processes
- Supports image streams and triggers

**Think of it as**: A private Docker Hub inside your cluster.

### Why Use COS for Registry Storage?

**Benefits**:
- **Scalability**: Unlimited storage capacity
- **Durability**: 99.999999999% (11 nines) durability
- **Availability**: Multi-zone redundancy
- **Cost-Effective**: Pay only for what you use
- **Performance**: High throughput for image pulls/pushes

**Alternatives**:
- Block storage (limited capacity, single zone)
- External registry (Docker Hub, Quay.io)
- No registry (pull from external only)

## Cloud Object Storage Fundamentals

### COS Architecture

**Components**:

**Bucket**:
- Container for objects
- Unique name globally
- Regional or cross-regional
- Access control policies

**Object**:
- Individual file (container image layer)
- Immutable once written
- Versioning optional
- Metadata attached

**Service Credentials**:
- HMAC keys for authentication
- Access key ID and secret
- Used by registry to access bucket

### Storage Classes

**Standard**:
```
Use Case: Frequently accessed data
Performance: High throughput
Cost: Higher storage, lower retrieval
Best For: Active registry
```

**Vault**:
```
Use Case: Infrequently accessed data
Performance: Lower throughput
Cost: Lower storage, higher retrieval
Best For: Archive images
```

**Cold Vault**:
```
Use Case: Rarely accessed data
Performance: Lowest throughput
Cost: Lowest storage, highest retrieval
Best For: Long-term archives
```

**Smart Tier**:
```
Use Case: Variable access patterns
Performance: Automatic optimization
Cost: Optimized based on usage
Best For: Unknown patterns
```

## Setting Up COS for Registry

### Prerequisites

**1. COS Instance**:
```
Create Cloud Object Storage instance
- Choose appropriate plan
- Select region
- Configure access policies
```

**2. Storage Bucket**:
```
Create bucket for registry
- Unique name (e.g., "ocp-prod-registry")
- Same region as cluster
- Standard storage class
- Private endpoint
```

**3. Service Credentials**:
```
Create HMAC credentials
- Enable HMAC
- Note access key ID
- Note secret access key
- Store securely
```

### Configuration Process

**Step 1: Create COS Resources**:
```bash
# Create COS instance
ibmcloud resource service-instance-create \
  ocp-registry-cos \
  cloud-object-storage \
  standard \
  global

# Create bucket
ibmcloud cos bucket-create \
  --bucket ocp-prod-registry \
  --ibm-service-instance-id <instance-id> \
  --region us-south

# Create HMAC credentials
ibmcloud resource service-key-create \
  registry-credentials \
  Writer \
  --instance-name ocp-registry-cos \
  --parameters '{"HMAC":true}'
```

**Step 2: Configure Registry Operator**:
```yaml
apiVersion: imageregistry.operator.openshift.io/v1
kind: Config
metadata:
  name: cluster
spec:
  storage:
    s3:
      bucket: ocp-prod-registry
      region: us-south
      regionEndpoint: s3.us-south.cloud-object-storage.appdomain.cloud
      virtualHostedStyle: false
  managementState: Managed
  replicas: 2
```

**Step 3: Create Secret with Credentials**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: image-registry-private-configuration
  namespace: openshift-image-registry
type: Opaque
stringData:
  credentials: |
    [default]
    aws_access_key_id = <access-key-id>
    aws_secret_access_key = <secret-access-key>
```

## Registry Configuration Options

### Replica Count

**Single Replica**:
```
Replicas: 1
Pros: Lower resource usage
Cons: No high availability
Use: Development, testing
```

**Multiple Replicas**:
```
Replicas: 2-3
Pros: High availability, load balancing
Cons: Higher resource usage
Use: Production
```

**Configuration**:
```yaml
spec:
  replicas: 2
```

### Storage Size Limits

**Quota Configuration**:
```yaml
spec:
  storage:
    s3:
      # No size limit with COS
      # Charged based on usage
```

**Monitoring Usage**:
```bash
# Check bucket size
ibmcloud cos bucket-get --bucket ocp-prod-registry --json | \
  jq '.Contents | map(.Size) | add'

# View registry metrics
oc get prometheus -n openshift-monitoring
```

### Image Pruning

**Why Prune**:
- Remove unused images
- Reduce storage costs
- Improve performance
- Clean up old builds

**Automatic Pruning**:
```yaml
apiVersion: imagepruner.operator.openshift.io/v1
kind: ImagePruner
metadata:
  name: cluster
spec:
  schedule: "0 0 * * *"  # Daily at midnight
  suspend: false
  keepTagRevisions: 3
  keepYoungerThan: 60m
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
```

**Manual Pruning**:
```bash
# Dry run
oc adm prune images --keep-tag-revisions=3 --keep-younger-than=60m

# Actual prune
oc adm prune images --keep-tag-revisions=3 --keep-younger-than=60m --confirm
```

## Access Control and Security

### Private vs Public Endpoints

**Private Endpoint** (Recommended):
```
Endpoint: s3.private.us-south.cloud-object-storage.appdomain.cloud
Access: Only from VPC
Security: Higher
Cost: No egress charges within region
```

**Public Endpoint**:
```
Endpoint: s3.us-south.cloud-object-storage.appdomain.cloud
Access: From internet
Security: Lower (requires strong auth)
Cost: Egress charges apply
```

**Configuration**:
```yaml
spec:
  storage:
    s3:
      regionEndpoint: s3.private.us-south.cloud-object-storage.appdomain.cloud
```

### Bucket Access Policies

**IAM Policies**:
```
Service: Cloud Object Storage
Resource: Specific bucket
Role: Writer (for registry)
```

**Bucket Policies**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "IBM": ["<service-instance-id>"]
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::ocp-prod-registry/*",
        "arn:aws:s3:::ocp-prod-registry"
      ]
    }
  ]
}
```

### Encryption

**Server-Side Encryption**:
```
Options:
1. IBM-managed keys (default)
2. Customer-managed keys (Key Protect/HPCS)

Configuration:
- Set during bucket creation
- All objects encrypted
- Transparent to registry
```

**In-Transit Encryption**:
```
Protocol: HTTPS/TLS
Automatic: Yes
Certificate: IBM-provided
```

## Performance Optimization

### Image Layer Caching

**How It Works**:
```
1. Image pushed to registry
2. Layers stored as objects in COS
3. Subsequent pulls check local cache
4. Only missing layers downloaded
5. Faster deployment times
```

**Benefits**:
- Reduced network traffic
- Faster pod startup
- Lower COS costs
- Better user experience

### Multi-Zone Redundancy

**COS Replication**:
```
Automatic: Yes
Zones: All zones in region
Consistency: Eventual
Durability: 11 nines
```

**Registry Pods**:
```
Deployment: Across zones
Load Balancing: Automatic
Failover: Automatic
```

### Network Performance

**Private Endpoint Benefits**:
```
Latency: Lower (no internet hop)
Bandwidth: Higher
Cost: No egress charges
Security: Better
```

**Optimization Tips**:
- Use private endpoints
- Deploy registry pods in multiple zones
- Enable image layer caching
- Prune unused images regularly

## Monitoring and Troubleshooting

### Registry Health Checks

**Check Registry Status**:
```bash
# View registry pods
oc get pods -n openshift-image-registry

# Check registry operator
oc get clusteroperator image-registry

# View registry configuration
oc get configs.imageregistry.operator.openshift.io/cluster -o yaml
```

**Common Issues**:

**Problem**: Registry pods not starting
**Check**:
```bash
# View pod logs
oc logs -n openshift-image-registry deployment/image-registry

# Check events
oc get events -n openshift-image-registry

# Verify COS credentials
oc get secret image-registry-private-configuration \
  -n openshift-image-registry -o yaml
```

**Problem**: Cannot push images
**Check**:
```bash
# Test registry access
oc new-project test
oc new-build --name=test --binary
oc start-build test --from-dir=. --follow

# Check COS bucket access
ibmcloud cos bucket-head --bucket ocp-prod-registry
```

### COS Metrics

**Storage Usage**:
```bash
# View bucket size
ibmcloud cos bucket-get --bucket ocp-prod-registry

# List objects
ibmcloud cos objects --bucket ocp-prod-registry

# Check object count
ibmcloud cos objects --bucket ocp-prod-registry | wc -l
```

**Access Logs**:
```
Enable: Activity Tracker
View: Access patterns
Analyze: Performance issues
Alert: Unusual activity
```

## Cost Management

### Understanding COS Costs

**Storage Costs**:
```
Standard: $0.023 per GB/month
Vault: $0.010 per GB/month
Cold Vault: $0.004 per GB/month

Example (100 GB):
Standard: $2.30/month
Vault: $1.00/month
Cold Vault: $0.40/month
```

**Request Costs**:
```
PUT/POST: $0.005 per 1,000 requests
GET: $0.0004 per 1,000 requests
DELETE: Free

Example (10,000 pushes, 100,000 pulls):
PUT: $0.05
GET: $0.04
Total: $0.09
```

**Data Transfer**:
```
Inbound: Free
Outbound (public): $0.09 per GB
Outbound (private): Free within region

Example (10 GB outbound via private):
Cost: $0
```

### Cost Optimization Strategies

**1. Use Private Endpoints**:
```
Benefit: No egress charges
Savings: $0.09 per GB transferred
Implementation: Configure private endpoint
```

**2. Implement Image Pruning**:
```
Benefit: Reduce storage usage
Savings: Proportional to pruned data
Implementation: Automated pruning schedule
```

**3. Use Appropriate Storage Class**:
```
Active images: Standard
Archive images: Vault or Cold Vault
Savings: Up to 80% for archived data
```

**4. Monitor and Alert**:
```
Set up: Usage alerts
Monitor: Growth trends
Optimize: Based on patterns
Review: Monthly
```

## Backup and Disaster Recovery

### COS Built-in Durability

**Durability**: 99.999999999% (11 nines)
**Replication**: Automatic across zones
**Versioning**: Optional
**Cross-Region**: Available

### Backup Strategies

**Cross-Region Replication**:
```
Setup: Replicate to different region
Benefit: Geographic redundancy
Cost: Additional storage charges
Use: Critical production registries
```

**Bucket Versioning**:
```
Enable: Object versioning
Benefit: Protect against accidental deletion
Cost: Storage for all versions
Use: Change tracking needed
```

**Export/Import**:
```
Export: Registry images to external registry
Import: From external registry
Benefit: Platform independence
Use: Migration scenarios
```

### Recovery Procedures

**Bucket Corruption**:
```
1. Create new bucket
2. Update registry configuration
3. Re-push critical images
4. Verify functionality
```

**Credential Compromise**:
```
1. Rotate HMAC credentials
2. Update registry secret
3. Restart registry pods
4. Verify access
```

**Region Outage**:
```
1. Switch to backup region
2. Update registry configuration
3. Re-deploy critical applications
4. Monitor recovery
```

## Best Practices

### Security

✅ Use private endpoints
✅ Enable encryption at rest
✅ Rotate credentials regularly
✅ Implement least privilege access
✅ Monitor access logs
✅ Use IAM policies

### Performance

✅ Deploy registry in multiple zones
✅ Use private endpoints
✅ Enable image layer caching
✅ Monitor performance metrics
✅ Optimize network paths

### Cost Management

✅ Implement automated pruning
✅ Use appropriate storage classes
✅ Monitor usage and costs
✅ Set up billing alerts
✅ Review costs monthly

### Operations

✅ Monitor registry health
✅ Automate backup procedures
✅ Document recovery processes
✅ Test disaster recovery
✅ Keep credentials secure

## Key Takeaways

✅ COS provides scalable, durable registry storage
✅ Private endpoints improve security and reduce costs
✅ Image pruning is essential for cost control
✅ Multiple replicas provide high availability
✅ Monitoring and alerting prevent issues
✅ Proper access control ensures security

## Next Steps

Learn about:
- Cluster endpoint configuration
- Add-ons and extensions
- Autoscaling configuration

---

**Navigation**: [← Back: KMS Encryption](10-kms-encryption.md) | [Next: Cluster Endpoints →](12-cluster-endpoints.md)
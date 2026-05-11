# Resource Scoping

## Introduction

Resource scoping involves organizing and sizing your OpenShift cluster resources appropriately. This includes choosing the right resource groups, naming conventions, tagging strategies, and determining the appropriate size for your cluster components. Proper resource scoping ensures efficient management, cost control, and operational clarity.

## Resource Groups

### What Are Resource Groups?

A **resource group** is a logical container that organizes related IBM Cloud resources. Think of it as a folder that groups resources for management, access control, and billing purposes.

**Key Characteristics**:
- Resources belong to exactly one resource group
- Cannot be moved between resource groups after creation
- Used for IAM access control
- Used for cost tracking and billing
- Helps organize resources by project, environment, or team

### Choosing a Resource Group Strategy

#### Strategy 1: Environment-Based

Organize by deployment environment:

```
Resource Groups:
├── production-infrastructure
│   └── Production OpenShift clusters
├── staging-infrastructure
│   └── Staging/QA clusters
└── development-infrastructure
    └── Development clusters
```

**Pros**:
- Clear separation of environments
- Easy to apply different access controls
- Simplified cost tracking per environment
- Reduces risk of accidental changes to production

**Cons**:
- May need multiple resource groups
- More complex if you have many environments

**Best For**: Organizations with strict environment separation requirements

#### Strategy 2: Team-Based

Organize by team or department:

```
Resource Groups:
├── team-alpha-resources
│   └── Team Alpha's clusters
├── team-beta-resources
│   └── Team Beta's clusters
└── platform-team-resources
    └── Shared infrastructure
```

**Pros**:
- Clear ownership
- Team-specific access control
- Easy cost allocation to teams
- Supports multi-tenancy

**Cons**:
- Harder to separate environments
- May need coordination for shared resources

**Best For**: Organizations with autonomous teams

#### Strategy 3: Project-Based

Organize by project or application:

```
Resource Groups:
├── ecommerce-platform
│   └── E-commerce application clusters
├── data-analytics
│   └── Analytics clusters
└── mobile-backend
    └── Mobile app backend clusters
```

**Pros**:
- Clear project boundaries
- Easy to track project costs
- Simplified project lifecycle management
- Good for project-based billing

**Cons**:
- May proliferate resource groups
- Harder to manage shared infrastructure

**Best For**: Project-based organizations or consulting firms

#### Strategy 4: Hybrid Approach

Combine multiple strategies:

```
Resource Groups:
├── prod-ecommerce
├── prod-analytics
├── staging-ecommerce
├── staging-analytics
├── dev-shared
└── platform-shared
```

**Pros**:
- Flexible and adaptable
- Balances different needs
- Can evolve over time

**Cons**:
- More complex to manage
- Requires clear naming conventions

**Best For**: Large organizations with complex requirements

### Resource Group Best Practices

**1. Plan Before Creating**:
- Resource groups cannot be renamed
- Resources cannot be moved between groups
- Deletion requires removing all resources first

**2. Use Descriptive Names**:
```
Good:
- production-openshift-clusters
- dev-team-alpha-infrastructure
- staging-ecommerce-platform

Bad:
- rg1
- test
- misc
```

**3. Document Your Strategy**:
- Create a resource group naming guide
- Document which resources go where
- Share with team members

**4. Limit the Number**:
- Don't create too many resource groups
- Balance organization with manageability
- Consider future growth

**5. Align with IAM**:
- Resource groups are IAM boundaries
- Plan access control needs
- Consider who needs access to what

## Naming Conventions

### Why Naming Matters

Good naming conventions provide:
- **Clarity**: Understand resource purpose at a glance
- **Organization**: Easy to find and group resources
- **Automation**: Consistent names enable scripting
- **Cost Tracking**: Tag-based billing and reporting
- **Troubleshooting**: Quickly identify related resources

### Cluster Naming Convention

**Recommended Pattern**:
```
<environment>-<purpose>-<region>-<instance>

Examples:
- prod-ecommerce-us-south-01
- staging-api-eu-de-01
- dev-shared-us-east-01
```

**Components Explained**:

**Environment** (required):
- `prod` - Production
- `staging` - Staging/QA
- `dev` - Development
- `test` - Testing
- `demo` - Demonstrations

**Purpose** (required):
- Application or workload type
- Examples: `ecommerce`, `api`, `analytics`, `mobile`
- Keep it short but descriptive

**Region** (required):
- IBM Cloud region code
- Examples: `us-south`, `us-east`, `eu-de`, `eu-gb`
- Helps identify cluster location

**Instance** (optional):
- Sequential number if multiple clusters
- Examples: `01`, `02`, `03`
- Useful for blue-green deployments

### Worker Pool Naming

**Pattern**:
```
<workload-type>-<instance-type>-<sequence>

Examples:
- general-bx2-8x32-01
- compute-cx2-16x32-01
- memory-mx2-32x256-01
```

**Why This Works**:
- Identifies workload type
- Shows instance size
- Allows multiple pools of same type

### Subnet Naming

**Pattern**:
```
<cluster-name>-<zone>-<purpose>

Examples:
- prod-ecommerce-us-south-1-workers
- prod-ecommerce-us-south-2-workers
- prod-ecommerce-us-south-3-workers
```

### Security Group Naming

**Pattern**:
```
<cluster-name>-<component>-sg

Examples:
- prod-ecommerce-control-plane-sg
- prod-ecommerce-workers-sg
- prod-ecommerce-loadbalancer-sg
```

### Naming Best Practices

**1. Be Consistent**:
- Use the same pattern everywhere
- Document your conventions
- Enforce through automation

**2. Use Lowercase**:
- Easier to type
- Avoids case-sensitivity issues
- More readable in URLs

**3. Use Hyphens, Not Underscores**:
- More readable: `my-cluster` vs `my_cluster`
- Works better in DNS
- Industry standard

**4. Keep It Short**:
- Some services have length limits
- Easier to type and remember
- But not so short it's cryptic

**5. Avoid Special Characters**:
- Stick to alphanumeric and hyphens
- Avoid spaces, slashes, dots (except in domains)
- Prevents parsing issues

**6. Include Key Information**:
- Environment (critical for safety)
- Purpose (what it's for)
- Location (where it runs)

## Tagging Strategy

### What Are Tags?

Tags are key-value pairs attached to resources for:
- Organization and categorization
- Cost allocation and tracking
- Automation and filtering
- Compliance and governance

**Tag Types in IBM Cloud**:

**User Tags**:
- Created by users
- Flexible key-value pairs
- Used for organization
- Example: `env:production`, `team:alpha`

**Access Management Tags**:
- Used for access control
- Integrated with IAM
- Control who can access resources
- Example: `project:confidential`

**Service Tags**:
- Automatically added by IBM Cloud
- Track service-specific metadata
- Cannot be modified by users

### Recommended Tagging Scheme

#### Core Tags (Apply to All Resources)

**Environment**:
```
Key: env
Values: production, staging, development, test
Example: env:production
```

**Owner/Team**:
```
Key: team
Values: team name or email
Example: team:platform-engineering
```

**Cost Center**:
```
Key: cost-center
Values: department or project code
Example: cost-center:eng-1234
```

**Application**:
```
Key: app
Values: application name
Example: app:ecommerce
```

#### Optional Tags

**Compliance**:
```
Key: compliance
Values: hipaa, pci-dss, sox, gdpr
Example: compliance:hipaa
```

**Backup**:
```
Key: backup
Values: daily, weekly, none
Example: backup:daily
```

**Monitoring**:
```
Key: monitoring
Values: critical, standard, minimal
Example: monitoring:critical
```

**Lifecycle**:
```
Key: lifecycle
Values: permanent, temporary, experimental
Example: lifecycle:permanent
```

### Tagging Best Practices

**1. Define Standard Tags**:
```
Required Tags:
- env (environment)
- team (owner)
- cost-center (billing)

Optional Tags:
- app (application)
- compliance (requirements)
- backup (policy)
```

**2. Use Consistent Values**:
```
Good:
- env:production (always lowercase)
- env:staging
- env:development

Bad:
- env:Production (mixed case)
- env:PROD (abbreviation)
- env:prod-environment (too verbose)
```

**3. Automate Tagging**:
```hcl
# In Terraform
tags = [
  "env:${var.environment}",
  "team:${var.team_name}",
  "cost-center:${var.cost_center}",
  "app:${var.application_name}"
]
```

**4. Document Tag Meanings**:
- Create a tagging policy document
- Explain each tag's purpose
- Provide examples
- Share with team

**5. Audit Tags Regularly**:
- Check for missing tags
- Verify tag values are correct
- Remove obsolete tags
- Update as needed

## Cluster Sizing

### Determining Cluster Size

Cluster sizing involves choosing:
- Number of control plane nodes
- Number and size of worker nodes
- Storage capacity
- Network bandwidth

### Control Plane Sizing

**Standard Configuration**:
```
Production: 3 control plane nodes
- Provides high availability
- Survives single node failure
- Recommended for all production clusters

Development: 1 control plane node
- Lower cost
- Acceptable for non-critical environments
- No high availability
```

**Control Plane Instance Types**:

**Small Clusters** (< 50 workers):
```
Instance: bx2-4x16
- 4 vCPU
- 16 GB RAM
- Cost: ~$150/month per node
```

**Medium Clusters** (50-100 workers):
```
Instance: bx2-8x32
- 8 vCPU
- 32 GB RAM
- Cost: ~$300/month per node
```

**Large Clusters** (> 100 workers):
```
Instance: bx2-16x64
- 16 vCPU
- 64 GB RAM
- Cost: ~$600/month per node
```

### Worker Node Sizing

**Factors to Consider**:

1. **Application Requirements**:
   - CPU needs per application
   - Memory needs per application
   - Number of applications

2. **Pod Density**:
   - How many pods per node?
   - Typical: 30-50 pods per node
   - Maximum: 110 pods per node (Kubernetes limit)

3. **Resource Overhead**:
   - System pods: 10-15% of resources
   - Monitoring/logging: 5-10%
   - Buffer: 20-30%

4. **Failure Domains**:
   - Smaller nodes = more failure domains
   - Larger nodes = fewer but bigger failures

**Worker Node Instance Types**:

**General Purpose (bx2)**:
```
bx2-2x8:   2 vCPU,  8 GB RAM  - Dev/test
bx2-4x16:  4 vCPU, 16 GB RAM  - Small workloads
bx2-8x32:  8 vCPU, 32 GB RAM  - Standard workloads
bx2-16x64: 16 vCPU, 64 GB RAM - Large workloads
```

**Compute Optimized (cx2)**:
```
cx2-2x4:   2 vCPU,  4 GB RAM  - CPU-intensive
cx2-4x8:   4 vCPU,  8 GB RAM  - Web servers
cx2-8x16:  8 vCPU, 16 GB RAM  - Batch processing
cx2-16x32: 16 vCPU, 32 GB RAM - High-performance compute
```

**Memory Optimized (mx2)**:
```
mx2-2x16:   2 vCPU,  16 GB RAM - Memory-intensive
mx2-4x32:   4 vCPU,  32 GB RAM - Databases
mx2-8x64:   8 vCPU,  64 GB RAM - Caching
mx2-16x128: 16 vCPU, 128 GB RAM - Large databases
```

### Sizing Examples

**Small Development Cluster**:
```
Purpose: Development and testing
Workload: 10-20 small applications

Control Plane:
- 1 node × bx2-4x16
- Cost: ~$150/month

Workers:
- 3 nodes × bx2-4x16
- Cost: ~$450/month

Total: ~$600/month
```

**Medium Production Cluster**:
```
Purpose: Production workloads
Workload: 30-50 applications

Control Plane:
- 3 nodes × bx2-8x32
- Cost: ~$900/month

Workers:
- 9 nodes × bx2-8x32 (3 per zone)
- Cost: ~$2,700/month

Total: ~$3,600/month
```

**Large Production Cluster**:
```
Purpose: High-traffic production
Workload: 100+ applications

Control Plane:
- 3 nodes × bx2-16x64
- Cost: ~$1,800/month

Workers:
- 18 nodes × bx2-16x64 (6 per zone)
- Cost: ~$10,800/month

Total: ~$12,600/month
```

### Capacity Planning Formula

**Step 1: Calculate Application Needs**:
```
Total CPU = (Number of apps) × (CPU per app) × (Replicas per app)
Total Memory = (Number of apps) × (Memory per app) × (Replicas per app)

Example:
- 30 applications
- Each needs 1 CPU and 2 GB RAM
- 3 replicas each
- Total: 30 × 1 × 3 = 90 CPU
- Total: 30 × 2 × 3 = 180 GB RAM
```

**Step 2: Add Overhead**:
```
CPU with overhead = Total CPU × 1.5
Memory with overhead = Total Memory × 1.5

Example:
- CPU: 90 × 1.5 = 135 CPU
- Memory: 180 × 1.5 = 270 GB RAM
```

**Step 3: Calculate Nodes Needed**:
```
Nodes = max(
  CPU with overhead / CPU per node,
  Memory with overhead / Memory per node
)

Example (using bx2-8x32):
- CPU: 135 / 8 = 17 nodes
- Memory: 270 / 32 = 9 nodes
- Use higher: 17 nodes
```

**Step 4: Add Buffer and Round Up**:
```
Final nodes = Nodes × 1.2 (20% buffer)

Example:
- 17 × 1.2 = 20.4
- Round up to 21 nodes
- Distribute across 3 zones: 7 per zone
```

## Storage Sizing

### Persistent Volume Capacity

**Estimate Storage Needs**:

1. **Application Data**:
   - Database storage
   - User uploads
   - Application state

2. **Logs and Metrics**:
   - Application logs
   - System logs
   - Metrics data

3. **Backups**:
   - Database backups
   - Configuration backups
   - Disaster recovery

**Example Calculation**:
```
Application Data:
- 10 databases × 50 GB each = 500 GB
- User uploads: 200 GB
- Application state: 50 GB
Subtotal: 750 GB

Logs and Metrics:
- Application logs: 100 GB
- System logs: 50 GB
- Metrics: 50 GB
Subtotal: 200 GB

Backups:
- Database backups: 500 GB
- Config backups: 10 GB
Subtotal: 510 GB

Total: 1,460 GB ≈ 1.5 TB
Add 30% growth: 1.5 × 1.3 = 2 TB
```

### Object Storage for Registry

**Image Registry Sizing**:
```
Factors:
- Number of applications
- Images per application
- Image size
- Number of versions kept

Example:
- 50 applications
- 3 images per app (frontend, backend, worker)
- 500 MB average per image
- Keep 10 versions
- Total: 50 × 3 × 500 MB × 10 = 750 GB
```

## Cost Optimization

### Right-Sizing Strategies

**1. Start Small, Scale Up**:
- Begin with minimum viable cluster
- Monitor actual usage
- Add capacity based on data
- Avoid over-provisioning

**2. Use Appropriate Instance Types**:
- Match instance type to workload
- Don't use memory-optimized for CPU-intensive apps
- Consider compute-optimized for web servers

**3. Implement Autoscaling**:
- Scale workers based on demand
- Reduce capacity during off-hours
- Set appropriate min/max limits

**4. Use Reserved Capacity**:
- Commit to 1 or 3 years for discounts
- Up to 30-40% savings
- Only for stable, predictable workloads

**5. Optimize Storage**:
- Use appropriate storage tiers
- Clean up unused volumes
- Implement lifecycle policies for object storage

### Cost Monitoring

**Set Up Budgets**:
```
Monthly Budget: $5,000
- Compute: $3,500 (70%)
- Storage: $750 (15%)
- Network: $500 (10%)
- Services: $250 (5%)
```

**Track Costs by Tag**:
- Use tags for cost allocation
- Generate reports by environment
- Identify cost optimization opportunities

**Set Up Alerts**:
- Alert when approaching budget
- Alert on unusual spending
- Review costs monthly

## Key Takeaways

✅ Resource groups organize resources for management and billing
✅ Naming conventions improve clarity and automation
✅ Tags enable cost tracking and organization
✅ Proper sizing balances performance and cost
✅ Capacity planning prevents resource shortages
✅ Cost optimization requires ongoing monitoring

## Next Steps

Now that you understand resource scoping, learn about:
- VPC networking integration
- Worker pool configuration
- Security and encryption options

---

**Navigation**: [← Back: Cluster Provisioning Flow](04-cluster-provisioning-flow.md) | [Next: VPC Networking Integration →](06-vpc-networking-integration.md)
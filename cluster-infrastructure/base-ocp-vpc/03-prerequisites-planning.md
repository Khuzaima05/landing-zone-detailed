# Prerequisites and Planning

## Introduction

Before deploying an OpenShift cluster on IBM Cloud VPC, you need to prepare your environment and make several important planning decisions. This chapter guides you through everything you need to have in place and helps you plan your cluster configuration.

## IBM Cloud Account Prerequisites

### 1. IBM Cloud Account

**What You Need**:
- An active IBM Cloud account
- Pay-as-you-go or subscription billing (free tier is insufficient)
- Verified email address
- Valid payment method on file

**Why It Matters**:
OpenShift clusters require significant resources and cannot run on free tier accounts. You'll be charged for:
- Virtual server instances (control plane and workers)
- Block storage volumes
- Load balancers
- Network traffic
- Object storage

**Getting Started**:
1. Visit [cloud.ibm.com](https://cloud.ibm.com)
2. Create an account or sign in
3. Upgrade to pay-as-you-go if needed
4. Add payment information

### 2. Required Permissions

You need specific IBM Cloud IAM permissions to create and manage OpenShift clusters.

**Minimum Required Roles**:

**For VPC Infrastructure**:
- **Editor** role on VPC Infrastructure Services
- Allows creating VPCs, subnets, security groups

**For OpenShift Clusters**:
- **Administrator** role on Kubernetes Service
- Allows creating and managing clusters

**For Resource Groups**:
- **Viewer** role on the target resource group
- Allows viewing and organizing resources

**For Key Management**:
- **Manager** role on Key Protect or HPCS (if using encryption)
- Allows creating and managing encryption keys

**For Object Storage**:
- **Manager** role on Cloud Object Storage
- Allows creating buckets for image registry

**Checking Your Permissions**:
1. Go to IBM Cloud Console
2. Navigate to "Manage" → "Access (IAM)"
3. Click "Users" and select your user
4. Review "Access policies"

**If You Don't Have Permissions**:
- Contact your IBM Cloud account administrator
- Request the necessary roles
- Provide business justification for access

### 3. API Key

An API key is required for Terraform to interact with IBM Cloud on your behalf.

**Creating an API Key**:
1. Go to IBM Cloud Console
2. Navigate to "Manage" → "Access (IAM)"
3. Click "API keys" in the left sidebar
4. Click "Create an IBM Cloud API key"
5. Enter a name (e.g., "terraform-openshift")
6. Add a description
7. Click "Create"
8. **Important**: Copy and save the API key immediately (you can't retrieve it later)

**Storing Your API Key Securely**:
```bash
# Never commit API keys to version control!
# Store in environment variable
export IBMCLOUD_API_KEY="your-api-key-here"

# Or use a secure secrets manager
# Or store in Terraform Cloud/Enterprise
```

**Security Best Practices**:
- ✅ Use separate API keys for different environments
- ✅ Rotate API keys regularly (every 90 days)
- ✅ Use service IDs for automation (not personal API keys)
- ✅ Store keys in secrets management systems
- ❌ Never commit keys to Git repositories
- ❌ Never share keys via email or chat

## Infrastructure Prerequisites

### 1. VPC Network

You need an existing VPC or will create one as part of the deployment.

**Option A: Use Existing VPC**:
If you already have a VPC:
- Must have subnets in the zones where you want cluster nodes
- Subnets must have sufficient IP addresses available
- Must allow required network traffic (see security groups section)

**Option B: Create New VPC**:
The module can create a new VPC:
- Automatically creates subnets in specified zones
- Configures appropriate CIDR blocks
- Sets up routing and gateways

**VPC Planning Considerations**:

**CIDR Block Selection**:
```
Recommended: 10.0.0.0/16 (65,536 IP addresses)
- Allows for growth
- Supports multiple subnets
- Avoids conflicts with common networks

Alternative: 172.16.0.0/16 or 192.168.0.0/16
- Use if 10.0.0.0/16 conflicts with existing networks
```

**Subnet Planning**:
```
Zone 1: 10.0.1.0/24 (256 IPs)
Zone 2: 10.0.2.0/24 (256 IPs)
Zone 3: 10.0.3.0/24 (256 IPs)

Each subnet needs:
- Control plane nodes: 1-3 IPs
- Worker nodes: Variable (depends on cluster size)
- Load balancers: 1-2 IPs per load balancer
- Future growth: Reserve 30-50% capacity
```

**IP Address Calculation**:
```
Per worker node: 1 IP
Per control plane node: 1 IP
Per load balancer: 1-2 IPs
Reserved by IBM Cloud: ~5 IPs per subnet

Example for 10 workers per zone:
- Workers: 10 IPs
- Control plane: 1 IP
- Load balancers: 2 IPs
- Reserved: 5 IPs
- Total: 18 IPs per zone
- Recommended subnet: /24 (256 IPs) for growth
```

### 2. Resource Group

Resource groups organize your IBM Cloud resources.

**What Is a Resource Group?**:
- Logical container for related resources
- Used for access control and billing
- Cannot be changed after resource creation

**Choosing a Resource Group**:

**Option 1: Use Default**:
- Every account has a "Default" resource group
- Simple for getting started
- May become cluttered over time

**Option 2: Create Dedicated Group**:
```
Examples:
- "production-openshift"
- "dev-clusters"
- "team-alpha-infrastructure"
```

**Best Practices**:
- Separate production and non-production
- Align with organizational structure
- Use consistent naming conventions
- Consider billing and cost tracking needs

### 3. SSH Key

SSH keys are required for accessing cluster nodes (though direct node access is rarely needed).

**Creating an SSH Key Pair**:
```bash
# Generate new SSH key pair
ssh-keygen -t rsa -b 4096 -C "openshift-cluster" -f ~/.ssh/openshift_rsa

# This creates:
# - Private key: ~/.ssh/openshift_rsa (keep secure!)
# - Public key: ~/.ssh/openshift_rsa.pub (upload to IBM Cloud)
```

**Adding SSH Key to IBM Cloud**:
1. Go to IBM Cloud Console
2. Navigate to "VPC Infrastructure" → "SSH keys"
3. Click "Create"
4. Enter a name (e.g., "openshift-access")
5. Select your region
6. Paste the contents of your public key file
7. Click "Add SSH key"

**Security Notes**:
- Private key stays on your machine
- Public key is uploaded to IBM Cloud
- IBM Cloud injects public key into cluster nodes
- You use private key to SSH to nodes (if needed)

## OpenShift Version Selection

### Understanding OpenShift Versions

OpenShift versions follow semantic versioning: `MAJOR.MINOR.PATCH`

**Example**: OpenShift 4.12.3
- **Major**: 4 (major release)
- **Minor**: 12 (feature release)
- **Patch**: 3 (bug fix release)

**Version Support Lifecycle**:
- New minor versions released every ~4 months
- Each version supported for ~12-18 months
- Security patches provided during support period
- Extended Update Support (EUS) available for select versions

### Choosing a Version

**Latest Stable Version**:
- ✅ Most recent features
- ✅ Latest security patches
- ✅ Best performance improvements
- ⚠️ May have undiscovered issues
- ⚠️ Requires testing with your applications

**Previous Stable Version**:
- ✅ Well-tested and proven
- ✅ More community knowledge
- ✅ Fewer surprises
- ⚠️ Missing latest features
- ⚠️ Shorter remaining support window

**EUS Version** (for production):
- ✅ Extended support period
- ✅ Stability focused
- ✅ Predictable upgrade path
- ⚠️ Fewer feature updates
- ⚠️ May be several versions behind latest

**Recommendation for Beginners**:
Start with the latest stable version unless:
- Your organization has specific version requirements
- You need compatibility with specific software
- You're matching an existing cluster version

### Version Compatibility

**Application Compatibility**:
- Check if your applications support the OpenShift version
- Review operator compatibility
- Test in non-production first

**Tool Compatibility**:
- `oc` CLI version should match cluster version
- Terraform provider version must support the OpenShift version
- CI/CD tools may have version requirements

## Cluster Sizing and Planning

### Determining Cluster Size

**Questions to Answer**:

1. **How many applications will run on the cluster?**
   - Each application needs CPU and memory
   - Consider current and future applications

2. **What are the resource requirements?**
   - CPU cores per application
   - Memory per application
   - Storage needs

3. **What's the expected traffic/load?**
   - Requests per second
   - Peak vs. average load
   - Growth projections

4. **What are your availability requirements?**
   - Can you tolerate downtime?
   - Need for multi-zone deployment?
   - Recovery time objectives (RTO)

### Sizing Examples

**Small Development Cluster**:
```
Purpose: Development and testing
Workload: 5-10 small applications

Configuration:
- Control Plane: 3 nodes (bx2-4x16)
- Workers: 3 nodes (bx2-4x16)
- Zones: 1 (single zone acceptable for dev)
- Total: 6 nodes

Cost: ~$500-700/month
```

**Medium Production Cluster**:
```
Purpose: Production workloads
Workload: 20-30 applications

Configuration:
- Control Plane: 3 nodes (bx2-8x32)
- Workers: 9 nodes (bx2-8x32) - 3 per zone
- Zones: 3 (multi-zone for HA)
- Total: 12 nodes

Cost: ~$2,000-2,500/month
```

**Large Production Cluster**:
```
Purpose: High-traffic production
Workload: 50+ applications

Configuration:
- Control Plane: 3 nodes (bx2-16x64)
- Workers: 15-30 nodes (bx2-16x64) - 5-10 per zone
- Zones: 3 (multi-zone for HA)
- Total: 18-33 nodes

Cost: ~$5,000-10,000/month
```

### Capacity Planning Formula

**Basic Calculation**:
```
Total CPU needed = (Apps × CPU per app) × 1.5 (overhead)
Total Memory needed = (Apps × Memory per app) × 1.5 (overhead)

Example:
- 20 applications
- Each needs 2 CPU cores and 4 GB RAM
- Total: 20 × 2 × 1.5 = 60 CPU cores
- Total: 20 × 4 × 1.5 = 120 GB RAM

Worker nodes needed:
- Using bx2-8x32 (8 CPU, 32 GB RAM)
- CPU: 60 / 8 = 8 nodes
- Memory: 120 / 32 = 4 nodes
- Use higher number: 8 nodes minimum
- Add 20% buffer: 10 nodes recommended
```

**Overhead Factors**:
- System pods: ~10-15% of resources
- Monitoring and logging: ~5-10% of resources
- Buffer for spikes: ~20-30% of resources
- Total overhead: ~35-55% above application needs

## Network Planning

### Public vs. Private Endpoints

**Public Endpoints**:
- Cluster API accessible from internet
- Easier for remote access
- Simpler for CI/CD pipelines
- Less secure (requires strong authentication)

**Private Endpoints**:
- Cluster API only accessible from VPC or VPN
- More secure
- Requires VPN or Direct Link for remote access
- Recommended for production

**Recommendation**:
- Development: Public endpoints acceptable
- Production: Private endpoints strongly recommended
- Can enable both and restrict public access with allowlists

### Ingress and Egress Planning

**Ingress (Incoming Traffic)**:
- How will users access applications?
- Public load balancer or private?
- Domain names and DNS setup
- SSL/TLS certificates needed

**Egress (Outgoing Traffic)**:
- Does cluster need internet access?
- Which external services will be accessed?
- Firewall rules needed
- Proxy requirements

### DNS Planning

**Cluster DNS**:
- Cluster gets a default subdomain
- Format: `<cluster-name>.<region>.containers.appdomain.cloud`
- Used for default routes

**Custom Domains**:
- You can use your own domain names
- Requires DNS configuration
- Need SSL certificates for custom domains

**Example**:
```
Default: myapp-mycluster.us-south.containers.appdomain.cloud
Custom: myapp.example.com
```

## Security Planning

### Encryption Requirements

**Data at Rest**:
- etcd encryption (cluster state)
- Persistent volume encryption
- Requires Key Protect or HPCS

**Data in Transit**:
- TLS for API server
- TLS for application traffic
- Certificate management

**Decision Points**:
- Compliance requirements (HIPAA, PCI-DSS, etc.)
- Data sensitivity
- Performance impact (minimal for modern encryption)
- Key management complexity

### Access Control Planning

**Who Needs Access?**:
- Developers: Deploy applications
- Operators: Manage infrastructure
- Security team: Audit and compliance
- Support team: Troubleshooting

**Access Levels**:
- Cluster admin: Full control
- Namespace admin: Control specific namespaces
- Developer: Deploy to specific namespaces
- Viewer: Read-only access

**Authentication Methods**:
- IBM Cloud IAM (recommended)
- LDAP/Active Directory integration
- OAuth providers (GitHub, Google, etc.)

### Compliance Requirements

**Common Compliance Frameworks**:
- **HIPAA**: Healthcare data
- **PCI-DSS**: Payment card data
- **SOC 2**: Service organization controls
- **ISO 27001**: Information security
- **GDPR**: European data protection

**Compliance Implications**:
- May require private endpoints only
- Encryption at rest mandatory
- Audit logging required
- Data residency restrictions
- Regular security assessments

## Cost Planning

### Cost Components

**Compute Costs** (largest component):
```
Control Plane Nodes:
- 3 × bx2-8x32 = ~$400-500/month

Worker Nodes:
- 9 × bx2-8x32 = ~$1,200-1,500/month

Total Compute: ~$1,600-2,000/month
```

**Storage Costs**:
```
Block Storage:
- $0.10-0.25 per GB/month
- Example: 1 TB = $100-250/month

Object Storage:
- $0.02-0.03 per GB/month
- Example: 1 TB = $20-30/month
```

**Network Costs**:
```
Load Balancers:
- $50-100 per load balancer/month

Outbound Data Transfer:
- First 5 GB free
- $0.09 per GB after that
- Example: 1 TB outbound = ~$90/month
```

**Additional Costs**:
```
Key Protect: ~$1-2 per key/month
Monitoring: ~$50-200/month
Log Analysis: ~$50-200/month
```

### Cost Optimization Strategies

**Right-Sizing**:
- Start smaller and scale up
- Monitor actual resource usage
- Adjust node sizes based on data

**Reserved Capacity**:
- Commit to 1 or 3 years for discounts
- Up to 30-40% savings
- Only for stable, long-term workloads

**Autoscaling**:
- Scale workers based on demand
- Reduce costs during low-traffic periods
- Requires proper configuration

**Resource Quotas**:
- Prevent resource waste
- Set limits per namespace
- Enforce efficient resource usage

**Development Clusters**:
- Shut down during off-hours
- Use smaller instance types
- Single-zone deployment

### Budget Planning

**Monthly Cost Estimate Template**:
```
Compute:
- Control plane: $___
- Workers: $___

Storage:
- Block storage: $___
- Object storage: $___

Network:
- Load balancers: $___
- Data transfer: $___

Services:
- Key management: $___
- Monitoring: $___
- Logging: $___

Total Monthly: $___
Annual: $___ × 12 = $___
```

**Add Buffer**:
- Add 20-30% for unexpected costs
- Growth and scaling
- Testing and experimentation

## Timeline Planning

### Typical Deployment Timeline

**Preparation Phase** (1-2 weeks):
- Gather requirements
- Obtain approvals and budget
- Set up IBM Cloud account
- Configure IAM permissions
- Create API keys

**Infrastructure Setup** (1-3 days):
- Create or configure VPC
- Set up subnets and networking
- Configure security groups
- Set up encryption keys

**Cluster Deployment** (2-4 hours):
- Run Terraform configuration
- Cluster provisioning
- Initial validation

**Post-Deployment Configuration** (1-2 days):
- Configure authentication
- Set up monitoring and logging
- Install required operators
- Configure network policies

**Application Migration** (varies):
- Depends on number of applications
- Testing and validation
- Gradual rollout

**Total**: 2-4 weeks for first production cluster

### Factors Affecting Timeline

**Faster Deployment**:
- ✅ Clear requirements
- ✅ Existing VPC infrastructure
- ✅ Pre-approved budget
- ✅ Experienced team

**Slower Deployment**:
- ⚠️ Complex compliance requirements
- ⚠️ Multiple approval layers
- ⚠️ Custom networking needs
- ⚠️ Learning curve for team

## Pre-Deployment Checklist

Before proceeding with deployment, verify you have:

### Account and Access
- [ ] IBM Cloud account with pay-as-you-go billing
- [ ] Required IAM permissions
- [ ] API key created and stored securely
- [ ] Resource group identified or created

### Infrastructure
- [ ] VPC planned or existing VPC identified
- [ ] Subnet CIDR blocks planned
- [ ] SSH key created and uploaded
- [ ] Region and zones selected

### Configuration Decisions
- [ ] OpenShift version selected
- [ ] Cluster size determined (control plane and workers)
- [ ] Instance types chosen
- [ ] Multi-zone or single-zone decided
- [ ] Public/private endpoint decision made

### Security
- [ ] Encryption requirements identified
- [ ] Key Protect or HPCS set up (if needed)
- [ ] Access control plan documented
- [ ] Compliance requirements reviewed

### Networking
- [ ] Ingress strategy planned
- [ ] DNS requirements identified
- [ ] Load balancer needs determined
- [ ] Firewall rules planned

### Budget
- [ ] Cost estimate completed
- [ ] Budget approved
- [ ] Cost monitoring plan in place

### Team
- [ ] Deployment team identified
- [ ] Roles and responsibilities assigned
- [ ] Training completed (if needed)
- [ ] Support plan established

## Common Planning Mistakes to Avoid

### 1. Undersizing the Cluster
**Problem**: Cluster runs out of capacity quickly
**Solution**: Add 30-50% buffer for growth

### 2. Ignoring Network Planning
**Problem**: Connectivity issues after deployment
**Solution**: Plan CIDR blocks and firewall rules upfront

### 3. Skipping Multi-Zone for Production
**Problem**: Entire cluster fails if zone goes down
**Solution**: Always use multi-zone for production

### 4. Not Planning for Encryption
**Problem**: Can't enable encryption after deployment
**Solution**: Set up Key Protect before cluster creation

### 5. Inadequate Access Control Planning
**Problem**: Security issues or access problems
**Solution**: Document access requirements before deployment

### 6. Forgetting About Costs
**Problem**: Budget overruns
**Solution**: Create detailed cost estimates and monitor spending

## Next Steps

Now that you've completed planning and have all prerequisites in place, you're ready to:

1. Understand the cluster provisioning flow
2. Learn about specific configuration options
3. Deploy your cluster using Terraform

The next chapter walks through the actual provisioning process step by step.

---

**Navigation**: [← Back: Cluster Architecture](02-cluster-architecture.md) | [Next: Cluster Provisioning Flow →](04-cluster-provisioning-flow.md)
# KMS Encryption

## Introduction

Encryption at rest protects your sensitive data stored in the OpenShift cluster by encrypting it before writing to disk. IBM Cloud offers Key Management Services (KMS) to manage encryption keys securely. This chapter explains encryption options, key management, and best practices for securing your cluster data.

## Understanding Encryption at Rest

### What Gets Encrypted?

**Cluster Data**:
- **etcd**: All cluster state and configuration
- **Secrets**: Kubernetes secrets containing sensitive data
- **ConfigMaps**: Configuration data (if containing sensitive info)
- **Persistent Volumes**: Application data storage

**Why Encryption Matters**:
- Protects data if physical storage is compromised
- Meets compliance requirements (HIPAA, PCI-DSS, etc.)
- Prevents unauthorized access to backups
- Provides defense in depth

### Encryption Without KMS

**Default Behavior**:
- Data stored in plain text on disk
- Relies on physical security
- No key management
- Not suitable for sensitive data

**When Acceptable**:
- Development environments
- Non-sensitive data
- Testing purposes
- Cost-sensitive scenarios

## IBM Cloud Key Management Options

### Option 1: IBM Key Protect

**What It Is**:
A multi-tenant key management service for managing encryption keys.

**Key Features**:
- FIPS 140-2 Level 3 certified
- Centralized key management
- Key lifecycle management
- Audit logging
- Integration with IBM Cloud services

**Pricing**:
- ~$1-2 per key per month
- Pay for active keys
- No charge for API calls

**Best For**:
- Most production workloads
- Standard compliance requirements
- Cost-effective encryption
- Multi-tenant acceptable

### Option 2: IBM Hyper Protect Crypto Services (HPCS)

**What It Is**:
A single-tenant key management and Hardware Security Module (HSM) service.

**Key Features**:
- FIPS 140-2 Level 4 certified (highest level)
- Dedicated HSM
- "Keep Your Own Key" (KYOK)
- Complete key control
- Highest security level

**Pricing**:
- ~$2,000-3,000 per month base
- Additional costs for operations
- Higher than Key Protect

**Best For**:
- Highly regulated industries
- Maximum security requirements
- Single-tenant requirement
- KYOK compliance needs

### Comparison

```
Feature              | Key Protect | HPCS
---------------------|-------------|-------------
FIPS Level           | Level 3     | Level 4
Tenancy              | Multi       | Single
HSM Dedicated        | No          | Yes
Cost                 | Low         | High
Setup Complexity     | Simple      | Complex
Key Control          | Shared      | Exclusive
Compliance           | Standard    | Highest
```

## Setting Up Encryption

### Prerequisites

**1. KMS Instance**:
```
Create Key Protect or HPCS instance
- Choose appropriate plan
- Select region (same as cluster)
- Configure access policies
```

**2. Root Key**:
```
Create root key (Customer Root Key - CRK)
- Used to encrypt data encryption keys
- Never leaves KMS
- Rotatable
```

**3. IAM Authorization**:
```
Grant cluster service access to KMS
- Service: Kubernetes Service
- Target: Key Protect/HPCS instance
- Role: Reader
```

### Encryption Configuration

**During Cluster Creation**:
```
Specify KMS details:
- KMS instance ID
- Root key ID
- Enable encryption

Result:
- etcd encrypted
- Secrets encrypted
- Persistent volumes encrypted (if configured)
```

**After Cluster Creation**:
```
Cannot enable encryption retroactively
Must:
1. Create new encrypted cluster
2. Migrate workloads
3. Decommission old cluster
```

## Key Management

### Root Key Lifecycle

**Creation**:
```
1. Access Key Protect/HPCS
2. Create new key
3. Name descriptively (e.g., "ocp-prod-root-key")
4. Save key ID
5. Configure cluster to use key
```

**Rotation**:
```
Recommended: Every 90 days

Process:
1. Create new key version in KMS
2. KMS automatically re-encrypts data
3. Old key version retained for decryption
4. Gradual transition to new key
```

**Deletion**:
```
Warning: Deleting key makes data unrecoverable!

Safe Deletion:
1. Ensure no clusters using key
2. Verify backups accessible
3. Wait retention period
4. Delete key
```

### Data Encryption Keys (DEKs)

**How It Works**:
```
1. Cluster generates DEK
2. DEK encrypts actual data
3. KMS encrypts DEK with root key
4. Encrypted DEK stored with data
5. KMS decrypts DEK when needed
```

**Benefits**:
- Root key never leaves KMS
- Fast encryption/decryption
- Key rotation doesn't require re-encrypting all data
- Scalable architecture

## Encryption Scope

### etcd Encryption

**What's Encrypted**:
- All Kubernetes resources
- Secrets
- ConfigMaps
- Service accounts
- Custom resources

**How It Works**:
```
Write Path:
1. Data written to etcd
2. Encrypted with DEK
3. DEK encrypted with root key
4. Stored encrypted

Read Path:
1. Encrypted data retrieved
2. DEK decrypted with root key
3. Data decrypted with DEK
4. Returned to requester
```

**Performance Impact**:
- Minimal latency increase (<5%)
- Negligible CPU overhead
- Worth the security benefit

### Persistent Volume Encryption

**Block Storage Encryption**:
```
Configuration:
- Enable in storage class
- Specify KMS details
- All volumes encrypted

Example Storage Class:
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ibmc-vpc-block-encrypted
provisioner: vpc.block.csi.ibm.io
parameters:
  encrypted: "true"
  encryptionKey: "<root-key-crn>"
```

**What's Encrypted**:
- All data written to volume
- Snapshots
- Backups

**Considerations**:
- Slight performance overhead
- Cannot disable after creation
- Key required for access

### Object Storage Encryption

**COS Encryption**:
```
Options:
1. IBM-managed keys (default)
2. Customer-managed keys (Key Protect/HPCS)

Configuration:
- Set during bucket creation
- Specify root key
- All objects encrypted
```

**Use Cases**:
- Image registry storage
- Backup storage
- Log archives

## Security Best Practices

### 1. Use Customer-Managed Keys

**Why**:
- Full control over keys
- Can revoke access
- Audit key usage
- Meet compliance requirements

**How**:
```
1. Create KMS instance
2. Generate root key
3. Configure cluster with key
4. Monitor key usage
```

### 2. Implement Key Rotation

**Policy**:
```
Frequency: Every 90 days
Process: Automated via KMS
Verification: Check rotation logs
Documentation: Track rotation dates
```

**Benefits**:
- Limits key exposure
- Meets compliance requirements
- Reduces risk of compromise

### 3. Separate Keys by Environment

**Strategy**:
```
Production: prod-ocp-root-key
Staging: staging-ocp-root-key
Development: dev-ocp-root-key

Benefits:
- Environment isolation
- Separate access control
- Independent rotation
- Clear audit trails
```

### 4. Monitor Key Usage

**What to Monitor**:
```
- Key access attempts
- Failed decryption attempts
- Key rotation events
- Unauthorized access attempts
- Key deletion attempts
```

**Tools**:
- IBM Cloud Activity Tracker
- Key Protect/HPCS audit logs
- Custom alerting

### 5. Backup Key Information

**What to Backup**:
```
- Key IDs
- Key CRNs
- KMS instance details
- Access policies
- Rotation schedule
```

**Why**:
- Disaster recovery
- Key reconstruction
- Audit requirements
- Operational continuity

## Compliance and Regulations

### HIPAA Compliance

**Requirements**:
- Encryption at rest mandatory
- Key management required
- Audit logging essential
- Access controls strict

**Implementation**:
```
Use: Key Protect or HPCS
Enable: Full encryption
Configure: Audit logging
Implement: Access controls
Document: All procedures
```

### PCI-DSS Compliance

**Requirements**:
- Encrypt cardholder data
- Manage encryption keys
- Restrict key access
- Log key operations

**Implementation**:
```
Use: Customer-managed keys
Enable: Volume encryption
Configure: Key rotation
Monitor: Key access
Audit: Regularly
```

### GDPR Compliance

**Requirements**:
- Protect personal data
- Right to erasure
- Data portability
- Breach notification

**Implementation**:
```
Encrypt: All personal data
Enable: Key deletion (right to erasure)
Document: Data locations
Prepare: Breach procedures
```

## Troubleshooting Encryption Issues

### Common Problems

**Problem**: Cluster can't access KMS
**Symptoms**:
- Pods failing to start
- Secrets not accessible
- etcd errors

**Solutions**:
```
1. Check IAM authorization
2. Verify network connectivity
3. Confirm key exists
4. Review KMS service status
```

**Problem**: Key rotation failed
**Symptoms**:
- Rotation stuck
- Decryption errors
- Performance degradation

**Solutions**:
```
1. Check KMS logs
2. Verify key status
3. Ensure sufficient permissions
4. Contact IBM support if needed
```

**Problem**: Cannot delete key
**Symptoms**:
- Key deletion blocked
- Error messages

**Solutions**:
```
1. Check if key in use
2. Verify no active clusters using key
3. Wait for retention period
4. Force delete if appropriate
```

### Diagnostic Commands

```bash
# Check cluster encryption status
ibmcloud oc cluster get --cluster <cluster-name> | grep Encryption

# View KMS instance
ibmcloud kp instance list

# List keys
ibmcloud kp keys

# View key details
ibmcloud kp key show <key-id>

# Check IAM authorizations
ibmcloud iam authorizations
```

## Cost Considerations

### Key Protect Costs

```
Base Cost:
- $1-2 per active key per month
- No charge for API calls
- No charge for key versions

Example:
- 1 root key for cluster: $1-2/month
- 10 volume encryption keys: $10-20/month
- Total: ~$11-22/month
```

### HPCS Costs

```
Base Cost:
- $2,000-3,000 per month
- Includes 2 crypto units
- Additional units extra

Example:
- Base service: $2,500/month
- Additional operations: Variable
- Total: $2,500+/month
```

### Cost Optimization

**Strategies**:
```
1. Use Key Protect for most workloads
2. Reserve HPCS for highest security needs
3. Consolidate keys where possible
4. Delete unused keys
5. Monitor key usage
```

## Migration Scenarios

### Enabling Encryption on Existing Cluster

**Not Possible**: Cannot enable encryption after cluster creation

**Migration Path**:
```
1. Create new encrypted cluster
2. Set up KMS and keys
3. Deploy applications to new cluster
4. Migrate data
5. Switch traffic to new cluster
6. Decommission old cluster
```

### Changing KMS Provider

**Scenario**: Moving from Key Protect to HPCS

**Process**:
```
1. Create HPCS instance
2. Generate new root key
3. Create new cluster with HPCS
4. Migrate workloads
5. Decommission old cluster
```

**Note**: Cannot change KMS provider for existing cluster

### Key Rotation

**Automatic Rotation**:
```
Supported: Yes
Process: Handled by KMS
Impact: Minimal
Downtime: None
```

**Manual Rotation**:
```
1. Create new key version
2. KMS re-encrypts DEKs
3. Gradual transition
4. Old key retained for decryption
```

## Best Practices Summary

### Do's

✅ Use customer-managed keys for production
✅ Implement regular key rotation
✅ Separate keys by environment
✅ Monitor key usage and access
✅ Document key management procedures
✅ Test disaster recovery procedures
✅ Enable audit logging
✅ Restrict key access

### Don'ts

❌ Don't use same key across environments
❌ Don't delete keys without verification
❌ Don't share key access unnecessarily
❌ Don't skip key rotation
❌ Don't ignore audit logs
❌ Don't forget to backup key information
❌ Don't disable encryption for sensitive data

## Key Takeaways

✅ Encryption at rest protects sensitive data
✅ Key Protect suitable for most workloads
✅ HPCS provides highest security level
✅ Cannot enable encryption retroactively
✅ Key rotation is essential
✅ Monitor and audit key usage
✅ Plan for disaster recovery

## Next Steps

Learn about:
- Cloud Object Storage for registry
- Cluster endpoint configuration
- Add-ons and extensions

---

**Navigation**: [← Back: Security Groups and Network Isolation](09-security-groups-network-isolation.md) | [Next: COS Registry Storage →](11-cos-registry-storage.md)
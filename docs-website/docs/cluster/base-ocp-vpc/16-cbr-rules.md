# Context-Based Restrictions (CBR)

## Introduction

Context-Based Restrictions (CBR) provide an additional security layer by controlling access to IBM Cloud resources based on network context. CBR rules restrict where and how resources can be accessed, complementing IAM policies. This chapter explains CBR concepts, configuration, and best practices for securing OpenShift clusters.

## Understanding CBR

### What Are Context-Based Restrictions?

**CBR** controls access based on:
- Network location (IP addresses, VPCs)
- Service context
- Resource attributes
- Time-based conditions

**Think of it as**: A bouncer who checks not just who you are (IAM), but also where you're coming from (CBR).

### CBR vs IAM

**IAM (Identity and Access Management)**:
- Who can access (identity)
- What they can do (permissions)
- Based on user/service identity

**CBR (Context-Based Restrictions)**:
- Where access comes from (network)
- When access is allowed (conditions)
- Based on network context

**Together**: Defense in depth - both identity AND context must be valid.

## CBR Components

### Network Zones

**Definition**: Allowed network locations for access.

**Types**:
```
VPC Zone:
- Specific VPC
- Subnet ranges
- Private network

IP Address Zone:
- Public IP addresses
- IP ranges (CIDR)
- Internet access

Service Reference Zone:
- Other IBM Cloud services
- Service-to-service access
```

### Rules

**Definition**: Policies that apply network zones to resources.

**Components**:
```
Target: Resource to protect
Context: Network zone(s) allowed
Enforcement: Block or report
```

## Creating Network Zones

### VPC Network Zone

**Purpose**: Allow access from specific VPC

**Configuration**:
```json
{
  "name": "ocp-prod-vpc-zone",
  "description": "Production OpenShift VPC",
  "account_id": "<account-id>",
  "addresses": [
    {
      "type": "vpc",
      "value": "<vpc-crn>"
    }
  ]
}
```

**Use Cases**:
- Cluster access from VPC only
- Service-to-service within VPC
- Internal applications

### IP Address Zone

**Purpose**: Allow access from specific IPs

**Configuration**:
```json
{
  "name": "office-network-zone",
  "description": "Corporate office network",
  "account_id": "<account-id>",
  "addresses": [
    {
      "type": "ipAddress",
      "value": "203.0.113.0"
    },
    {
      "type": "ipRange",
      "value": "198.51.100.0-198.51.100.255"
    },
    {
      "type": "subnet",
      "value": "192.0.2.0/24"
    }
  ]
}
```

**Use Cases**:
- Office network access
- VPN gateway IPs
- CI/CD pipeline IPs

### Service Reference Zone

**Purpose**: Allow access from IBM Cloud services

**Configuration**:
```json
{
  "name": "ibm-services-zone",
  "description": "IBM Cloud services",
  "account_id": "<account-id>",
  "addresses": [
    {
      "type": "serviceRef",
      "ref": {
        "account_id": "<account-id>",
        "service_name": "cloud-object-storage"
      }
    }
  ]
}
```

**Use Cases**:
- COS to cluster
- Key Protect to cluster
- Service-to-service communication

## Creating CBR Rules

### Protect Kubernetes Service

**Rule Configuration**:
```json
{
  "description": "Restrict OpenShift cluster access",
  "resources": [
    {
      "attributes": [
        {
          "name": "accountId",
          "value": "<account-id>"
        },
        {
          "name": "serviceName",
          "value": "containers-kubernetes"
        },
        {
          "name": "resource",
          "value": "<cluster-id>"
        }
      ]
    }
  ],
  "contexts": [
    {
      "attributes": [
        {
          "name": "networkZoneId",
          "value": "<vpc-zone-id>"
        }
      ]
    },
    {
      "attributes": [
        {
          "name": "networkZoneId",
          "value": "<office-zone-id>"
        }
      ]
    }
  ],
  "enforcement_mode": "enabled"
}
```

### Protect Key Protect

**Rule Configuration**:
```json
{
  "description": "Restrict Key Protect access",
  "resources": [
    {
      "attributes": [
        {
          "name": "accountId",
          "value": "<account-id>"
        },
        {
          "name": "serviceName",
          "value": "kms"
        },
        {
          "name": "serviceInstance",
          "value": "<kp-instance-id>"
        }
      ]
    }
  ],
  "contexts": [
    {
      "attributes": [
        {
          "name": "networkZoneId",
          "value": "<vpc-zone-id>"
        }
      ]
    }
  ],
  "enforcement_mode": "enabled"
}
```

### Protect Cloud Object Storage

**Rule Configuration**:
```json
{
  "description": "Restrict COS bucket access",
  "resources": [
    {
      "attributes": [
        {
          "name": "accountId",
          "value": "<account-id>"
        },
        {
          "name": "serviceName",
          "value": "cloud-object-storage"
        },
        {
          "name": "serviceInstance",
          "value": "<cos-instance-id>"
        }
      ]
    }
  ],
  "contexts": [
    {
      "attributes": [
        {
          "name": "networkZoneId",
          "value": "<vpc-zone-id>"
        }
      ]
    }
  ],
  "enforcement_mode": "enabled"
}
```

## Enforcement Modes

### Report Mode

**Behavior**:
- Logs violations
- Does not block access
- Used for testing

**Use Cases**:
- Initial deployment
- Testing rules
- Impact analysis
- Gradual rollout

### Enabled Mode

**Behavior**:
- Blocks violations
- Enforces restrictions
- Production mode

**Use Cases**:
- Production environments
- After testing
- Compliance requirements
- Security hardening

## Common CBR Patterns

### Pattern 1: VPC-Only Access

**Scenario**: Cluster accessible only from VPC

**Implementation**:
```
1. Create VPC network zone
2. Create CBR rule for cluster
3. Allow only VPC zone
4. Enable enforcement
```

**Benefits**:
- No internet exposure
- Enhanced security
- Compliance-friendly

### Pattern 2: Hybrid Access

**Scenario**: VPC + office network access

**Implementation**:
```
1. Create VPC network zone
2. Create office IP zone
3. Create CBR rule with both zones
4. Enable enforcement
```

**Benefits**:
- Flexible access
- Secure remote access
- Controlled exposure

### Pattern 3: Service-to-Service

**Scenario**: Only specific services can access

**Implementation**:
```
1. Create service reference zones
2. Create CBR rules per service
3. Allow only required services
4. Enable enforcement
```

**Benefits**:
- Service isolation
- Principle of least privilege
- Clear dependencies

## Best Practices

### Planning

✅ Identify all access patterns
✅ Document network zones
✅ Test in report mode first
✅ Plan for exceptions
✅ Consider maintenance access

### Implementation

✅ Start with report mode
✅ Monitor violations
✅ Adjust rules as needed
✅ Enable enforcement gradually
✅ Document all rules

### Operations

✅ Regular rule reviews
✅ Update zones as needed
✅ Monitor violations
✅ Maintain documentation
✅ Test disaster recovery

## Monitoring and Troubleshooting

### Checking CBR Status

**View Network Zones**:
```bash
# List zones
ibmcloud cbr zones

# View zone details
ibmcloud cbr zone <zone-id>
```

**View Rules**:
```bash
# List rules
ibmcloud cbr rules

# View rule details
ibmcloud cbr rule <rule-id>
```

### Monitoring Violations

**Activity Tracker**:
```
Event: CBR violation
Action: Access denied
Source: IP address
Target: Resource
Reason: Not in allowed zone
```

**Common Violations**:
- Access from unauthorized IP
- Service not in allowed zone
- VPC not in network zone
- Expired or invalid context

### Troubleshooting Access Issues

**Problem**: Cannot access cluster
**Check**:
```
1. Verify CBR rules exist
2. Check network zone includes your location
3. Verify enforcement mode
4. Review Activity Tracker logs
5. Check IAM permissions (both needed)
```

**Problem**: Service cannot access resource
**Check**:
```
1. Verify service reference zone
2. Check service-to-service authorization
3. Review CBR rule contexts
4. Verify resource attributes
```

## Integration with Other Security

### CBR + IAM

**Layered Security**:
```
Layer 1 (IAM): Who can access
Layer 2 (CBR): Where access comes from
Both Required: Access granted only if both pass
```

**Example**:
```
User: Has IAM permission to view cluster
Location: Not in allowed network zone
Result: Access denied (CBR blocks)
```

### CBR + Security Groups

**Complementary Controls**:
```
Security Groups: Instance-level firewall
CBR: Service-level access control
Together: Defense in depth
```

### CBR + Private Endpoints

**Enhanced Security**:
```
Private Endpoints: No internet exposure
CBR: Restrict even within private network
Result: Maximum security
```

## Compliance and Auditing

### Compliance Benefits

**HIPAA**:
- Network-based access control
- Audit trail of access attempts
- Violation logging

**PCI-DSS**:
- Network segmentation
- Access restrictions
- Compliance reporting

**SOC 2**:
- Access controls
- Monitoring and logging
- Regular reviews

### Audit Trail

**What's Logged**:
```
- All access attempts
- Allowed access
- Denied access (violations)
- Rule changes
- Zone modifications
```

**Retention**:
```
Activity Tracker: 7-30 days
Log Analysis: Configurable
Archive: Long-term storage
```

## Key Takeaways

✅ CBR adds network-based access control
✅ Complements IAM policies
✅ Network zones define allowed locations
✅ Rules apply zones to resources
✅ Start with report mode
✅ Monitor and adjust regularly
✅ Essential for compliance

## Next Steps

Learn about:
- Secrets Manager integration
- Cluster lifecycle management
- Runtime scripts and verification

---

**Navigation**: [← Back: Load Balancer and VPE Security](15-load-balancer-vpe-security.md) | [Next: Secrets Manager Integration →](17-secrets-manager-integration.md)
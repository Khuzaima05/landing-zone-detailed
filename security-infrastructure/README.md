# 🔐 Security Infrastructure Module

## Overview

The Security Infrastructure module provides comprehensive security services for IBM Cloud Landing Zone deployments, including encryption key management, secrets management, certificate lifecycle, and compliance monitoring.

## 🎯 What This Module Covers

### Core Security Services

#### 1. **Key Management Service (KMS)**
- IBM Key Protect - Multi-tenant key management
- IBM Hyper Protect Crypto Services (HPCS) - Dedicated HSM-backed keys
- Root key management
- Data encryption keys (DEK) wrapping
- Key rotation policies
- Bring Your Own Key (BYOK)
- Keep Your Own Key (KYOK)

#### 2. **Secrets Manager**
- Secret storage and retrieval
- Dynamic secrets generation
- Secret rotation automation
- Access control policies
- Audit logging
- Integration with applications

#### 3. **Certificate Manager**
- SSL/TLS certificate lifecycle
- Certificate ordering and renewal
- Certificate deployment
- Expiration monitoring
- Integration with load balancers

#### 4. **Security and Compliance Center**
- Compliance posture monitoring
- Security configuration scanning
- Regulatory compliance reporting
- Remediation guidance
- Custom rule definitions

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    IAM & Access Control                      │
│              (Service IDs, API Keys, Policies)               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Key Management (KMS/HPCS)                   │
│         Root Keys → Data Encryption Keys → Resources         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Secrets Manager                          │
│        (API Keys, Passwords, Certificates, Tokens)           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Certificate Manager                        │
│           (SSL/TLS Certificates, Auto-renewal)               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Security & Compliance Center                    │
│         (Scanning, Monitoring, Compliance Reports)           │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Key Management Service (KMS)

### Key Protect vs HPCS

| Feature | Key Protect | HPCS |
|---------|-------------|------|
| **Deployment** | Multi-tenant | Single-tenant |
| **Hardware** | Shared HSM | Dedicated HSM |
| **Compliance** | FIPS 140-2 Level 3 | FIPS 140-2 Level 4 |
| **Control** | IBM manages HSM | Customer controls HSM |
| **Use Case** | General encryption | Highly regulated workloads |
| **Cost** | Lower | Higher |

### Root Key Management

```hcl
resource "ibm_kms_key" "root_key" {
  instance_id  = ibm_resource_instance.kms.guid
  key_name     = "landing-zone-root-key"
  standard_key = false  # Root key
  force_delete = false
}
```

### Encryption Integration

```hcl
# Encrypt VSI boot volume
resource "ibm_is_instance" "vsi" {
  boot_volume {
    encryption = ibm_kms_key.root_key.crn
  }
}

# Encrypt COS bucket
resource "ibm_cos_bucket" "bucket" {
  kms_key_crn = ibm_kms_key.root_key.crn
}
```

### Key Rotation

```hcl
resource "ibm_kms_key" "root_key" {
  rotation {
    enabled        = true
    interval_month = 3  # Rotate every 3 months
  }
}
```

## 🔒 Secrets Manager

### Secret Types

1. **Arbitrary Secrets** - Generic key-value pairs
2. **User Credentials** - Username/password combinations
3. **IAM Credentials** - Service ID API keys
4. **Certificates** - SSL/TLS certificates
5. **Key-Value Secrets** - Structured configuration data

### Secret Groups

```hcl
resource "ibm_sm_secret_group" "app_secrets" {
  instance_id = ibm_resource_instance.secrets_manager.guid
  name        = "application-secrets"
  description = "Secrets for application tier"
}
```

### Dynamic Secrets

```hcl
resource "ibm_sm_iam_credentials_secret" "service_id" {
  instance_id = ibm_resource_instance.secrets_manager.guid
  secret_group_id = ibm_sm_secret_group.app_secrets.secret_group_id
  name        = "app-service-id-key"
  
  ttl         = "7200"  # 2 hours
  reuse_api_key = false
}
```

### Secret Rotation

```hcl
resource "ibm_sm_arbitrary_secret" "api_key" {
  rotation {
    auto_rotate = true
    interval    = 30  # days
  }
}
```

## 📜 Certificate Manager

### Certificate Ordering

```hcl
resource "ibm_certificate_manager_order" "cert" {
  certificate_manager_instance_id = ibm_resource_instance.cert_manager.id
  name                            = "example.com"
  domains                         = ["example.com", "*.example.com"]
  
  dns_provider_instance_crn = ibm_resource_instance.dns.crn
  
  rotate_keys = true
  auto_renew_enabled = true
}
```

### Load Balancer Integration

```hcl
resource "ibm_is_lb_listener" "https" {
  lb                   = ibm_is_lb.lb.id
  port                 = 443
  protocol             = "https"
  certificate_instance = ibm_certificate_manager_order.cert.id
}
```

## 🛡️ Security and Compliance Center

### Compliance Profiles

- **IBM Cloud Framework for Financial Services**
- **CIS IBM Cloud Foundations Benchmark**
- **NIST 800-53**
- **PCI DSS**
- **HIPAA**
- **ISO 27001**

### Attachment Configuration

```hcl
resource "ibm_scc_profile_attachment" "attachment" {
  profile_id  = "ibm-cloud-framework-for-financial-services"
  name        = "landing-zone-compliance"
  description = "Compliance monitoring for landing zone"
  
  scope {
    environment = "ibm-cloud"
    properties {
      name  = "scope_id"
      value = var.account_id
    }
  }
  
  schedule = "daily"
}
```

### Custom Rules

```hcl
resource "ibm_scc_rule" "custom_rule" {
  account_id  = var.account_id
  description = "Ensure all VSIs have encrypted boot volumes"
  
  target {
    service_name = "is"
    resource_kind = "instance"
  }
  
  required_config {
    property = "boot_volume.encryption"
    operator = "is_not_empty"
  }
}
```

## 🔐 Security Best Practices

### 1. Key Management
- Use separate root keys per environment
- Enable automatic key rotation
- Implement key usage policies
- Monitor key access logs
- Use HPCS for highly regulated workloads

### 2. Secrets Management
- Never hardcode secrets in code
- Use dynamic secrets where possible
- Implement least privilege access
- Enable secret rotation
- Audit secret access regularly

### 3. Certificate Management
- Enable auto-renewal for certificates
- Monitor certificate expiration
- Use wildcard certificates judiciously
- Implement certificate pinning where appropriate
- Maintain certificate inventory

### 4. Compliance Monitoring
- Enable continuous compliance scanning
- Review compliance reports regularly
- Remediate findings promptly
- Document exceptions
- Maintain audit trails

## 🔄 Integration Points

### Upstream Dependencies
- **IAM Infrastructure** - Service IDs and access policies
- **Resource Management** - Resource groups and tags
- **VPC Infrastructure** - Network security integration

### Downstream Consumers
- **VSI Infrastructure** - Boot volume encryption
- **Storage Infrastructure** - COS bucket encryption
- **Database Infrastructure** - Database encryption
- **Kubernetes/OpenShift** - Secret injection
- **Application Workloads** - Certificate and secret access

## 📊 Common Patterns

### Multi-Tier Encryption

```
Application Layer
    ↓ (TLS/SSL)
Load Balancer (Certificate Manager)
    ↓ (TLS/SSL)
Application Tier (Secrets Manager)
    ↓ (Encrypted Connection)
Database Tier (KMS Encrypted Storage)
    ↓
Storage Layer (KMS Encrypted Volumes)
```

### Secret Injection Flow

```
Secrets Manager
    ↓
External Secrets Operator
    ↓
Kubernetes Secrets
    ↓
Application Pods
```

## 🛠️ Terraform Resources

Key Terraform resources:
- `ibm_resource_instance` - KMS/HPCS/Secrets Manager instances
- `ibm_kms_key` - Root keys and standard keys
- `ibm_kms_key_policies` - Key rotation and dual authorization
- `ibm_sm_secret_group` - Secret organization
- `ibm_sm_arbitrary_secret` - Generic secrets
- `ibm_sm_iam_credentials_secret` - Dynamic IAM credentials
- `ibm_certificate_manager_order` - Certificate ordering
- `ibm_scc_profile_attachment` - Compliance monitoring

## 📈 Monitoring & Auditing

### Key Metrics
- Key usage frequency
- Secret access patterns
- Certificate expiration dates
- Compliance scan results
- Security findings count

### Audit Events
- Key creation/deletion
- Secret access/modification
- Certificate renewal
- Compliance scan results
- Policy violations

### Integration with Observability
```hcl
# Activity Tracker for security events
resource "ibm_resource_instance" "activity_tracker" {
  name     = "security-audit-tracker"
  service  = "logdnaat"
  plan     = "7-day"
  location = "us-south"
}
```

## 🔗 Related Documentation

- [IAM Infrastructure](../iam-infrastructure/) - Access control foundation
- [VPC Infrastructure](../vpc-infrastructure/) - Network security
- [VSI Infrastructure](../vsi-infrastructure/) - Compute encryption
- [Storage Infrastructure](../storage-infrastructure/) - Storage encryption
- [Observability Infrastructure](../observability-infrastructure/) - Security monitoring

## 📚 Additional Resources

- [IBM Key Protect Documentation](https://cloud.ibm.com/docs/key-protect)
- [IBM HPCS Documentation](https://cloud.ibm.com/docs/hs-crypto)
- [IBM Secrets Manager Documentation](https://cloud.ibm.com/docs/secrets-manager)
- [IBM Certificate Manager Documentation](https://cloud.ibm.com/docs/certificate-manager)
- [Security and Compliance Center](https://cloud.ibm.com/docs/security-compliance)
- [Encryption Best Practices](https://cloud.ibm.com/docs/overview?topic=overview-encryption)

---

**Navigation:** [← Back to Main Guide](../IBM-CLOUD-LANDING-ZONE-GUIDE.md) | [Next: Observability Infrastructure →](../observability-infrastructure/)

# 🔑 IAM Infrastructure Module

## Overview

The IAM (Identity and Access Management) Infrastructure module provides comprehensive access control and identity management for IBM Cloud Landing Zone deployments, including user management, service IDs, access groups, policies, and API key management.

## 🎯 What This Module Covers

### Core IAM Components

#### 1. **Access Groups**
- Logical grouping of users and service IDs
- Centralized policy management
- Dynamic membership rules
- Hierarchical access control

#### 2. **Service IDs**
- Machine identities for automation
- API key generation
- Service-to-service authentication
- Least privilege access

#### 3. **API Keys**
- User API keys
- Service ID API keys
- Key rotation policies
- Secure key storage

#### 4. **Policies and Roles**
- Platform management roles
- Service access roles
- Custom roles
- Resource-level policies
- Attribute-based access control

#### 5. **Trusted Profiles**
- Federated identity integration
- Compute resource authentication
- Cross-account access
- Temporary credentials

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Identity Sources                          │
│         (IBM Cloud Users, Federated IdP, Service IDs)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Access Groups                             │
│         (Developers, Operators, Auditors, Admins)           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    IAM Policies                              │
│    (Platform Roles, Service Roles, Resource Policies)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    IBM Cloud Resources                       │
│         (VPC, VSI, Databases, Storage, Services)            │
└─────────────────────────────────────────────────────────────┘
```

## 👥 Access Groups

### Access Group Creation

```hcl
resource "ibm_iam_access_group" "developers" {
  name        = "landing-zone-developers"
  description = "Access group for development team"
}

resource "ibm_iam_access_group" "operators" {
  name        = "landing-zone-operators"
  description = "Access group for operations team"
}

resource "ibm_iam_access_group" "auditors" {
  name        = "landing-zone-auditors"
  description = "Access group for audit and compliance"
}
```

### Add Members to Access Group

```hcl
# Add users
resource "ibm_iam_access_group_members" "developer_members" {
  access_group_id = ibm_iam_access_group.developers.id
  
  ibm_ids = [
    "user1@example.com",
    "user2@example.com"
  ]
  
  iam_service_ids = [
    ibm_iam_service_id.ci_cd_service.id
  ]
}
```

### Dynamic Rules

```hcl
resource "ibm_iam_access_group_dynamic_rule" "developer_rule" {
  access_group_id = ibm_iam_access_group.developers.id
  name            = "auto-add-developers"
  expiration      = 24  # hours
  
  conditions {
    claim    = "blueGroups"
    operator = "CONTAINS"
    value    = "developers"
  }
}
```

## 🤖 Service IDs

### Service ID Creation

```hcl
resource "ibm_iam_service_id" "terraform_service" {
  name        = "terraform-automation"
  description = "Service ID for Terraform automation"
}

resource "ibm_iam_service_id" "app_service" {
  name        = "application-service"
  description = "Service ID for application workloads"
}

resource "ibm_iam_service_id" "monitoring_service" {
  name        = "monitoring-service"
  description = "Service ID for monitoring agents"
}
```

### API Key for Service ID

```hcl
resource "ibm_iam_service_api_key" "terraform_key" {
  name           = "terraform-api-key"
  iam_service_id = ibm_iam_service_id.terraform_service.iam_id
  description    = "API key for Terraform automation"
  
  # Store in Secrets Manager
  store_value = false
}

# Store API key in Secrets Manager
resource "ibm_sm_iam_credentials_secret" "terraform_key_secret" {
  instance_id     = ibm_resource_instance.secrets_manager.guid
  secret_group_id = ibm_sm_secret_group.automation.secret_group_id
  name            = "terraform-api-key"
  description     = "Terraform automation API key"
  
  service_id      = ibm_iam_service_id.terraform_service.iam_id
  ttl             = "7776000"  # 90 days
  reuse_api_key   = false
}
```

## 🔐 IAM Policies

### Platform Management Roles

| Role | Permissions |
|------|-------------|
| **Viewer** | View resources, cannot modify |
| **Operator** | View and perform actions |
| **Editor** | View, create, modify resources |
| **Administrator** | Full control including access management |

### Service Access Roles

| Role | Permissions |
|------|-------------|
| **Reader** | Read-only access to service |
| **Writer** | Read and write access |
| **Manager** | Full service management |

### Resource Group Policy

```hcl
resource "ibm_iam_access_group_policy" "developer_rg_policy" {
  access_group_id = ibm_iam_access_group.developers.id
  
  roles = ["Viewer", "Editor"]
  
  resources {
    resource_type = "resource-group"
    resource      = ibm_resource_group.development.id
  }
}
```

### VPC Policy

```hcl
resource "ibm_iam_access_group_policy" "vpc_policy" {
  access_group_id = ibm_iam_access_group.developers.id
  
  roles = ["Editor"]
  
  resources {
    service           = "is"
    resource_group_id = ibm_resource_group.development.id
  }
}
```

### Service-Specific Policy

```hcl
# COS access policy
resource "ibm_iam_access_group_policy" "cos_policy" {
  access_group_id = ibm_iam_access_group.developers.id
  
  roles = ["Writer", "Content Reader"]
  
  resources {
    service              = "cloud-object-storage"
    resource_instance_id = ibm_resource_instance.cos.guid
  }
}

# Database access policy
resource "ibm_iam_access_group_policy" "database_policy" {
  access_group_id = ibm_iam_access_group.developers.id
  
  roles = ["Editor"]
  
  resources {
    service              = "databases-for-postgresql"
    resource_instance_id = ibm_database.postgresql.id
  }
}
```

### Attribute-Based Access Control

```hcl
resource "ibm_iam_access_group_policy" "tagged_resources_policy" {
  access_group_id = ibm_iam_access_group.developers.id
  
  roles = ["Editor"]
  
  resources {
    service = "is"
    
    attributes = {
      "resource.tag:environment" = "development"
      "resource.tag:team"        = "platform"
    }
  }
}
```

## 🔑 Service-to-Service Authorization

### KMS Authorization for COS

```hcl
resource "ibm_iam_authorization_policy" "cos_kms" {
  source_service_name         = "cloud-object-storage"
  source_resource_instance_id = ibm_resource_instance.cos.guid
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  roles                       = ["Reader"]
}
```

### Flow Logs Authorization for COS

```hcl
resource "ibm_iam_authorization_policy" "flow_logs_cos" {
  source_service_name  = "is"
  source_resource_type = "flow-log-collector"
  target_service_name  = "cloud-object-storage"
  target_resource_instance_id = ibm_resource_instance.cos.guid
  roles                = ["Writer"]
}
```

### Database Authorization for KMS

```hcl
resource "ibm_iam_authorization_policy" "database_kms" {
  source_service_name         = "databases-for-postgresql"
  source_resource_instance_id = ibm_database.postgresql.id
  target_service_name         = "kms"
  target_resource_instance_id = ibm_resource_instance.kms.guid
  roles                       = ["Reader"]
}
```

## 🎭 Trusted Profiles

### Trusted Profile for Compute Resources

```hcl
resource "ibm_iam_trusted_profile" "vsi_profile" {
  name        = "vsi-trusted-profile"
  description = "Trusted profile for VSI instances"
}

# Trust policy for VSIs
resource "ibm_iam_trusted_profile_claim_rule" "vsi_rule" {
  profile_id = ibm_iam_trusted_profile.vsi_profile.id
  type       = "Profile-CR"
  
  conditions {
    claim    = "namespace"
    operator = "EQUALS"
    value    = "default"
  }
  
  conditions {
    claim    = "crn"
    operator = "EQUALS"
    value    = ibm_is_instance.vsi.crn
  }
}

# Policy for trusted profile
resource "ibm_iam_trusted_profile_policy" "vsi_policy" {
  profile_id = ibm_iam_trusted_profile.vsi_profile.id
  
  roles = ["Reader"]
  
  resources {
    service = "cloud-object-storage"
  }
}
```

### Trusted Profile for Kubernetes

```hcl
resource "ibm_iam_trusted_profile" "kubernetes_profile" {
  name        = "kubernetes-trusted-profile"
  description = "Trusted profile for Kubernetes workloads"
}

resource "ibm_iam_trusted_profile_claim_rule" "kubernetes_rule" {
  profile_id = ibm_iam_trusted_profile.kubernetes_profile.id
  type       = "Profile-CR"
  
  conditions {
    claim    = "namespace"
    operator = "EQUALS"
    value    = "production"
  }
  
  conditions {
    claim    = "serviceaccount"
    operator = "EQUALS"
    value    = "app-service-account"
  }
}
```

## 📊 IAM Patterns

### Least Privilege Access Model

```
Account Administrator
    ↓
Resource Group Administrators
    ↓
Service Administrators
    ↓
Developers/Operators
    ↓
Service IDs (Automation)
```

### Multi-Environment Access

```
Production Access Group
    ├── Platform: Viewer
    ├── Service: Reader
    └── Limited Resources

Development Access Group
    ├── Platform: Editor
    ├── Service: Writer
    └── Full Dev Resources

Operations Access Group
    ├── Platform: Operator
    ├── Service: Manager
    └── All Environments
```

## 🔄 Integration Points

### Upstream Dependencies
- **Resource Management** - Resource groups
- **Security Infrastructure** - Secrets Manager for API keys

### Downstream Consumers
- **All Infrastructure Modules** - Access control
- **Automation Tools** - Service IDs and API keys
- **Applications** - Service authentication
- **Monitoring** - Audit logging

## 🛠️ Terraform Resources

Key Terraform resources:
- `ibm_iam_access_group` - Access groups
- `ibm_iam_access_group_members` - Group membership
- `ibm_iam_access_group_policy` - Group policies
- `ibm_iam_service_id` - Service IDs
- `ibm_iam_service_api_key` - API keys
- `ibm_iam_authorization_policy` - Service-to-service auth
- `ibm_iam_trusted_profile` - Trusted profiles
- `ibm_iam_user_policy` - User-specific policies

## 📈 Best Practices

### 1. Access Groups
- Use access groups instead of individual policies
- Implement role-based access control (RBAC)
- Regular access reviews
- Document group purposes
- Use dynamic rules for automation

### 2. Service IDs
- One service ID per automation tool
- Descriptive naming conventions
- Regular API key rotation
- Store keys in Secrets Manager
- Monitor service ID usage

### 3. Policies
- Follow least privilege principle
- Use resource groups for organization
- Implement attribute-based access
- Regular policy audits
- Document policy decisions

### 4. API Keys
- Never commit keys to version control
- Rotate keys regularly (90 days)
- Use short-lived credentials where possible
- Monitor key usage
- Revoke unused keys

### 5. Trusted Profiles
- Use for compute resource authentication
- Implement claim rules carefully
- Regular profile reviews
- Monitor profile usage
- Document trust relationships

## 🔒 Security Considerations

### API Key Management

```hcl
# Generate API key
resource "ibm_iam_service_api_key" "app_key" {
  name           = "app-api-key"
  iam_service_id = ibm_iam_service_id.app_service.iam_id
}

# Store in Secrets Manager (recommended)
resource "ibm_sm_arbitrary_secret" "api_key_secret" {
  instance_id     = ibm_resource_instance.secrets_manager.guid
  secret_group_id = ibm_sm_secret_group.app_secrets.secret_group_id
  name            = "app-api-key"
  payload         = ibm_iam_service_api_key.app_key.apikey
  
  # Rotation
  rotation {
    auto_rotate = true
    interval    = 90
  }
}
```

### Audit Logging

```hcl
# Activity Tracker for IAM events
resource "ibm_resource_instance" "activity_tracker" {
  name     = "iam-audit-tracker"
  service  = "logdnaat"
  plan     = "7-day"
  location = "us-south"
  
  parameters = {
    default_receiver = true
  }
}
```

## 🔗 Related Documentation

- [Security Infrastructure](../security-infrastructure/) - Secrets Manager integration
- [Resource Management](../resource-management/) - Resource groups
- [Observability Infrastructure](../observability-infrastructure/) - Audit logging
- [All Infrastructure Modules](../) - Access control implementation

## 📚 Additional Resources

- [IBM Cloud IAM Documentation](https://cloud.ibm.com/docs/account?topic=account-iamoverview)
- [Access Groups Best Practices](https://cloud.ibm.com/docs/account?topic=account-account_setup)
- [Service IDs and API Keys](https://cloud.ibm.com/docs/account?topic=account-serviceids)
- [IAM Roles and Actions](https://cloud.ibm.com/docs/account?topic=account-iam-service-roles-actions)
- [Trusted Profiles](https://cloud.ibm.com/docs/account?topic=account-create-trusted-profile)

---

**Navigation:** [← Back to Main Guide](../IBM-CLOUD-LANDING-ZONE-GUIDE.md) | [Next: Resource Management →](../resource-management/)
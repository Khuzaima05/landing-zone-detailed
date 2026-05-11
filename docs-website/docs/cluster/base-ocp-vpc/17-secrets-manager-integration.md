# Secrets Manager Integration

## Introduction

IBM Secrets Manager provides centralized management of secrets, certificates, and credentials. Integrating Secrets Manager with OpenShift enhances security by externalizing sensitive data and enabling automatic rotation. This chapter covers Secrets Manager concepts, integration patterns, and best practices.

## Understanding Secrets Manager

### What Is Secrets Manager?

**IBM Secrets Manager** is a service for storing and managing:
- Passwords and API keys
- Certificates (SSL/TLS)
- SSH keys
- Arbitrary secrets
- IAM credentials

**Benefits**:
- Centralized secret storage
- Automatic rotation
- Access control
- Audit logging
- Compliance support

### Secrets Manager vs Kubernetes Secrets

**Kubernetes Secrets**:
```
Storage: etcd (encrypted if KMS enabled)
Rotation: Manual
Access: RBAC
Audit: Limited
Lifecycle: Manual
```

**Secrets Manager**:
```
Storage: Dedicated service
Rotation: Automatic
Access: IAM + RBAC
Audit: Comprehensive
Lifecycle: Managed
```

**Best Practice**: Use Secrets Manager for sensitive production secrets, Kubernetes secrets for non-sensitive config.

## Secret Types

### Arbitrary Secrets

**Use Cases**:
- API keys
- Passwords
- Connection strings
- Configuration values

**Example**:
```json
{
  "name": "database-password",
  "description": "Production database password",
  "secret_type": "arbitrary",
  "payload": "super-secret-password"
}
```

### User Credentials

**Use Cases**:
- Service accounts
- Application credentials
- Integration accounts

**Example**:
```json
{
  "name": "api-credentials",
  "secret_type": "username_password",
  "username": "api-user",
  "password": "api-password"
}
```

### IAM Credentials

**Use Cases**:
- Service-to-service authentication
- IBM Cloud API access
- Automated workflows

**Example**:
```json
{
  "name": "cos-service-credentials",
  "secret_type": "iam_credentials",
  "service_id": "<service-id>",
  "reuse_api_key": false
}
```

### Certificates

**Use Cases**:
- SSL/TLS certificates
- Client certificates
- CA certificates

**Example**:
```json
{
  "name": "app-tls-cert",
  "secret_type": "imported_cert",
  "certificate": "<cert-pem>",
  "private_key": "<key-pem>",
  "intermediate": "<intermediate-pem>"
}
```

## Integration Methods

### External Secrets Operator

**What It Does**:
Syncs secrets from Secrets Manager to Kubernetes secrets.

**Installation**:
```yaml
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: external-secrets-operator
  namespace: external-secrets
spec:
  channel: stable
  name: external-secrets-operator
  source: community-operators
  sourceNamespace: openshift-marketplace
```

**Configuration**:
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: ibm-secrets-manager
  namespace: default
spec:
  provider:
    ibm:
      serviceUrl: https://<instance-id>.us-south.secrets-manager.appdomain.cloud
      auth:
        secretRef:
          secretApiKey:
            name: sm-api-key
            key: apiKey
```

**External Secret**:
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-secret
  namespace: default
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: ibm-secrets-manager
    kind: SecretStore
  target:
    name: database-credentials
    creationPolicy: Owner
  data:
  - secretKey: password
    remoteRef:
      key: database-password
```

### Direct API Access

**Use Cases**:
- Custom integrations
- Init containers
- Sidecar patterns

**Example**:
```python
import requests

def get_secret(instance_id, secret_id, api_key):
    url = f"https://{instance_id}.us-south.secrets-manager.appdomain.cloud/api/v2/secrets/{secret_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json"
    }
    response = requests.get(url, headers=headers)
    return response.json()
```

## Secret Rotation

### Automatic Rotation

**Configuration**:
```json
{
  "name": "rotating-password",
  "secret_type": "username_password",
  "rotation": {
    "auto_rotate": true,
    "interval": 30,
    "unit": "day"
  }
}
```

**How It Works**:
```
1. Rotation interval expires
2. Secrets Manager generates new secret
3. Old secret remains valid (grace period)
4. Applications fetch new secret
5. Old secret expires after grace period
```

### Manual Rotation

**Process**:
```
1. Create new secret version
2. Update applications
3. Verify functionality
4. Delete old version
```

**Commands**:
```bash
# Create new version
ibmcloud secrets-manager secret-version-create \
  --secret-id <secret-id> \
  --payload '{"password": "new-password"}'

# List versions
ibmcloud secrets-manager secret-versions \
  --secret-id <secret-id>
```

## Access Control

### IAM Policies

**Reader Role**:
```
Permissions:
- Read secret metadata
- Read secret value
- List secrets

Use: Applications, services
```

**Writer Role**:
```
Permissions:
- All Reader permissions
- Create secrets
- Update secrets
- Rotate secrets

Use: Administrators, automation
```

**Manager Role**:
```
Permissions:
- All Writer permissions
- Delete secrets
- Manage access policies
- Configure instance

Use: Security team, admins
```

### Secret Groups

**Purpose**: Organize secrets and apply group-level policies

**Example**:
```
Group: production-secrets
Secrets: database-password, api-key, tls-cert
Policy: Only production service IDs can access
```

## Best Practices

### Secret Management

✅ Use Secrets Manager for sensitive data
✅ Enable automatic rotation
✅ Implement least privilege access
✅ Use secret groups for organization
✅ Regular access reviews
✅ Audit secret access

### Integration

✅ Use External Secrets Operator
✅ Set appropriate refresh intervals
✅ Handle rotation gracefully
✅ Implement retry logic
✅ Monitor sync status
✅ Test failover scenarios

### Security

✅ Use private endpoints
✅ Enable encryption at rest
✅ Implement CBR rules
✅ Monitor access logs
✅ Regular security audits
✅ Incident response plan

## Monitoring and Troubleshooting

### Monitoring Secret Access

**Activity Tracker Events**:
```
- secrets-manager.secret.read
- secrets-manager.secret.create
- secrets-manager.secret.update
- secrets-manager.secret.delete
- secrets-manager.secret.rotate
```

**Metrics**:
```
- Secret access count
- Failed access attempts
- Rotation events
- Sync failures
```

### Troubleshooting

**Problem**: External Secret not syncing
**Check**:
```
1. Verify SecretStore configuration
2. Check API key permissions
3. Review External Secrets Operator logs
4. Verify secret exists in Secrets Manager
5. Check network connectivity
```

**Problem**: Application cannot access secret
**Check**:
```
1. Verify IAM permissions
2. Check secret group membership
3. Review CBR rules
4. Verify secret exists
5. Check application credentials
```

## Key Takeaways

✅ Secrets Manager centralizes secret management
✅ External Secrets Operator simplifies integration
✅ Automatic rotation enhances security
✅ IAM provides fine-grained access control
✅ Monitoring and auditing are essential
✅ Use for production sensitive data

## Next Steps

Learn about:
- Cluster lifecycle management
- Runtime scripts and verification
- Terraform mapping

---

**Navigation**: [← Back: CBR Rules](16-cbr-rules.md) | [Next: Cluster Lifecycle →](18-cluster-lifecycle.md)
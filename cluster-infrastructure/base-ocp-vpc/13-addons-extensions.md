# Add-ons and Extensions

## Introduction

OpenShift clusters can be extended with add-ons that provide additional functionality like monitoring, logging, service mesh, and more. Understanding available add-ons and how to configure them helps you build feature-rich, production-ready clusters. This chapter covers common add-ons, their purposes, and configuration options.

## Understanding Add-ons

### What Are Add-ons?

**Add-ons** are optional components that extend cluster functionality:
- Pre-configured software packages
- Managed by IBM Cloud or operators
- Integrated with cluster lifecycle
- Optional but recommended for production

### Add-on Categories

**Observability**:
- Monitoring (Prometheus, Grafana)
- Logging (Fluentd, Elasticsearch)
- Tracing (Jaeger)
- Metrics collection

**Security**:
- Certificate management
- Secrets management
- Security scanning
- Compliance tools

**Networking**:
- Service mesh (Istio)
- Ingress controllers
- Network policies
- Load balancing

**Storage**:
- Storage drivers
- Backup solutions
- Data protection
- Volume management

**Developer Tools**:
- CI/CD pipelines
- Build tools
- Development environments
- Testing frameworks

## Core Add-ons

### Monitoring Stack

**Components**:
- Prometheus (metrics collection)
- Grafana (visualization)
- Alertmanager (alerting)
- Node exporter (node metrics)

**What It Provides**:
```
Metrics:
- Cluster resource usage
- Node performance
- Pod metrics
- Application metrics

Dashboards:
- Pre-built visualizations
- Custom dashboards
- Real-time monitoring
- Historical data

Alerts:
- Resource thresholds
- Service health
- Custom conditions
- Notification channels
```

**Configuration**:
```yaml
# Enable monitoring
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-monitoring-config
  namespace: openshift-monitoring
data:
  config.yaml: |
    enableUserWorkload: true
    prometheusK8s:
      retention: 15d
      volumeClaimTemplate:
        spec:
          resources:
            requests:
              storage: 100Gi
```

### Logging Stack

**Components**:
- Fluentd (log collection)
- Elasticsearch (log storage)
- Kibana (log visualization)
- Log forwarding

**What It Provides**:
```
Log Collection:
- Container logs
- Node logs
- Audit logs
- Application logs

Log Storage:
- Centralized storage
- Searchable logs
- Retention policies
- Index management

Log Analysis:
- Search and filter
- Visualizations
- Dashboards
- Alerts
```

**Configuration**:
```yaml
apiVersion: logging.openshift.io/v1
kind: ClusterLogging
metadata:
  name: instance
  namespace: openshift-logging
spec:
  managementState: Managed
  logStore:
    type: elasticsearch
    elasticsearch:
      nodeCount: 3
      storage:
        size: 200Gi
      redundancyPolicy: SingleRedundancy
  collection:
    logs:
      type: fluentd
```

## Service Mesh

### Istio Service Mesh

**What It Provides**:
- Traffic management
- Security (mTLS)
- Observability
- Policy enforcement

**Use Cases**:
```
Microservices:
- Service-to-service communication
- Load balancing
- Circuit breaking
- Retries and timeouts

Security:
- Mutual TLS
- Authorization policies
- Certificate management
- Identity verification

Observability:
- Distributed tracing
- Service metrics
- Traffic visualization
- Performance monitoring
```

**Installation**:
```yaml
apiVersion: maistra.io/v2
kind: ServiceMeshControlPlane
metadata:
  name: basic
  namespace: istio-system
spec:
  version: v2.3
  tracing:
    type: Jaeger
  addons:
    grafana:
      enabled: true
    kiali:
      enabled: true
    prometheus:
      enabled: true
```

## Storage Add-ons

### IBM Cloud Block Storage CSI Driver

**What It Provides**:
- Dynamic volume provisioning
- Volume snapshots
- Volume expansion
- Multiple storage tiers

**Storage Classes**:
```
ibmc-vpc-block-general-purpose (3 IOPS/GB)
ibmc-vpc-block-5iops-tier (5 IOPS/GB)
ibmc-vpc-block-10iops-tier (10 IOPS/GB)
ibmc-vpc-block-custom (custom IOPS)
```

**Usage**:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: ibmc-vpc-block-10iops-tier
```

### IBM Cloud File Storage

**What It Provides**:
- Shared file storage
- NFS-based
- Multiple access modes
- Performance tiers

**Use Cases**:
- Shared application data
- Content management systems
- Development environments
- Multi-pod access

## Security Add-ons

### Cert-Manager

**What It Provides**:
- Automatic certificate management
- Certificate renewal
- Multiple CA support
- Integration with Let's Encrypt

**Configuration**:
```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: example-com
  namespace: default
spec:
  secretName: example-com-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - example.com
  - www.example.com
```

### Falco (Security Monitoring)

**What It Provides**:
- Runtime security
- Threat detection
- Compliance monitoring
- Anomaly detection

**Use Cases**:
- Detect suspicious activity
- Monitor file access
- Track network connections
- Compliance auditing

## Developer Tools

### OpenShift Pipelines (Tekton)

**What It Provides**:
- Cloud-native CI/CD
- Kubernetes-native pipelines
- Reusable tasks
- Event-driven workflows

**Example Pipeline**:
```yaml
apiVersion: tekton.dev/v1beta1
kind:Pipeline
metadata:
  name: build-and-deploy
spec:
  tasks:
  - name: fetch-source
    taskRef:
      name: git-clone
  - name: build-image
    taskRef:
      name: buildah
  - name: deploy
    taskRef:
      name: kubectl-deploy
```

### OpenShift GitOps (ArgoCD)

**What It Provides**:
- GitOps workflows
- Declarative deployments
- Automated sync
- Multi-cluster management

**Benefits**:
- Git as single source of truth
- Automated deployments
- Easy rollbacks
- Audit trail

## Backup and Disaster Recovery

### Velero

**What It Provides**:
- Cluster backup
- Application backup
- Disaster recovery
- Migration support

**Configuration**:
```yaml
apiVersion: velero.io/v1
kind: Backup
metadata:
  name: daily-backup
spec:
  includedNamespaces:
  - production
  - staging
  schedule: "0 1 * * *"
  ttl: 720h
```

## Add-on Management

### Installing Add-ons

**Via Operator Hub**:
```
1. Access OpenShift Console
2. Navigate to OperatorHub
3. Search for desired operator
4. Click Install
5. Configure settings
6. Wait for installation
```

**Via CLI**:
```bash
# Install operator
oc apply -f operator-subscription.yaml

# Verify installation
oc get csv -n <namespace>

# Check operator status
oc get pods -n <namespace>
```

### Updating Add-ons

**Automatic Updates**:
```
Configuration:
- Set update channel
- Enable automatic updates
- Monitor update status

Benefits:
- Latest features
- Security patches
- Bug fixes
```

**Manual Updates**:
```
Process:
1. Check for updates
2. Review release notes
3. Test in non-production
4. Schedule maintenance window
5. Perform update
6. Verify functionality
```

### Removing Add-ons

**Safe Removal**:
```
1. Backup configuration
2. Remove dependent resources
3. Uninstall operator
4. Clean up CRDs
5. Verify removal
```

## Best Practices

### Selection

✅ Choose add-ons based on requirements
✅ Start with essential add-ons
✅ Evaluate resource impact
✅ Consider maintenance overhead
✅ Check compatibility

### Configuration

✅ Use appropriate resource limits
✅ Configure persistent storage
✅ Set up monitoring
✅ Enable high availability
✅ Document configuration

### Operations

✅ Monitor add-on health
✅ Keep add-ons updated
✅ Regular backups
✅ Test disaster recovery
✅ Review logs regularly

## Key Takeaways

✅ Add-ons extend cluster functionality
✅ Monitoring and logging are essential
✅ Service mesh for microservices
✅ Operators simplify management
✅ Choose based on requirements
✅ Regular updates important

## Next Steps

Learn about:
- Autoscaling configuration
- Load balancer and VPE security
- Context-based restrictions

---

**Navigation**: [← Back: Cluster Endpoints](12-cluster-endpoints.md) | [Next: Autoscaling Configuration →](14-autoscaling-configuration.md)
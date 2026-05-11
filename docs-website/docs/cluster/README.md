# ☸️ Cluster Infrastructure Module

## Overview

The Cluster Infrastructure module provides comprehensive Kubernetes and OpenShift container orchestration platform deployment and management for IBM Cloud Landing Zone. This module covers everything from cluster provisioning to workload deployment, operator management, and production-grade operations.

## 🎯 What This Module Covers

### Core Cluster Services

#### 1. **Kubernetes/OpenShift on IBM Cloud**
- IBM Kubernetes Service (IKS) - Managed Kubernetes
- Red Hat OpenShift on IBM Cloud (ROKS) - Enterprise Kubernetes platform
- Multi-zone cluster deployment
- Worker pool management
- Cluster autoscaling
- Version management and upgrades

#### 2. **Cluster Configuration**
- Namespace management and RBAC
- Network policies and security
- Resource quotas and limits
- Service mesh integration (Istio)
- Ingress and routing
- Storage class configuration

#### 3. **Workload Management**
- Operator lifecycle management
- Helm chart deployment
- Custom Resource Definitions (CRDs)
- External secrets integration
- Application deployment patterns
- GitOps workflows

#### 4. **Operations & Observability**
- Log collection and forwarding
- Monitoring integration (Prometheus/Grafana)
- Backup and disaster recovery
- Auto-scaling configurations
- Update strategies
- Health checks and probes

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  IBM Cloud Foundation                        │
│         (Resource Groups, IAM, KMS, Secrets Manager)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Network Foundation                          │
│         (VPC, Subnets, Security Groups, Load Balancers)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Cluster Control Plane                       │
│         (Master Nodes, API Server, etcd, Scheduler)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Worker Node Pools                           │
│         (Compute Nodes, Container Runtime, Kubelet)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Cluster Add-ons & Operators                 │
│    (Service Mesh, Monitoring, Logging, Backup, Secrets)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Application Workloads                       │
│         (Deployments, StatefulSets, Services, Ingress)       │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Cluster Types Comparison

### IKS vs ROKS

| Feature | IBM Kubernetes Service (IKS) | Red Hat OpenShift (ROKS) |
|---------|------------------------------|--------------------------|
| **Platform** | Vanilla Kubernetes | Enterprise Kubernetes + OpenShift |
| **Management** | IBM-managed control plane | IBM-managed control plane |
| **Developer Tools** | kubectl, Helm | oc CLI, Developer Console, Helm |
| **Security** | Standard RBAC | Enhanced RBAC + SCC |
| **Networking** | Calico | OpenShift SDN / OVN-Kubernetes |
| **Registry** | External registry required | Built-in container registry |
| **CI/CD** | External tools | Built-in Pipelines (Tekton) |
| **Monitoring** | External (Prometheus) | Built-in monitoring stack |
| **Service Mesh** | Istio add-on | Red Hat Service Mesh |
| **Cost** | Lower | Higher (includes OpenShift license) |
| **Use Case** | Cloud-native apps, microservices | Enterprise apps, hybrid cloud |
| **Compliance** | Standard | Enhanced (FedRAMP, PCI-DSS) |

### Cluster Size Recommendations

| Workload Type | Worker Nodes | vCPU per Node | Memory per Node | Storage |
|---------------|--------------|---------------|-----------------|---------|
| **Development** | 2-3 | 4 | 16 GB | 100 GB |
| **Testing** | 3-5 | 8 | 32 GB | 200 GB |
| **Production (Small)** | 6-9 | 16 | 64 GB | 500 GB |
| **Production (Medium)** | 9-15 | 32 | 128 GB | 1 TB |
| **Production (Large)** | 15+ | 64+ | 256 GB+ | 2 TB+ |

## 📦 Cluster Creation Modules

### 1. Base Cluster Module (`cluster`)

Core cluster provisioning functionality for both IKS and ROKS.

```hcl
module "cluster" {
  source = "terraform-ibm-modules/cluster/ibm"
  
  cluster_name              = "production-cluster"
  cluster_type              = "openshift"  # or "kubernetes"
  vpc_id                    = var.vpc_id
  resource_group_id         = var.resource_group_id
  region                    = "us-south"
  
  # Multi-zone configuration
  zones = [
    {
      name      = "us-south-1"
      subnet_id = var.subnet_zone1_id
    },
    {
      name      = "us-south-2"
      subnet_id = var.subnet_zone2_id
    },
    {
      name      = "us-south-3"
      subnet_id = var.subnet_zone3_id
    }
  ]
  
  # Worker pool configuration
  worker_pools = [
    {
      name             = "default"
      machine_type     = "bx2.16x64"
      workers_per_zone = 2
    }
  ]
  
  # Encryption
  kms_config = {
    instance_id = var.kms_instance_id
    crk_id      = var.kms_key_id
  }
  
  tags = ["env:production", "team:platform"]
}
```

**Key Features:**
- Multi-zone high availability
- Encrypted etcd and worker nodes
- Integrated with VPC networking
- Automatic version updates
- Built-in load balancer

### 2. OpenShift on VPC Module (`base-ocp-vpc`)

Specialized module for Red Hat OpenShift deployment on VPC infrastructure.

```hcl
module "openshift_cluster" {
  source = "terraform-ibm-modules/base-ocp-vpc/ibm"
  
  cluster_name              = "openshift-prod"
  openshift_version         = "4.14"
  vpc_id                    = var.vpc_id
  resource_group_id         = var.resource_group_id
  region                    = "us-south"
  
  # OpenShift-specific configuration
  disable_public_service_endpoint = false
  entitlement                     = "cloud_pak"
  
  # Worker pool configuration
  worker_pools = [
    {
      name              = "compute"
      machine_type      = "bx2.16x64"
      workers_per_zone  = 3
      labels = {
        "node-role" = "compute"
      }
    },
    {
      name              = "storage"
      machine_type      = "bx2.32x128"
      workers_per_zone  = 2
      labels = {
        "node-role" = "storage"
      }
    }
  ]
  
  # Subnet configuration per zone
  subnet_ids = {
    "us-south-1" = var.subnet_zone1_id
    "us-south-2" = var.subnet_zone2_id
    "us-south-3" = var.subnet_zone3_id
  }
  
  # Add-ons
  cluster_addons = {
    openshift-data-foundation = "4.14.0"
    vpc-block-csi-driver     = "5.1"
  }
  
  # Encryption
  kms_instance_id = var.kms_instance_id
  kms_key_id      = var.kms_key_id
}
```

**OpenShift-Specific Features:**
- Built-in container registry
- Developer console and CLI tools
- Integrated CI/CD (Tekton Pipelines)
- Enhanced security (Security Context Constraints)
- Operator Hub for easy add-on installation
- Built-in monitoring and logging

### 3. IBM Kubernetes Service on VPC Module (`iks-vpc`)

Optimized module for vanilla Kubernetes deployment.

```hcl
module "iks_cluster" {
  source = "terraform-ibm-modules/iks-vpc/ibm"
  
  cluster_name              = "iks-production"
  kubernetes_version        = "1.28"
  vpc_id                    = var.vpc_id
  resource_group_id         = var.resource_group_id
  region                    = "us-south"
  
  # Worker configuration
  worker_pools = [
    {
      name              = "default"
      machine_type      = "bx2.8x32"
      workers_per_zone  = 2
      labels = {
        "workload-type" = "general"
      }
    },
    {
      name              = "high-memory"
      machine_type      = "bx2.16x64"
      workers_per_zone  = 1
      labels = {
        "workload-type" = "memory-intensive"
      }
      taints = [
        {
          key    = "high-memory"
          value  = "true"
          effect = "NoSchedule"
        }
      ]
    }
  ]
  
  # Subnet mapping
  zones = [
    {
      name      = "us-south-1"
      subnet_id = var.subnet_zone1_id
    },
    {
      name      = "us-south-2"
      subnet_id = var.subnet_zone2_id
    },
    {
      name      = "us-south-3"
      subnet_id = var.subnet_zone3_id
    }
  ]
  
  # Add-ons
  addons = {
    "vpc-block-csi-driver" = "5.1"
    "cluster-autoscaler"   = "1.0.9"
  }
  
  # Encryption
  kms_config = {
    instance_id = var.kms_instance_id
    crk_id      = var.kms_key_id
  }
}
```

**IKS-Specific Features:**
- Lightweight Kubernetes distribution
- Flexible add-on ecosystem
- Lower operational overhead
- Cost-effective for cloud-native workloads
- Full Kubernetes API compatibility

## 🔧 Cluster Configuration

### 1. Namespace Management Module (`namespace`)

Organize cluster resources with namespaces and RBAC.

```hcl
module "namespace" {
  source = "terraform-ibm-modules/namespace/ibm"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  namespaces = [
    {
      name = "production"
      labels = {
        "environment" = "production"
        "team"        = "platform"
      }
      annotations = {
        "owner" = "platform-team@company.com"
      }
    },
    {
      name = "staging"
      labels = {
        "environment" = "staging"
      }
    }
  ]
  
  # Resource quotas
  resource_quotas = {
    production = {
      hard = {
        "requests.cpu"    = "100"
        "requests.memory" = "200Gi"
        "pods"            = "100"
      }
    }
    staging = {
      hard = {
        "requests.cpu"    = "50"
        "requests.memory" = "100Gi"
        "pods"            = "50"
      }
    }
  }
  
  # Limit ranges
  limit_ranges = {
    production = {
      limits = [
        {
          type = "Container"
          max = {
            cpu    = "4"
            memory = "8Gi"
          }
          min = {
            cpu    = "100m"
            memory = "128Mi"
          }
          default = {
            cpu    = "500m"
            memory = "512Mi"
          }
        }
      ]
    }
  }
  
  # RBAC configuration
  role_bindings = [
    {
      namespace = "production"
      role_name = "admin"
      subjects = [
        {
          kind = "Group"
          name = "production-admins"
        }
      ]
    }
  ]
}
```

**Namespace Features:**
- Multi-tenancy support
- Resource isolation
- RBAC integration
- Resource quotas and limits
- Network policy boundaries

### 2. Service Mesh Module (`service-mesh`)

Deploy and configure Istio service mesh for advanced traffic management.

```hcl
module "service_mesh" {
  source = "terraform-ibm-modules/ocp-service-mesh/ibm"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  # Service mesh configuration
  service_mesh_version = "2.4"
  
  # Control plane configuration
  control_plane = {
    namespace = "istio-system"
    
    # Ingress gateway
    ingress_gateway = {
      enabled = true
      type    = "LoadBalancer"
      ports = [
        {
          name       = "http"
          port       = 80
          targetPort = 8080
        },
        {
          name       = "https"
          port       = 443
          targetPort = 8443
        }
      ]
    }
    
    # Tracing
    tracing = {
      enabled  = true
      provider = "jaeger"
    }
    
    # Monitoring
    monitoring = {
      enabled = true
      prometheus = {
        enabled = true
      }
      grafana = {
        enabled = true
      }
      kiali = {
        enabled = true
      }
    }
  }
  
  # Member namespaces
  member_namespaces = [
    "production",
    "staging"
  ]
  
  # mTLS configuration
  mtls = {
    mode = "STRICT"
  }
}
```

**Service Mesh Features:**
- Traffic management (routing, load balancing)
- Security (mTLS, authorization)
- Observability (metrics, traces, logs)
- Resilience (circuit breakers, retries)
- A/B testing and canary deployments

### 3. Network Policies

Implement network segmentation within the cluster.

```yaml
# Deny all ingress traffic by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress

---
# Allow specific ingress traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

## 📦 Workload & Operators

### 1. External Secrets Operator Module (`external-secrets-operator`)

Integrate external secret management systems with Kubernetes.

```hcl
module "external_secrets" {
  source = "terraform-ibm-modules/external-secrets-operator/ibm"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  # Operator configuration
  operator_version = "0.9.9"
  namespace        = "external-secrets-system"
  
  # IBM Secrets Manager integration
  secret_stores = [
    {
      name      = "ibm-secrets-manager"
      namespace = "production"
      
      provider = {
        ibm = {
          service_url = var.secrets_manager_url
          auth = {
            secret_ref = {
              secret_name = "ibm-secrets-manager-auth"
            }
          }
        }
      }
    }
  ]
  
  # External secrets
  external_secrets = [
    {
      name      = "database-credentials"
      namespace = "production"
      
      secret_store_ref = {
        name = "ibm-secrets-manager"
        kind = "SecretStore"
      }
      
      target = {
        name            = "db-credentials"
        creation_policy = "Owner"
      }
      
      data = [
        {
          secret_key = "username"
          remote_ref = {
            key = "production/database/username"
          }
        },
        {
          secret_key = "password"
          remote_ref = {
            key = "production/database/password"
          }
        }
      ]
      
      refresh_interval = "1h"
    }
  ]
}
```

**External Secrets Features:**
- Centralized secret management
- Automatic secret rotation
- Multiple backend support
- Namespace-scoped secret stores
- Audit logging

### 2. Operator Lifecycle Management

Deploy and manage operators using Operator Lifecycle Manager (OLM).

```yaml
# Install PostgreSQL Operator
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: postgresql-operator
  namespace: operators
spec:
  channel: stable
  name: postgresql-operator
  source: operatorhubio-catalog
  sourceNamespace: olm
  installPlanApproval: Automatic
```

### 3. Helm Chart Deployment

Deploy applications using Helm charts.

```hcl
resource "helm_release" "nginx_ingress" {
  name       = "nginx-ingress"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = "ingress-nginx"
  version    = "4.8.3"
  
  create_namespace = true
  
  values = [
    yamlencode({
      controller = {
        service = {
          type = "LoadBalancer"
        }
        autoscaling = {
          enabled     = true
          minReplicas = 2
          maxReplicas = 10
        }
      }
    })
  ]
}
```

## 🔄 Operations

### 1. Logs Agent Module (`logs-agent`)

Deploy log collection and forwarding agents.

```hcl
module "logs_agent" {
  source = "terraform-ibm-modules/logs-agent/ibm"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  # Log forwarding configuration
  log_forwarding = {
    enabled = true
    
    # IBM Log Analysis integration
    log_analysis = {
      enabled       = true
      instance_id   = var.log_analysis_instance_id
      ingestion_key = var.log_analysis_key
    }
    
    # Log sources
    sources = [
      {
        name = "container-logs"
        type = "container"
        paths = [
          "/var/log/containers/*.log"
        ]
      }
    ]
  }
}
```

**Logging Features:**
- Centralized log collection
- Multi-destination forwarding
- Log parsing and filtering
- Retention policies
- Search and analysis

### 2. Monitoring Bind Module (`monitoring-bind`)

Integrate cluster monitoring with IBM Cloud Monitoring.

```hcl
module "monitoring" {
  source = "terraform-ibm-modules/monitoring-bind/ibm"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  # IBM Cloud Monitoring integration
  monitoring_instance_id = var.monitoring_instance_id
  
  # Prometheus configuration
  prometheus = {
    enabled   = true
    retention = "15d"
    
    storage = {
      size          = "50Gi"
      storage_class = "ibmc-vpc-block-10iops-tier"
    }
  }
  
  # Alert rules
  alert_rules = [
    {
      name = "high-cpu-usage"
      expr = "node_cpu_usage > 80"
      for  = "5m"
      labels = {
        severity = "warning"
      }
    }
  ]
}
```

**Monitoring Features:**
- Real-time metrics collection
- Custom dashboards
- Alert management
- Multi-channel notifications
- Historical data analysis

### 3. Backup & Recovery Module (`backup-recovery`)

Implement cluster backup and disaster recovery strategies.

```hcl
module "backup_recovery" {
  source = "terraform-ibm-modules/iks-ocp-backup-recovery/ibm"
  
  cluster_id = module.openshift_cluster.cluster_id
  
  # Backup configuration
  backup = {
    enabled  = true
    schedule = "0 2 * * *"  # Daily at 2 AM
    
    # Retention policy
    retention = {
      daily   = 7
      weekly  = 4
      monthly = 12
    }
    
    # Backup storage
    storage = {
      type = "cos"
      cos_config = {
        bucket_name = "cluster-backups"
        endpoint    = var.cos_endpoint
      }
    }
    
    # Backup scope
    include_namespaces = [
      "production",
      "staging"
    ]
    
    # Volume snapshots
    volume_snapshots = {
      enabled        = true
      snapshot_class = "ibmc-vpc-block-snapshot"
    }
  }
  
  # Disaster recovery
  disaster_recovery = {
    enabled       = true
    dr_cluster_id = var.dr_cluster_id
    dr_region     = "us-east"
    
    replication = {
      enabled  = true
      interval = "1h"
    }
  }
}
```

**Backup & Recovery Features:**
- Automated backup scheduling
- Multi-tier retention policies
- Volume snapshot integration
- Disaster recovery replication
- Restore testing and validation
- Point-in-time recovery

### 4. Auto-scaling Configuration

Configure horizontal and vertical pod autoscaling.

```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🔗 Integration Points

### 1. VPC Networking Integration

```
Cluster ←→ VPC Integration
├── Worker nodes deployed in VPC subnets
├── Security groups control traffic
├── Load balancers for ingress
├── Private endpoints for services
└── VPE for IBM Cloud services

Network Flow:
Internet → ALB/NLB → Ingress → Service → Pod
```

> **VPC Prerequisites:** Clusters require a configured VPC foundation. See [VPC Infrastructure](../vpc/README.md) for complete networking setup including [Subnets](../vpc/subnet-service-internals.md), [Security Groups](../vpc/security-group-service-internals.md), and [VPC Outputs](../vpc/outputs-downstream-consumption.md).

**Configuration:**
```hcl
# VPC Load Balancer for cluster ingress
resource "ibm_is_lb" "cluster_lb" {
  name           = "cluster-ingress-lb"
  subnets        = var.subnet_ids
  type           = "public"
  resource_group = var.resource_group_id
  
  pools {
    name      = "cluster-ingress-pool"
    algorithm = "round_robin"
    protocol  = "tcp"
    
    health_monitor {
      type        = "tcp"
      port        = 30080
      interval    = 10
      timeout     = 5
      max_retries = 3
    }
  }
}
```

### 2. Storage Integration

```
Storage Options for Kubernetes:
├── Block Storage (VPC Block CSI)
│   ├── ReadWriteOnce volumes
│   ├── High-performance SSD
│   └── Snapshot support
│
├── File Storage (VPC File CSI)
│   ├── ReadWriteMany volumes
│   ├── NFS protocol
│   └── Multi-zone access
│
└── Object Storage (COS)
    ├── S3-compatible API
    ├── Backup storage
    └── Large object storage
```

**Storage Classes:**
```yaml
# High-performance block storage
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ibmc-vpc-block-10iops-tier
provisioner: vpc.block.csi.ibm.io
parameters:
  profile: "10iops-tier"
  encrypted: "true"
  encryptionKey: "<kms-key-crn>"
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
```

### 3. IAM and RBAC Integration

```
IAM Integration:
├── IBM Cloud IAM for cluster access
├── Kubernetes RBAC for resource access
├── Service IDs for automation
└── API keys for authentication

Access Flow:
User/Service → IBM Cloud IAM → Cluster RBAC → Namespace → Resources
```

**RBAC Configuration:**
```yaml
# Cluster role for developers
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: developer
rules:
- apiGroups: ["", "apps", "batch"]
  resources: ["pods", "deployments", "jobs", "services"]
  verbs: ["get", "list", "watch", "create", "update", "patch"]
```

### 4. Observability Stack Integration

```
Observability Integration:
├── Metrics → IBM Cloud Monitoring (Sysdig)
├── Logs → IBM Log Analysis (LogDNA)
├── Traces → Jaeger/Zipkin
├── Events → Activity Tracker
└── Flow Logs → VPC Flow Logs
```

### 5. Security Services Integration

```
Security Integration:
├── KMS/HPCS for encryption
├── Secrets Manager for secrets
├── Certificate Manager for TLS
├── Security Advisor for compliance
└── Vulnerability Advisor for images
```

## 🎯 Best Practices

### 1. Multi-Zone Cluster Deployment

**Architecture:**
```
Region: us-south
├── Zone 1 (us-south-1)
│   ├── Worker Nodes: 3
│   ├── Subnet: 10.10.1.0/24
│   └── Load Balancer: Active
│
├── Zone 2 (us-south-2)
│   ├── Worker Nodes: 3
│   ├── Subnet: 10.10.2.0/24
│   └── Load Balancer: Active
│
└── Zone 3 (us-south-3)
    ├── Worker Nodes: 3
    ├── Subnet: 10.10.3.0/24
    └── Load Balancer: Active

Benefits:
✓ High availability (99.99% SLA)
✓ Zone failure tolerance
✓ Load distribution
✓ Disaster recovery
```

### 2. High Availability Patterns

**Deployment Strategy:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ha-application
spec:
  replicas: 6  # Minimum 2 per zone
  
  # Pod topology spread
  topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: ha-application
```

### 3. Security Hardening

**Security Checklist:**
```
✓ Enable encryption at rest (etcd, volumes)
✓ Enable encryption in transit (mTLS)
✓ Implement network policies
✓ Use Pod Security Standards
✓ Enable audit logging
✓ Scan container images
✓ Use private endpoints
✓ Implement RBAC least privilege
✓ Rotate credentials regularly
✓ Enable vulnerability scanning
```

**Pod Security:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  
  containers:
  - name: app
    image: app:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

### 4. Cost Optimization

**Cost Optimization Strategies:**

| Strategy | Implementation | Savings |
|----------|----------------|---------|
| **Right-sizing** | Match worker node size to workload | 20-40% |
| **Auto-scaling** | HPA + Cluster Autoscaler | 30-50% |
| **Spot instances** | Use for non-critical workloads | 50-70% |
| **Resource quotas** | Prevent over-provisioning | 15-25% |
| **Reserved capacity** | Commit to long-term usage | 20-30% |
| **Multi-tenancy** | Share clusters across teams | 25-35% |

### 5. Monitoring and Alerting

**Key Metrics to Monitor:**
```
Cluster Health:
├── Node status and capacity
├── Pod status and restarts
├── Resource utilization (CPU, memory, disk)
├── Network throughput
└── API server latency

Application Health:
├── Request rate and latency
├── Error rate
├── Saturation metrics
└── Custom business metrics
```

## 🚀 Quick Start

### Prerequisites
- IBM Cloud VPC infrastructure deployed
- Resource group created
- SSH key pair generated
- Appropriate IAM permissions

### Basic Cluster Deployment

```bash
# 1. Set up environment
export IBMCLOUD_API_KEY="your-api-key"
export TF_VAR_region="us-south"
export TF_VAR_resource_group_id="your-rg-id"

# 2. Initialize Terraform
terraform init

# 3. Plan deployment
terraform plan -out=tfplan

# 4. Deploy cluster
terraform apply tfplan

# 5. Configure kubectl
ibmcloud ks cluster config --cluster <cluster-name>

# 6. Verify cluster
kubectl get nodes
kubectl get pods --all-namespaces
```

## 📚 Additional Resources

### Official Documentation
- [IBM Kubernetes Service Documentation](https://cloud.ibm.com/docs/containers)
- [Red Hat OpenShift on IBM Cloud](https://cloud.ibm.com/docs/openshift)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [OpenShift Documentation](https://docs.openshift.com/)

### Terraform Modules
- [terraform-ibm-modules/cluster](https://github.com/terraform-ibm-modules/terraform-ibm-cluster)
- [terraform-ibm-modules/base-ocp-vpc](https://github.com/terraform-ibm-modules/terraform-ibm-base-ocp-vpc)
- [terraform-ibm-modules/iks-vpc](https://github.com/terraform-ibm-modules/terraform-ibm-iks-vpc)

### Best Practices
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [OpenShift Best Practices](https://docs.openshift.com/container-platform/latest/architecture/architecture.html)
- [IBM Cloud Architecture Center](https://www.ibm.com/cloud/architecture)

## 🤝 Related Modules

- **[VPC Infrastructure](../vpc-infrastructure/)** - Network foundation for clusters
- **[Security Infrastructure](../security-infrastructure/)** - KMS and secrets management
- **[Observability Infrastructure](../observability-infrastructure/)** - Monitoring and logging
- **[Storage Infrastructure](../storage-infrastructure/)** - Persistent storage options
- **[IAM Infrastructure](../iam-infrastructure/)** - Access control and authentication

---

<div align="center">

**[⬆ Back to Top](#️-cluster-infrastructure-module)**

Built with ❤️ for IBM Cloud Landing Zone

</div>
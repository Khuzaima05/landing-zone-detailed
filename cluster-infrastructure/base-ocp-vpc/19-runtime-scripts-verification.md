# Runtime Scripts and Verification

## Introduction

Runtime scripts and verification procedures ensure that your OpenShift cluster is properly configured and functioning correctly after deployment. This chapter covers post-deployment validation, health checks, and automated verification scripts.

## Post-Deployment Verification

### Cluster Health Checks

**Basic Verification**:
```bash
# Check cluster version
oc get clusterversion

# Verify all operators healthy
oc get clusteroperators

# Check node status
oc get nodes

# Verify all pods running
oc get pods --all-namespaces
```

**Expected Results**:
```
ClusterVersion: Available=True
ClusterOperators: All Available=True, Degraded=False
Nodes: All Ready
Pods: All Running or Completed
```

### Component Verification

**Control Plane**:
```bash
# API server health
oc get --raw /healthz

# etcd health
oc get etcd -n openshift-etcd

# Scheduler status
oc get pods -n openshift-kube-scheduler
```

**Worker Nodes**:
```bash
# Kubelet status
oc debug node/<node-name>
chroot /host
systemctl status kubelet

# Container runtime
crictl ps
```

## Automated Verification Scripts

### Cluster Validation Script

```bash
#!/bin/bash
# cluster-validation.sh

set -e

echo "=== OpenShift Cluster Validation ==="
echo ""

# Check cluster version
echo "Checking cluster version..."
oc get clusterversion -o jsonpath='{.items[0].status.desired.version}'
echo ""

# Check operators
echo "Checking cluster operators..."
DEGRADED=$(oc get co -o json | jq -r '.items[] | select(.status.conditions[] | select(.type=="Degraded" and .status=="True")) | .metadata.name')
if [ -z "$DEGRADED" ]; then
    echo "✓ All operators healthy"
else
    echo "✗ Degraded operators: $DEGRADED"
    exit 1
fi

# Check nodes
echo "Checking nodes..."
NOT_READY=$(oc get nodes -o json | jq -r '.items[] | select(.status.conditions[] | select(.type=="Ready" and .status!="True")) | .metadata.name')
if [ -z "$NOT_READY" ]; then
    echo "✓ All nodes ready"
else
    echo "✗ Not ready nodes: $NOT_READY"
    exit 1
fi

# Check critical pods
echo "Checking critical pods..."
FAILED_PODS=$(oc get pods --all-namespaces -o json | jq -r '.items[] | select(.status.phase!="Running" and .status.phase!="Succeeded") | "\(.metadata.namespace)/\(.metadata.name)"')
if [ -z "$FAILED_PODS" ]; then
    echo "✓ All pods healthy"
else
    echo "✗ Failed pods: $FAILED_PODS"
    exit 1
fi

echo ""
echo "=== Validation Complete ==="
```

### Network Connectivity Test

```bash
#!/bin/bash
# network-test.sh

echo "=== Network Connectivity Test ==="

# Test pod-to-pod
echo "Testing pod-to-pod connectivity..."
oc run test-pod --image=busybox --restart=Never --rm -it -- \
  wget -O- http://kubernetes.default.svc.cluster.local

# Test external connectivity
echo "Testing external connectivity..."
oc run test-pod --image=busybox --restart=Never --rm -it -- \
  wget -O- https://www.google.com

# Test DNS
echo "Testing DNS resolution..."
oc run test-pod --image=busybox --restart=Never --rm -it -- \
  nslookup kubernetes.default.svc.cluster.local

echo "=== Network Test Complete ==="
```

### Storage Verification

```bash
#!/bin/bash
# storage-test.sh

echo "=== Storage Verification ==="

# Check storage classes
echo "Available storage classes:"
oc get storageclass

# Test PVC creation
cat <<EOF | oc apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: test-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: ibmc-vpc-block-general-purpose
EOF

# Wait for PVC to bind
echo "Waiting for PVC to bind..."
oc wait --for=condition=Bound pvc/test-pvc --timeout=60s

# Cleanup
oc delete pvc test-pvc

echo "=== Storage Test Complete ==="
```

## Application Deployment Test

### Sample Application

```yaml
# test-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: test
  template:
    metadata:
      labels:
        app: test
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: test-app
spec:
  selector:
    app: test
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: test-app
spec:
  to:
    kind: Service
    name: test-app
  port:
    targetPort: 80
```

### Deployment Verification

```bash
#!/bin/bash
# app-test.sh

echo "=== Application Deployment Test ==="

# Deploy test app
oc apply -f test-app.yaml

# Wait for deployment
oc wait --for=condition=Available deployment/test-app --timeout=120s

# Get route
ROUTE=$(oc get route test-app -o jsonpath='{.spec.host}')

# Test application
echo "Testing application at $ROUTE..."
curl -s http://$ROUTE | grep "Welcome to nginx"

# Cleanup
oc delete -f test-app.yaml

echo "=== Application Test Complete ==="
```

## Performance Baseline

### Resource Usage Baseline

```bash
#!/bin/bash
# baseline.sh

echo "=== Collecting Performance Baseline ==="

# Node resources
echo "Node resource usage:"
oc adm top nodes

# Pod resources
echo "Pod resource usage:"
oc adm top pods --all-namespaces

# API server latency
echo "API server latency:"
oc get --raw /metrics | grep apiserver_request_duration_seconds

echo "=== Baseline Collection Complete ==="
```

## Monitoring Setup Verification

### Check Monitoring Stack

```bash
#!/bin/bash
# monitoring-check.sh

echo "=== Monitoring Stack Verification ==="

# Check Prometheus
echo "Checking Prometheus..."
oc get prometheus -n openshift-monitoring

# Check Alertmanager
echo "Checking Alertmanager..."
oc get alertmanager -n openshift-monitoring

# Check Grafana
echo "Checking Grafana..."
oc get route grafana -n openshift-monitoring

# Test metrics endpoint
echo "Testing metrics..."
oc get --raw /api/v1/namespaces/openshift-monitoring/services/prometheus-k8s:web/proxy/api/v1/query?query=up

echo "=== Monitoring Verification Complete ==="
```

## Security Verification

### Security Posture Check

```bash
#!/bin/bash
# security-check.sh

echo "=== Security Verification ==="

# Check encryption
echo "Checking encryption status..."
oc get cluster -o jsonpath='{.spec.encryption}'

# Check security groups
echo "Checking security groups..."
ibmcloud is security-groups

# Check network policies
echo "Checking network policies..."
oc get networkpolicies --all-namespaces

# Check pod security
echo "Checking pod security policies..."
oc get scc

echo "=== Security Check Complete ==="
```

## Integration Verification

### External Service Connectivity

```bash
#!/bin/bash
# integration-check.sh

echo "=== Integration Verification ==="

# Test COS connectivity
echo "Testing Cloud Object Storage..."
oc get configs.imageregistry.operator.openshift.io/cluster -o yaml

# Test Key Protect
echo "Testing Key Protect..."
ibmcloud kp keys

# Test Secrets Manager
echo "Testing Secrets Manager..."
ibmcloud secrets-manager secrets

echo "=== Integration Check Complete ==="
```

## Comprehensive Validation Suite

### Master Validation Script

```bash
#!/bin/bash
# validate-all.sh

set -e

echo "======================================"
echo "OpenShift Cluster Validation Suite"
echo "======================================"
echo ""

# Run all validation scripts
./cluster-validation.sh
./network-test.sh
./storage-test.sh
./app-test.sh
./baseline.sh
./monitoring-check.sh
./security-check.sh
./integration-check.sh

echo ""
echo "======================================"
echo "All Validations Passed Successfully!"
echo "======================================"
```

## Best Practices

### Verification

✅ Run validation after deployment
✅ Automate verification scripts
✅ Document expected results
✅ Test all critical paths
✅ Verify integrations
✅ Establish baselines

### Monitoring

✅ Set up alerts
✅ Monitor key metrics
✅ Regular health checks
✅ Performance tracking
✅ Capacity planning
✅ Incident response

### Documentation

✅ Document procedures
✅ Record baseline metrics
✅ Track configuration changes
✅ Maintain runbooks
✅ Update regularly
✅ Share with team

## Key Takeaways

✅ Verification ensures proper deployment
✅ Automated scripts save time
✅ Baselines enable comparison
✅ Regular checks prevent issues
✅ Documentation is essential
✅ Continuous validation important

## Next Steps

Learn about:
- Terraform mapping
- Module usage patterns
- Best practices

---

**Navigation**: [← Back: Cluster Lifecycle](18-cluster-lifecycle.md) | [Next: Terraform Mapping →](20-terraform-mapping.md)
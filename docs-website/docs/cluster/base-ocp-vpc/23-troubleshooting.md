# Troubleshooting

## Introduction

This chapter provides solutions to common issues encountered when deploying and managing OpenShift clusters on IBM Cloud VPC. It covers diagnostic techniques, common problems, and resolution steps.

## General Troubleshooting Approach

### Step 1: Identify the Problem
- What is the symptom?
- When did it start?
- What changed recently?
- Is it reproducible?

### Step 2: Gather Information
- Check logs
- Review metrics
- Examine events
- Collect error messages

### Step 3: Isolate the Cause
- Test components individually
- Check dependencies
- Review configurations
- Verify connectivity

### Step 4: Implement Solution
- Apply fix
- Test thoroughly
- Monitor results
- Document resolution

## Deployment Issues

### Problem: Terraform Apply Fails

**Symptoms**:
- Terraform errors during apply
- Resources not created
- Timeout errors

**Common Causes**:
```
1. Insufficient IAM permissions
2. Resource quota exceeded
3. Invalid configuration
4. Network connectivity issues
5. Service unavailability
```

**Solutions**:
```bash
# Check IAM permissions
ibmcloud iam user-policies <user-email>

# Check quotas
ibmcloud resource quotas

# Validate Terraform configuration
terraform validate

# Check IBM Cloud status
https://cloud.ibm.com/status

# Enable detailed logging
export TF_LOG=DEBUG
terraform apply
```

### Problem: Cluster Provisioning Stuck

**Symptoms**:
- Cluster stuck in "deploying" state
- Provisioning takes longer than expected
- No progress for extended period

**Solutions**:
```bash
# Check cluster status
ibmcloud oc cluster get --cluster <cluster-name>

# View cluster events
ibmcloud oc cluster events --cluster <cluster-name>

# Check worker status
ibmcloud oc workers --cluster <cluster-name>

# Review logs
ibmcloud logging log-show

# If stuck > 2 hours, contact support
ibmcloud support case-create
```

### Problem: Workers Not Joining Cluster

**Symptoms**:
- Workers in "provision_pending" state
- Workers created but not Ready
- Kubelet not starting

**Solutions**:
```bash
# Check worker details
ibmcloud oc worker get --cluster <cluster> --worker <worker-id>

# Check security groups
ibmcloud is security-groups

# Verify subnet configuration
ibmcloud is subnets

# Check worker logs
ibmcloud oc worker reload --cluster <cluster> --worker <worker-id>
```

## Networking Issues

### Problem: Cannot Access API Server

**Symptoms**:
- kubectl/oc commands timeout
- Cannot connect to cluster
- Connection refused errors

**Solutions**:
```bash
# Check endpoint type
ibmcloud oc cluster get --cluster <cluster> | grep Endpoint

# Test connectivity
curl -k https://<api-endpoint>:6443/healthz

# Check security groups
ibmcloud is security-group-rules <sg-id>

# Verify VPN connection (if private endpoint)
ping <api-endpoint>

# Check CBR rules
ibmcloud cbr rules

# Verify IAM permissions
ibmcloud iam user-policies <user-email>
```

### Problem: Pods Cannot Communicate

**Symptoms**:
- Pod-to-pod connectivity fails
- Service discovery not working
- DNS resolution errors

**Solutions**:
```bash
# Check network policies
oc get networkpolicies --all-namespaces

# Test DNS
oc run test --image=busybox --rm -it -- nslookup kubernetes.default

# Check CNI plugin
oc get pods -n openshift-network-operator

# Verify security groups
ibmcloud is security-group-rules <sg-id>

# Check pod network
oc get network.operator cluster -o yaml
```

### Problem: Cannot Access Applications

**Symptoms**:
- Routes not accessible
- Load balancer not working
- Ingress errors

**Solutions**:
```bash
# Check route
oc get route <route-name>

# Verify service
oc get svc <service-name>

# Check endpoints
oc get endpoints <service-name>

# Test from pod
oc run test --image=busybox --rm -it -- wget -O- http://<service>

# Check load balancer
ibmcloud is load-balancers

# Verify DNS
nslookup <route-hostname>
```

## Storage Issues

### Problem: PVC Not Binding

**Symptoms**:
- PVC stuck in Pending state
- Volume provisioning fails
- Storage class errors

**Solutions**:
```bash
# Check PVC status
oc describe pvc <pvc-name>

# Verify storage class
oc get storageclass

# Check CSI driver
oc get pods -n kube-system | grep csi

# Review events
oc get events --sort-by='.lastTimestamp'

# Check quotas
ibmcloud resource quotas

# Verify IAM authorization
ibmcloud iam authorizations
```

### Problem: Registry Storage Issues

**Symptoms**:
- Cannot push images
- Registry pods failing
- COS connectivity errors

**Solutions**:
```bash
# Check registry operator
oc get configs.imageregistry.operator.openshift.io/cluster

# Verify COS bucket
ibmcloud cos bucket-head --bucket <bucket-name>

# Check registry pods
oc get pods -n openshift-image-registry

# Test COS connectivity
curl -v https://<cos-endpoint>

# Verify credentials
oc get secret image-registry-private-configuration \
  -n openshift-image-registry -o yaml
```

## Performance Issues

### Problem: Slow API Response

**Symptoms**:
- kubectl/oc commands slow
- API timeouts
- High latency

**Solutions**:
```bash
# Check control plane resources
oc adm top nodes | grep master

# Review API server metrics
oc get --raw /metrics | grep apiserver_request_duration

# Check etcd performance
oc get etcd -n openshift-etcd

# Verify network latency
ping <api-endpoint>

# Check for resource contention
oc get events --sort-by='.lastTimestamp' | grep -i throttl
```

### Problem: Pod Scheduling Delays

**Symptoms**:
- Pods stuck in Pending
- Long scheduling times
- Resource constraints

**Solutions**:
```bash
# Check pod status
oc describe pod <pod-name>

# View node resources
oc adm top nodes

# Check scheduler logs
oc logs -n openshift-kube-scheduler <scheduler-pod>

# Review resource requests
oc get pods -o json | jq '.items[].spec.containers[].resources'

# Check for taints
oc get nodes -o json | jq '.items[].spec.taints'
```

## Security Issues

### Problem: Authentication Failures

**Symptoms**:
- Cannot log in
- Token expired
- Permission denied

**Solutions**:
```bash
# Get new token
ibmcloud oc cluster config --cluster <cluster> --admin

# Check IAM permissions
ibmcloud iam user-policies <user-email>

# Verify RBAC
oc get rolebindings,clusterrolebindings --all-namespaces

# Check service account
oc get sa <service-account> -o yaml

# Review audit logs
oc get events --sort-by='.lastTimestamp' | grep -i auth
```

### Problem: Encryption Issues

**Symptoms**:
- Cannot access encrypted data
- Key Protect errors
- etcd encryption failures

**Solutions**:
```bash
# Check KMS configuration
oc get cluster -o jsonpath='{.spec.encryption}'

# Verify Key Protect access
ibmcloud kp keys

# Check IAM authorization
ibmcloud iam authorizations

# Review encryption status
oc get secrets -n openshift-config

# Check for key rotation
ibmcloud kp key-versions <key-id>
```

## Monitoring and Logging Issues

### Problem: Metrics Not Available

**Symptoms**:
- Prometheus not collecting metrics
- Grafana dashboards empty
- Metrics API errors

**Solutions**:
```bash
# Check monitoring stack
oc get pods -n openshift-monitoring

# Verify Prometheus
oc get prometheus -n openshift-monitoring

# Check metrics API
oc get --raw /apis/metrics.k8s.io/v1beta1/nodes

# Review monitoring config
oc get configmap cluster-monitoring-config \
  -n openshift-monitoring -o yaml

# Check storage
oc get pvc -n openshift-monitoring
```

### Problem: Logs Not Collected

**Symptoms**:
- Missing logs
- Fluentd errors
- Elasticsearch issues

**Solutions**:
```bash
# Check logging stack
oc get pods -n openshift-logging

# Verify Fluentd
oc get daemonset fluentd -n openshift-logging

# Check Elasticsearch
oc get elasticsearch -n openshift-logging

# Review logging config
oc get clusterlogging instance -n openshift-logging -o yaml

# Check for errors
oc logs -n openshift-logging <fluentd-pod>
```

## Diagnostic Commands

### Cluster Health

```bash
# Overall cluster status
oc get clusterversion
oc get clusteroperators
oc get nodes
oc get pods --all-namespaces

# Detailed node info
oc describe node <node-name>
oc adm top nodes

# Events
oc get events --all-namespaces --sort-by='.lastTimestamp'
```

### Component Logs

```bash
# API server
oc logs -n openshift-kube-apiserver <pod>

# Controller manager
oc logs -n openshift-kube-controller-manager <pod>

# Scheduler
oc logs -n openshift-kube-scheduler <pod>

# etcd
oc logs -n openshift-etcd <pod>
```

### Network Diagnostics

```bash
# Test pod-to-pod
oc run test --image=busybox --rm -it -- ping <pod-ip>

# Test DNS
oc run test --image=busybox --rm -it -- nslookup kubernetes.default

# Test external
oc run test --image=busybox --rm -it -- wget -O- https://www.google.com
```

## Getting Help

### IBM Cloud Support

```bash
# Create support case
ibmcloud support case-create \
  --type technical \
  --subject "OpenShift cluster issue" \
  --description "Detailed description"

# View cases
ibmcloud support cases

# Update case
ibmcloud support case-update <case-number>
```

### Community Resources

- OpenShift Documentation
- IBM Cloud Documentation
- Red Hat Customer Portal
- Stack Overflow
- GitHub Issues

### Information to Provide

When seeking help, include:
- Cluster ID and name
- OpenShift version
- Error messages
- Steps to reproduce
- Recent changes
- Diagnostic output

## Key Takeaways

✅ Follow systematic troubleshooting approach
✅ Check logs and events first
✅ Verify configurations
✅ Test connectivity
✅ Review recent changes
✅ Document solutions
✅ Contact support when needed

## Next Steps

Learn about:
- Outputs and integration patterns

---

**Navigation**: [← Back: Best Practices](22-best-practices.md) | [Next: Outputs and Integration →](24-outputs-integration.md)
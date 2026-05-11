# Autoscaling Configuration

## Introduction

Autoscaling automatically adjusts cluster capacity based on workload demands, optimizing resource utilization and costs. OpenShift supports both horizontal pod autoscaling (scaling application replicas) and cluster autoscaling (scaling worker nodes). This chapter explains autoscaling concepts, configuration, and best practices.

## Types of Autoscaling

### Horizontal Pod Autoscaler (HPA)

**What It Does**:
Automatically scales the number of pod replicas based on metrics.

**Metrics**:
- CPU utilization
- Memory utilization
- Custom metrics
- External metrics

**Use Cases**:
- Web applications with variable traffic
- API services
- Batch processing
- Event-driven workloads

### Vertical Pod Autoscaler (VPA)

**What It Does**:
Automatically adjusts CPU and memory requests/limits for pods.

**Benefits**:
- Right-sizes resource requests
- Improves resource utilization
- Reduces waste
- Optimizes costs

**Use Cases**:
- Applications with unknown resource needs
- Long-running services
- Resource optimization

### Cluster Autoscaler

**What It Does**:
Automatically adds or removes worker nodes based on pod scheduling needs.

**Triggers**:
- Pods pending due to insufficient resources
- Nodes underutilized for extended period
- Min/max node limits

**Use Cases**:
- Variable workload patterns
- Cost optimization
- Handling traffic spikes
- Development environments

## Horizontal Pod Autoscaling

### Configuration

**Basic HPA**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Multi-Metric HPA**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa-advanced
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
```

### Prerequisites

**Resource Requests Required**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
      - name: app
        image: myapp:latest
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

**Why**: HPA uses resource requests to calculate utilization percentage.

### Scaling Behavior

**Scale Up**:
```
Trigger: Average CPU > 70%
Action: Add replicas
Rate: Up to 100% increase per 15 seconds
Max: 20 replicas
```

**Scale Down**:
```
Trigger: Average CPU < 70%
Action: Remove replicas
Rate: Up to 50% decrease per 60 seconds
Stabilization: 5 minutes
Min: 3 replicas
```

## Cluster Autoscaling

### Configuration

**Enable Cluster Autoscaler**:
```yaml
apiVersion: autoscaling.openshift.io/v1
kind: ClusterAutoscaler
metadata:
  name: default
spec:
  podPriorityThreshold: -10
  resourceLimits:
    maxNodesTotal: 30
    cores:
      min: 8
      max: 128
    memory:
      min: 32
      max: 512
  scaleDown:
    enabled: true
    delayAfterAdd: 10m
    delayAfterDelete: 10m
    delayAfterFailure: 3m
    unneededTime: 10m
```

**Configure Machine Autoscaler**:
```yaml
apiVersion: autoscaling.openshift.io/v1beta1
kind: MachineAutoscaler
metadata:
  name: worker-us-south-1
  namespace: openshift-machine-api
spec:
  minReplicas: 1
  maxReplicas: 10
  scaleTargetRef:
    apiVersion: machine.openshift.io/v1beta1
    kind: MachineSet
    name: <cluster-name>-worker-us-south-1
```

### How It Works

**Scale Up Process**:
```
1. Pod cannot be scheduled (pending)
2. Autoscaler detects pending pod
3. Calculates required node size
4. Checks if within limits
5. Adds node to appropriate pool
6. Pod scheduled on new node
```

**Scale Down Process**:
```
1. Node underutilized (< 50% for 10 min)
2. All pods can fit on other nodes
3. No scale-down prevention annotations
4. Node cordoned (no new pods)
5. Pods drained to other nodes
6. Node removed after delay
```

### Scale-Down Prevention

**Prevent Specific Pods**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    cluster-autoscaler.kubernetes.io/safe-to-evict: "false"
```

**Prevent Node Scale-Down**:
```yaml
apiVersion: v1
kind: Node
metadata:
  annotations:
    cluster-autoscaler.kubernetes.io/scale-down-disabled: "true"
```

## Best Practices

### HPA Best Practices

**1. Set Appropriate Thresholds**:
```
CPU: 70-80% (allows headroom)
Memory: 80-90% (less volatile)
Custom: Based on application behavior
```

**2. Define Min/Max Replicas**:
```
Min: Enough for baseline load
Max: Budget and capacity limits
Example: min=3, max=20
```

**3. Use Stabilization Windows**:
```
Scale Up: Short (0-30s) for responsiveness
Scale Down: Long (5-10min) for stability
```

**4. Monitor HPA Events**:
```bash
oc describe hpa myapp-hpa
oc get hpa --watch
```

### Cluster Autoscaler Best Practices

**1. Set Realistic Limits**:
```
Min Nodes: Handle baseline workload
Max Nodes: Budget constraint
Example: min=3, max=30
```

**2. Configure Appropriate Delays**:
```
After Add: 10 minutes (allow stabilization)
After Delete: 10 minutes (prevent thrashing)
Unneeded Time: 10 minutes (ensure truly idle)
```

**3. Use Pod Disruption Budgets**:
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: myapp-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: myapp
```

**4. Monitor Autoscaler Logs**:
```bash
oc logs -n kube-system deployment/cluster-autoscaler
```

## Advanced Configurations

### Custom Metrics

**Using Prometheus Metrics**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-custom-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
```

### Scheduled Scaling

**Using CronJob**:
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-up-business-hours
spec:
  schedule: "0 8 * * 1-5"  # 8 AM weekdays
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: kubectl
            image: bitnami/kubectl
            command:
            - /bin/sh
            - -c
            - kubectl scale deployment myapp --replicas=10
          restartPolicy: OnFailure
```

## Monitoring and Troubleshooting

### Monitoring HPA

**Check HPA Status**:
```bash
# View HPA
oc get hpa

# Detailed info
oc describe hpa myapp-hpa

# Watch scaling events
oc get hpa --watch

# View metrics
oc get --raw /apis/metrics.k8s.io/v1beta1/namespaces/default/pods
```

### Monitoring Cluster Autoscaler

**Check Autoscaler Status**:
```bash
# View autoscaler logs
oc logs -n kube-system deployment/cluster-autoscaler

# Check machine autoscalers
oc get machineautoscaler -n openshift-machine-api

# View machine sets
oc get machineset -n openshift-machine-api

# Check node count
oc get nodes
```

### Common Issues

**Problem**: HPA not scaling
**Solutions**:
```
1. Verify resource requests set
2. Check metrics server running
3. Verify HPA configuration
4. Check for errors in HPA events
```

**Problem**: Cluster autoscaler not adding nodes
**Solutions**:
```
1. Check if at max nodes
2. Verify pending pods exist
3. Check autoscaler logs
4. Verify machine autoscaler configured
5. Check resource quotas
```

**Problem**: Excessive scaling (flapping)
**Solutions**:
```
1. Increase stabilization windows
2. Adjust thresholds
3. Use pod disruption budgets
4. Review application behavior
```

## Cost Optimization

### Strategies

**1. Right-Size Min Replicas**:
```
Start small: min=2
Monitor: Actual usage
Adjust: Based on data
```

**2. Set Appropriate Max Limits**:
```
Budget: Set max based on budget
Monitor: Actual peak usage
Optimize: Reduce if not needed
```

**3. Use Scheduled Scaling**:
```
Business Hours: Scale up
Off Hours: Scale down
Weekends: Minimal capacity
```

**4. Combine HPA and Cluster Autoscaler**:
```
HPA: Scale pods first (fast, cheap)
Cluster Autoscaler: Add nodes when needed (slower, more expensive)
```

## Testing Autoscaling

### Load Testing HPA

**Generate Load**:
```bash
# Deploy load generator
oc run -it --rm load-generator --image=busybox --restart=Never -- /bin/sh

# Inside pod, generate requests
while true; do wget -q -O- http://myapp-service; done
```

**Monitor Scaling**:
```bash
# Watch HPA
oc get hpa --watch

# Watch pods
oc get pods --watch

# Check metrics
oc top pods
```

### Testing Cluster Autoscaler

**Create Pending Pods**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pause-pods
spec:
  replicas: 50
  selector:
    matchLabels:
      app: pause
  template:
    metadata:
      labels:
        app: pause
    spec:
      containers:
      - name: pause
        image: k8s.gcr.io/pause
        resources:
          requests:
            cpu: 1000m
            memory: 1Gi
```

**Monitor Node Addition**:
```bash
# Watch nodes
oc get nodes --watch

# Check autoscaler logs
oc logs -n kube-system deployment/cluster-autoscaler -f

# View machine sets
oc get machineset -n openshift-machine-api --watch
```

## Key Takeaways

✅ HPA scales application replicas
✅ Cluster autoscaler scales worker nodes
✅ Resource requests required for HPA
✅ Set appropriate min/max limits
✅ Use stabilization windows
✅ Monitor and adjust based on data
✅ Combine strategies for best results

## Next Steps

Learn about:
- Load balancer and VPE security
- Context-based restrictions
- Secrets Manager integration

---

**Navigation**: [← Back: Add-ons and Extensions](13-addons-extensions.md) | [Next: Load Balancer and VPE Security →](15-load-balancer-vpe-security.md)
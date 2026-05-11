# Cluster Lifecycle Management

## Introduction

Managing an OpenShift cluster throughout its lifecycle involves updates, upgrades, maintenance, and eventual decommissioning. Understanding lifecycle management ensures cluster reliability, security, and optimal performance. This chapter covers cluster lifecycle phases, update strategies, and operational best practices.

## Cluster Lifecycle Phases

### Phase 1: Provisioning

**Activities**:
- Infrastructure setup
- Cluster creation
- Initial configuration
- Validation

**Duration**: 1-2 hours

### Phase 2: Configuration

**Activities**:
- Add-on installation
- Security hardening
- Integration setup
- Application deployment

**Duration**: Days to weeks

### Phase 3: Operations

**Activities**:
- Monitoring
- Scaling
- Updates
- Troubleshooting

**Duration**: Months to years

### Phase 4: Decommissioning

**Activities**:
- Data backup
- Application migration
- Resource cleanup
- Documentation

**Duration**: Days to weeks

## Updates and Upgrades

### OpenShift Version Updates

**Version Types**:
```
Major: 4.x → 5.x (rare, significant changes)
Minor: 4.12 → 4.13 (quarterly, new features)
Patch: 4.12.1 → 4.12.2 (frequent, bug fixes)
```

**Update Channels**:
```
stable: Recommended for production
fast: Early access to updates
candidate: Pre-release testing
eus: Extended Update Support
```

### Update Process

**Preparation**:
```
1. Review release notes
2. Check compatibility
3. Backup cluster state
4. Test in non-production
5. Schedule maintenance window
6. Communicate to stakeholders
```

**Execution**:
```
1. Initiate update via console or CLI
2. Control plane updates first
3. Worker nodes update in rolling fashion
4. Monitor update progress
5. Verify cluster health
6. Validate applications
```

**Rollback**:
```
If issues occur:
1. Pause update
2. Assess impact
3. Rollback if necessary
4. Investigate root cause
5. Plan retry
```

### Update Commands

```bash
# Check current version
oc get clusterversion

# View available updates
oc adm upgrade

# Start update
oc adm upgrade --to=4.13.5

# Monitor update progress
oc get clusteroperators
oc get nodes
```

## Maintenance Windows

### Planning Maintenance

**Considerations**:
```
Timing: Off-peak hours
Duration: 2-4 hours typical
Frequency: Monthly for patches
Communication: Advance notice
Rollback Plan: Always prepared
```

**Maintenance Checklist**:
```
[ ] Review planned changes
[ ] Backup cluster state
[ ] Notify stakeholders
[ ] Prepare rollback plan
[ ] Schedule maintenance window
[ ] Verify monitoring active
[ ] Document procedures
```

### During Maintenance

**Activities**:
```
1. Apply updates
2. Monitor progress
3. Validate functionality
4. Check application health
5. Review logs
6. Document issues
```

**Communication**:
```
Start: Maintenance beginning
Progress: Regular updates
Issues: Immediate notification
Complete: Summary and next steps
```

## Backup and Recovery

### What to Backup

**Cluster Configuration**:
```
- etcd snapshots
- Cluster operator configs
- Custom resources
- Secrets and ConfigMaps
```

**Application Data**:
```
- Persistent volumes
- Database backups
- Application state
- Configuration files
```

### Backup Strategies

**etcd Backup**:
```bash
# Create etcd snapshot
oc debug node/<node-name>
chroot /host
/usr/local/bin/cluster-backup.sh /home/core/backup

# Verify backup
ls -lh /home/core/backup/
```

**Velero Backup**:
```yaml
apiVersion: velero.io/v1
kind: Backup
metadata:
  name: daily-backup
spec:
  includedNamespaces:
  - '*'
  schedule: "0 1 * * *"
  ttl: 720h
```

### Recovery Procedures

**etcd Recovery**:
```
1. Stop cluster
2. Restore etcd from snapshot
3. Restart cluster
4. Verify cluster state
5. Validate applications
```

**Application Recovery**:
```
1. Restore from Velero backup
2. Verify PVs restored
3. Check application pods
4. Validate data integrity
5. Test functionality
```

## Scaling Operations

### Vertical Scaling

**Control Plane**:
```
Cannot resize: Fixed during creation
Workaround: Create new cluster, migrate
```

**Worker Nodes**:
```
Cannot resize: Fixed per worker pool
Workaround: Create new pool, migrate workloads
```

### Horizontal Scaling

**Add Workers**:
```bash
# Via CLI
ibmcloud oc worker-pool resize \
  --cluster <cluster> \
  --worker-pool <pool> \
  --size-per-zone 5

# Via Terraform
worker_count = 5
```

**Remove Workers**:
```bash
# Cordon node
oc adm cordon <node>

# Drain node
oc adm drain <node> --ignore-daemonsets

# Remove worker
ibmcloud oc worker rm \
  --cluster <cluster> \
  --worker <worker-id>
```

## Monitoring Cluster Health

### Key Metrics

**Cluster Level**:
```
- API server response time
- etcd latency
- Control plane CPU/memory
- Worker node count
- Pod count
```

**Node Level**:
```
- CPU utilization
- Memory utilization
- Disk usage
- Network throughput
- Pod density
```

**Application Level**:
```
- Pod restarts
- Container errors
- Resource usage
- Request latency
- Error rates
```

### Health Checks

```bash
# Cluster operators
oc get clusteroperators

# Node status
oc get nodes

# Pod health
oc get pods --all-namespaces

# Events
oc get events --sort-by='.lastTimestamp'

# Logs
oc logs -n openshift-<component> <pod>
```

## Troubleshooting Common Issues

### Update Failures

**Symptoms**:
- Update stuck
- Operators degraded
- Nodes not updating

**Solutions**:
```
1. Check operator logs
2. Verify node connectivity
3. Check resource availability
4. Review update prerequisites
5. Contact support if needed
```

### Performance Degradation

**Symptoms**:
- Slow API responses
- Pod scheduling delays
- Application timeouts

**Solutions**:
```
1. Check resource utilization
2. Review etcd performance
3. Analyze network latency
4. Check for resource contention
5. Scale if necessary
```

### Node Failures

**Symptoms**:
- Node NotReady
- Pods evicted
- Workload disruption

**Solutions**:
```
1. Check node logs
2. Verify network connectivity
3. Check disk space
4. Review system resources
5. Replace node if hardware issue
```

## Decommissioning

### Planning Decommissioning

**Considerations**:
```
- Data migration
- Application relocation
- DNS updates
- Certificate management
- Cost optimization
```

**Checklist**:
```
[ ] Backup all data
[ ] Document configuration
[ ] Migrate applications
[ ] Update DNS records
[ ] Remove integrations
[ ] Delete resources
[ ] Verify cleanup
```

### Decommissioning Process

**Step 1: Preparation**
```
1. Backup cluster state
2. Export configurations
3. Document dependencies
4. Plan migration
```

**Step 2: Migration**
```
1. Deploy to new cluster
2. Migrate data
3. Update DNS
4. Test functionality
5. Switch traffic
```

**Step 3: Cleanup**
```
1. Delete applications
2. Remove worker pools
3. Delete cluster
4. Clean up VPC resources
5. Remove DNS records
6. Delete backups (after retention)
```

**Step 4: Verification**
```
1. Verify all resources deleted
2. Check billing stopped
3. Update documentation
4. Archive records
```

## Best Practices

### Updates

✅ Test in non-production first
✅ Schedule during maintenance windows
✅ Monitor update progress
✅ Have rollback plan
✅ Document changes
✅ Communicate with stakeholders

### Backups

✅ Regular automated backups
✅ Test restore procedures
✅ Multiple backup locations
✅ Retention policies
✅ Encryption at rest
✅ Access controls

### Monitoring

✅ Comprehensive monitoring
✅ Alerting on critical metrics
✅ Regular health checks
✅ Log aggregation
✅ Performance baselines
✅ Capacity planning

### Operations

✅ Document procedures
✅ Automate where possible
✅ Regular maintenance
✅ Capacity planning
✅ Security updates
✅ Disaster recovery testing

## Key Takeaways

✅ Lifecycle management is continuous
✅ Regular updates essential for security
✅ Backups critical for recovery
✅ Monitoring prevents issues
✅ Plan decommissioning carefully
✅ Documentation is key

## Next Steps

Learn about:
- Runtime scripts and verification
- Terraform mapping
- Module usage patterns

---

**Navigation**: [← Back: Secrets Manager Integration](17-secrets-manager-integration.md) | [Next: Runtime Scripts and Verification →](19-runtime-scripts-verification.md)
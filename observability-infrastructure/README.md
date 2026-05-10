# 📊 Observability Infrastructure Module

## Overview

The Observability Infrastructure module provides comprehensive monitoring, logging, and tracing capabilities for IBM Cloud Landing Zone deployments. This module enables visibility into infrastructure health, application performance, and security events.

## 🎯 What This Module Covers

### Core Observability Services

#### 1. **IBM Cloud Monitoring (Sysdig)**
- Infrastructure metrics collection
- Application performance monitoring
- Custom metrics and dashboards
- Alerting and notifications
- Prometheus-compatible metrics

#### 2. **IBM Log Analysis (LogDNA)**
- Centralized log aggregation
- Real-time log streaming
- Log parsing and filtering
- Log archival to COS
- Compliance and audit logging

#### 3. **Activity Tracker**
- Account-level audit events
- Resource lifecycle tracking
- Security event monitoring
- Compliance reporting
- Event routing and archival

#### 4. **Flow Logs for VPC**
- Network traffic analysis
- Security investigation
- Troubleshooting connectivity
- Compliance and audit
- Traffic pattern analysis

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Sources                              │
│   (VSIs, Kubernetes, Databases, Network, Applications)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Collection Agents                           │
│        (Sysdig Agent, LogDNA Agent, Flow Logs)              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Observability Platforms                         │
│    (Monitoring, Log Analysis, Activity Tracker)             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Analysis & Alerting                         │
│         (Dashboards, Alerts, Reports, Archives)             │
└─────────────────────────────────────────────────────────────┘
```

## 📈 IBM Cloud Monitoring (Sysdig)

### Instance Provisioning

```hcl
resource "ibm_resource_instance" "monitoring" {
  name              = "landing-zone-monitoring"
  service           = "sysdig-monitor"
  plan              = "graduated-tier"
  location          = "us-south"
  resource_group_id = var.resource_group_id
  
  parameters = {
    default_receiver = true
  }
}
```

### Agent Deployment on VSI

```hcl
resource "ibm_is_instance" "vsi" {
  # ... VSI configuration ...
  
  user_data = <<-EOT
    #!/bin/bash
    curl -sL https://ibm.biz/install-sysdig-agent | \
    sudo bash -s -- \
      --access_key ${ibm_resource_key.monitoring_key.credentials.Sysdig_Access_Key} \
      --collector ingest.us-south.monitoring.cloud.ibm.com \
      --tags "env:production,tier:web"
  EOT
}
```

### Kubernetes Agent Deployment

```hcl
resource "helm_release" "sysdig_agent" {
  name       = "sysdig-agent"
  repository = "https://charts.sysdig.com"
  chart      = "sysdig-deploy"
  namespace  = "ibm-observe"
  
  set_sensitive {
    name  = "global.sysdig.accessKey"
    value = ibm_resource_key.monitoring_key.credentials.Sysdig_Access_Key
  }
  
  set {
    name  = "global.sysdig.region"
    value = "us-south"
  }
  
  set {
    name  = "nodeAnalyzer.enabled"
    value = "true"
  }
}
```

### Custom Metrics

```hcl
# Prometheus-compatible metrics endpoint
resource "ibm_monitoring_metric" "custom" {
  instance_id = ibm_resource_instance.monitoring.guid
  
  metric_name = "application.requests.total"
  metric_type = "counter"
  
  labels = {
    environment = "production"
    service     = "api-gateway"
  }
}
```

### Alerting

```hcl
resource "ibm_monitoring_alert" "high_cpu" {
  instance_id = ibm_resource_instance.monitoring.guid
  name        = "High CPU Usage"
  description = "Alert when CPU exceeds 80%"
  
  condition {
    metric      = "cpu.used.percent"
    operator    = ">"
    threshold   = 80
    duration    = 300  # 5 minutes
  }
  
  notification_channels = [
    ibm_monitoring_notification_channel.email.id,
    ibm_monitoring_notification_channel.slack.id
  ]
}
```

## 📝 IBM Log Analysis (LogDNA)

### Instance Provisioning

```hcl
resource "ibm_resource_instance" "log_analysis" {
  name              = "landing-zone-logs"
  service           = "logdna"
  plan              = "7-day"
  location          = "us-south"
  resource_group_id = var.resource_group_id
}
```

### Agent Deployment on VSI

```hcl
resource "ibm_is_instance" "vsi" {
  # ... VSI configuration ...
  
  user_data = <<-EOT
    #!/bin/bash
    echo "deb https://repo.logdna.com stable main" | \
      sudo tee /etc/apt/sources.list.d/logdna.list
    wget -O- https://repo.logdna.com/logdna.gpg | sudo apt-key add -
    sudo apt-get update
    sudo apt-get install -y logdna-agent
    
    sudo logdna-agent -k ${ibm_resource_key.log_analysis_key.credentials.ingestion_key}
    sudo logdna-agent -s LOGDNA_APIHOST=api.us-south.logging.cloud.ibm.com
    sudo logdna-agent -s LOGDNA_LOGHOST=logs.us-south.logging.cloud.ibm.com
    sudo logdna-agent -t production,web-tier
    
    sudo systemctl enable logdna-agent
    sudo systemctl start logdna-agent
  EOT
}
```

### Kubernetes Agent Deployment

```hcl
resource "kubernetes_daemonset" "logdna_agent" {
  metadata {
    name      = "logdna-agent"
    namespace = "ibm-observe"
  }
  
  spec {
    selector {
      match_labels = {
        app = "logdna-agent"
      }
    }
    
    template {
      metadata {
        labels = {
          app = "logdna-agent"
        }
      }
      
      spec {
        container {
          name  = "logdna-agent"
          image = "icr.io/ext/logdna-agent:3"
          
          env {
            name  = "LOGDNA_INGESTION_KEY"
            value = ibm_resource_key.log_analysis_key.credentials.ingestion_key
          }
          
          env {
            name  = "LOGDNA_APIHOST"
            value = "api.us-south.logging.cloud.ibm.com"
          }
          
          env {
            name  = "LOGDNA_LOGHOST"
            value = "logs.us-south.logging.cloud.ibm.com"
          }
        }
      }
    }
  }
}
```

### Log Archival to COS

```hcl
resource "ibm_logging_archive" "cos_archive" {
  instance_id = ibm_resource_instance.log_analysis.guid
  
  cos_bucket_name = ibm_cos_bucket.logs_archive.bucket_name
  cos_endpoint    = ibm_cos_bucket.logs_archive.s3_endpoint_direct
  
  enabled = true
}
```

## 🔍 Activity Tracker

### Instance Provisioning

```hcl
resource "ibm_resource_instance" "activity_tracker" {
  name              = "landing-zone-activity-tracker"
  service           = "logdnaat"
  plan              = "7-day"
  location          = "us-south"
  resource_group_id = var.resource_group_id
  
  parameters = {
    default_receiver = true
  }
}
```

### Event Routing

```hcl
resource "ibm_atracker_route" "route" {
  name = "landing-zone-events"
  
  rules {
    target_ids = [ibm_atracker_target.cos.id]
    locations  = ["us-south", "us-east"]
  }
}

resource "ibm_atracker_target" "cos" {
  name        = "cos-archive-target"
  target_type = "cloud_object_storage"
  
  cos_endpoint {
    endpoint            = ibm_cos_bucket.activity_logs.s3_endpoint_direct
    target_crn          = ibm_cos_bucket.activity_logs.crn
    bucket              = ibm_cos_bucket.activity_logs.bucket_name
    api_key             = ibm_iam_service_api_key.atracker.apikey
    service_to_service_enabled = true
  }
}
```

### Event Filtering

```hcl
# Monitor specific events
resource "ibm_atracker_settings" "settings" {
  metadata_region_primary = "us-south"
  
  permitted_target_regions = [
    "us-south",
    "us-east"
  ]
  
  private_api_endpoint_only = false
}
```

## 🌊 Flow Logs for VPC

### VPC Flow Logs

```hcl
resource "ibm_is_flow_log" "vpc_flow_logs" {
  name           = "vpc-flow-logs"
  target         = ibm_is_vpc.vpc.id
  active         = true
  storage_bucket = ibm_cos_bucket.flow_logs.bucket_name
  
  resource_group = var.resource_group_id
}
```

### Subnet Flow Logs

```hcl
resource "ibm_is_flow_log" "subnet_flow_logs" {
  name           = "subnet-flow-logs"
  target         = ibm_is_subnet.subnet.id
  active         = true
  storage_bucket = ibm_cos_bucket.flow_logs.bucket_name
}
```

### Flow Log Analysis

```hcl
# COS bucket for flow logs
resource "ibm_cos_bucket" "flow_logs" {
  bucket_name          = "landing-zone-flow-logs"
  resource_instance_id = ibm_resource_instance.cos.id
  region_location      = "us-south"
  storage_class        = "smart"
  
  activity_tracking {
    read_data_events     = true
    write_data_events    = true
    activity_tracker_crn = ibm_resource_instance.activity_tracker.id
  }
  
  metrics_monitoring {
    usage_metrics_enabled  = true
    request_metrics_enabled = true
    metrics_monitoring_crn = ibm_resource_instance.monitoring.id
  }
}
```

## 📊 Dashboards and Visualization

### Monitoring Dashboard

```hcl
resource "ibm_monitoring_dashboard" "infrastructure" {
  instance_id = ibm_resource_instance.monitoring.guid
  name        = "Infrastructure Overview"
  
  panel {
    title = "CPU Usage"
    type  = "timechart"
    
    query {
      metric = "cpu.used.percent"
      aggregation = "avg"
      group_by = ["host.name"]
    }
  }
  
  panel {
    title = "Memory Usage"
    type  = "timechart"
    
    query {
      metric = "memory.used.percent"
      aggregation = "avg"
      group_by = ["host.name"]
    }
  }
  
  panel {
    title = "Network Traffic"
    type  = "timechart"
    
    query {
      metric = "net.bytes.total"
      aggregation = "sum"
      group_by = ["host.name"]
    }
  }
}
```

## 🚨 Alerting and Notifications

### Notification Channels

```hcl
# Email notification
resource "ibm_monitoring_notification_channel" "email" {
  instance_id = ibm_resource_instance.monitoring.guid
  name        = "ops-team-email"
  type        = "email"
  
  options {
    email_recipients = ["ops-team@example.com"]
  }
}

# Slack notification
resource "ibm_monitoring_notification_channel" "slack" {
  instance_id = ibm_resource_instance.monitoring.guid
  name        = "ops-team-slack"
  type        = "slack"
  
  options {
    url     = var.slack_webhook_url
    channel = "#infrastructure-alerts"
  }
}

# PagerDuty notification
resource "ibm_monitoring_notification_channel" "pagerduty" {
  instance_id = ibm_resource_instance.monitoring.guid
  name        = "pagerduty-oncall"
  type        = "pagerduty"
  
  options {
    account     = var.pagerduty_account
    service_key = var.pagerduty_service_key
  }
}
```

### Alert Policies

```hcl
# High memory usage alert
resource "ibm_monitoring_alert" "high_memory" {
  instance_id = ibm_resource_instance.monitoring.guid
  name        = "High Memory Usage"
  severity    = "high"
  
  condition {
    metric    = "memory.used.percent"
    operator  = ">"
    threshold = 85
    duration  = 600  # 10 minutes
  }
  
  notification_channels = [
    ibm_monitoring_notification_channel.email.id,
    ibm_monitoring_notification_channel.pagerduty.id
  ]
}

# Disk space alert
resource "ibm_monitoring_alert" "low_disk" {
  instance_id = ibm_resource_instance.monitoring.guid
  name        = "Low Disk Space"
  severity    = "critical"
  
  condition {
    metric    = "fs.used.percent"
    operator  = ">"
    threshold = 90
    duration  = 300  # 5 minutes
  }
  
  notification_channels = [
    ibm_monitoring_notification_channel.pagerduty.id
  ]
}
```

## 🔄 Integration Points

### Upstream Dependencies
- **VPC Infrastructure** - Network flow logs
- **VSI Infrastructure** - Agent deployment
- **Kubernetes/OpenShift** - Container monitoring
- **IAM Infrastructure** - Service IDs for agents
- **Storage Infrastructure** - Log archival to COS

### Downstream Consumers
- **Operations Teams** - Monitoring and alerting
- **Security Teams** - Audit and compliance
- **Development Teams** - Application performance
- **Compliance Teams** - Audit reports

## 📊 Common Monitoring Patterns

### Three-Tier Application Monitoring

```
Load Balancer Metrics
    ↓
Web Tier Monitoring (VSI/Kubernetes)
    ↓
Application Tier Monitoring
    ↓
Database Tier Monitoring
    ↓
Storage Tier Monitoring
```

### Log Aggregation Flow

```
Application Logs → LogDNA Agent → Log Analysis
System Logs → LogDNA Agent → Log Analysis
Audit Events → Activity Tracker → COS Archive
Network Flows → Flow Logs → COS → Analysis
```

## 🛠️ Terraform Resources

Key Terraform resources:
- `ibm_resource_instance` - Monitoring/logging instances
- `ibm_resource_key` - Access keys for agents
- `ibm_monitoring_alert` - Alert policies
- `ibm_monitoring_notification_channel` - Notification channels
- `ibm_is_flow_log` - VPC flow logs
- `ibm_atracker_route` - Activity Tracker routing
- `ibm_atracker_target` - Activity Tracker targets

## 📈 Best Practices

### 1. Monitoring
- Deploy agents on all compute resources
- Use tags for resource organization
- Create environment-specific dashboards
- Set up proactive alerting
- Monitor key business metrics

### 2. Logging
- Centralize all logs
- Implement log retention policies
- Archive logs to COS for compliance
- Use structured logging formats
- Implement log filtering and parsing

### 3. Activity Tracking
- Enable Activity Tracker in all regions
- Route events to COS for long-term storage
- Monitor security-critical events
- Regular audit log reviews
- Implement event-based automation

### 4. Flow Logs
- Enable flow logs for security analysis
- Use appropriate retention periods
- Analyze traffic patterns regularly
- Integrate with SIEM tools
- Monitor for anomalies

## 🔗 Related Documentation

- [VPC Infrastructure](../vpc-infrastructure/) - Flow logs integration
- [VSI Infrastructure](../vsi-infrastructure/) - Agent deployment
- [Security Infrastructure](../security-infrastructure/) - Security monitoring
- [Storage Infrastructure](../storage-infrastructure/) - Log archival
- [Kubernetes/OpenShift](../IBM-CLOUD-LANDING-ZONE-GUIDE.md#kubernetes-openshift) - Container monitoring

## 📚 Additional Resources

- [IBM Cloud Monitoring Documentation](https://cloud.ibm.com/docs/monitoring)
- [IBM Log Analysis Documentation](https://cloud.ibm.com/docs/log-analysis)
- [Activity Tracker Documentation](https://cloud.ibm.com/docs/activity-tracker)
- [VPC Flow Logs Documentation](https://cloud.ibm.com/docs/vpc?topic=vpc-flow-logs)
- [Sysdig Documentation](https://docs.sysdig.com/)
- [LogDNA Documentation](https://docs.logdna.com/)

---

**Navigation:** [← Back to Main Guide](../IBM-CLOUD-LANDING-ZONE-GUIDE.md) | [Next: Storage Infrastructure →](../storage-infrastructure/)
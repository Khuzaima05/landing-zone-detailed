# 🌐 Networking Infrastructure Module

## Overview

The Networking Infrastructure module provides advanced networking services for IBM Cloud Landing Zone deployments, including hybrid connectivity, DNS services, content delivery, and network security beyond the VPC foundation layer.

## 🎯 What This Module Covers

### Core Networking Services

#### 1. **Direct Link**
- Dedicated private connectivity to IBM Cloud
- Direct Link Dedicated (single-tenant)
- Direct Link Connect (multi-tenant)
- BGP routing and redundancy
- High-bandwidth, low-latency connections

#### 2. **Transit Gateway**
- Multi-VPC connectivity
- Cross-region networking
- On-premises integration
- Centralized routing
- Global routing capabilities

#### 3. **VPN Gateway**
- Site-to-site VPN connectivity
- Policy-based and route-based VPN
- High availability configurations
- IPsec encryption
- Multiple connection support

#### 4. **DNS Services**
- Private DNS zones
- Public DNS zones
- Global load balancing
- Health checks and failover
- DNSSEC support

#### 5. **Content Delivery Network (CDN)**
- Global content distribution
- Edge caching
- DDoS protection
- SSL/TLS termination
- Origin pull and push

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    On-Premises Network                       │
│              (Data Centers, Branch Offices)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    │                   │
            Direct Link            VPN Gateway
                    │                   │
                    └─────────┬─────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Transit Gateway                           │
│              (Central Routing Hub)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    VPC 1 (us-south)     VPC 2 (us-east)     VPC 3 (eu-de)
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    DNS Services                              │
│         (Private Zones, Public Zones, GLB)                   │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 Direct Link

### Direct Link Dedicated

```hcl
resource "ibm_dl_gateway" "dedicated" {
  name                = "landing-zone-direct-link"
  bgp_asn            = 64999
  global             = true
  metered            = false
  speed_mbps         = 10000  # 10 Gbps
  type               = "dedicated"
  carrier_name       = "carrier-name"
  customer_name      = "customer-name"
  cross_connect_router = "LAB-xcr01.dal09"
  location_name      = "dal09"
  resource_group     = var.resource_group_id
}
```

### Direct Link Connect

```hcl
resource "ibm_dl_gateway" "connect" {
  name           = "landing-zone-dl-connect"
  bgp_asn        = 64999
  global         = true
  metered        = false
  speed_mbps     = 1000  # 1 Gbps
  type           = "connect"
  port           = ibm_dl_port.port.id
  resource_group = var.resource_group_id
}
```

### Virtual Connection to VPC

```hcl
resource "ibm_dl_virtual_connection" "vpc_connection" {
  gateway    = ibm_dl_gateway.dedicated.id
  name       = "vpc-connection"
  type       = "vpc"
  network_id = ibm_is_vpc.vpc.crn
}
```

### BGP Configuration

```hcl
resource "ibm_dl_gateway" "dedicated" {
  # ... basic configuration ...
  
  bgp_asn            = 64999
  bgp_base_cidr      = "169.254.0.0/16"
  bgp_cer_cidr       = "169.254.0.29/30"
  bgp_ibm_cidr       = "169.254.0.30/30"
  
  # Authentication
  authentication_key = var.bgp_md5_key
}
```

## 🌉 Transit Gateway

### Transit Gateway Creation

```hcl
resource "ibm_tg_gateway" "transit_gateway" {
  name           = "landing-zone-transit-gateway"
  location       = "us-south"
  global         = true
  resource_group = var.resource_group_id
}
```

### VPC Connections

```hcl
# Connect VPC 1
resource "ibm_tg_connection" "vpc1_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "vpc"
  name         = "vpc1-connection"
  network_id   = ibm_is_vpc.vpc1.crn
}

# Connect VPC 2
resource "ibm_tg_connection" "vpc2_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "vpc"
  name         = "vpc2-connection"
  network_id   = ibm_is_vpc.vpc2.crn
}

# Connect VPC 3 (different region)
resource "ibm_tg_connection" "vpc3_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "vpc"
  name         = "vpc3-connection"
  network_id   = ibm_is_vpc.vpc3.crn
}
```

### Direct Link Connection

```hcl
resource "ibm_tg_connection" "direct_link_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "directlink"
  name         = "direct-link-connection"
  network_id   = ibm_dl_gateway.dedicated.crn
}
```

### Prefix Filtering

```hcl
resource "ibm_tg_connection_prefix_filter" "filter" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  connection_id = ibm_tg_connection.vpc1_connection.connection_id
  action       = "permit"
  prefix       = "10.0.0.0/8"
  le           = 32
  ge           = 8
}
```

## 🔐 VPN Gateway

### VPN Gateway Creation

```hcl
resource "ibm_is_vpn_gateway" "vpn" {
  name           = "landing-zone-vpn"
  subnet         = ibm_is_subnet.vpn_subnet.id
  mode           = "route"  # or "policy"
  resource_group = var.resource_group_id
}
```

### VPN Connection

```hcl
resource "ibm_is_vpn_gateway_connection" "connection" {
  name          = "on-premises-connection"
  vpn_gateway   = ibm_is_vpn_gateway.vpn.id
  peer_address  = "203.0.113.1"
  preshared_key = var.vpn_preshared_key
  
  # Local subnets (IBM Cloud)
  local_cidrs = [
    "10.240.0.0/16",
    "10.241.0.0/16"
  ]
  
  # Peer subnets (on-premises)
  peer_cidrs = [
    "192.168.0.0/16",
    "172.16.0.0/12"
  ]
  
  # IKE policy
  ike_policy = ibm_is_ike_policy.ike_policy.id
  
  # IPsec policy
  ipsec_policy = ibm_is_ipsec_policy.ipsec_policy.id
  
  # Dead peer detection
  dead_peer_detection {
    action   = "restart"
    interval = 30
    timeout  = 120
  }
}
```

### IKE Policy

```hcl
resource "ibm_is_ike_policy" "ike_policy" {
  name                     = "ike-policy"
  authentication_algorithm = "sha256"
  encryption_algorithm     = "aes256"
  dh_group                 = 14
  ike_version             = 2
  key_lifetime            = 28800
}
```

### IPsec Policy

```hcl
resource "ibm_is_ipsec_policy" "ipsec_policy" {
  name                     = "ipsec-policy"
  authentication_algorithm = "sha256"
  encryption_algorithm     = "aes256"
  pfs                      = "group_14"
  key_lifetime            = 3600
}
```

### High Availability VPN

```hcl
# Primary VPN Gateway
resource "ibm_is_vpn_gateway" "vpn_primary" {
  name   = "vpn-primary"
  subnet = ibm_is_subnet.vpn_subnet_zone1.id
  mode   = "route"
}

# Secondary VPN Gateway (different zone)
resource "ibm_is_vpn_gateway" "vpn_secondary" {
  name   = "vpn-secondary"
  subnet = ibm_is_subnet.vpn_subnet_zone2.id
  mode   = "route"
}

# Connections for both gateways
resource "ibm_is_vpn_gateway_connection" "primary_connection" {
  vpn_gateway   = ibm_is_vpn_gateway.vpn_primary.id
  peer_address  = "203.0.113.1"
  # ... connection configuration ...
}

resource "ibm_is_vpn_gateway_connection" "secondary_connection" {
  vpn_gateway   = ibm_is_vpn_gateway.vpn_secondary.id
  peer_address  = "203.0.113.2"
  # ... connection configuration ...
}
```

## 🌍 DNS Services

### Private DNS Zone

```hcl
resource "ibm_dns_zone" "private_zone" {
  name        = "internal.example.com"
  instance_id = ibm_resource_instance.dns.guid
  description = "Private DNS zone for internal services"
  label       = "internal"
}
```

### Permitted Networks

```hcl
resource "ibm_dns_permitted_network" "vpc_network" {
  instance_id = ibm_resource_instance.dns.guid
  zone_id     = ibm_dns_zone.private_zone.zone_id
  vpc_crn     = ibm_is_vpc.vpc.crn
  type        = "vpc"
}
```

### DNS Resource Records

```hcl
# A Record
resource "ibm_dns_resource_record" "a_record" {
  instance_id = ibm_resource_instance.dns.guid
  zone_id     = ibm_dns_zone.private_zone.zone_id
  type        = "A"
  name        = "app"
  rdata       = "10.240.0.10"
  ttl         = 300
}

# CNAME Record
resource "ibm_dns_resource_record" "cname_record" {
  instance_id = ibm_resource_instance.dns.guid
  zone_id     = ibm_dns_zone.private_zone.zone_id
  type        = "CNAME"
  name        = "www"
  rdata       = "app.internal.example.com"
  ttl         = 300
}

# SRV Record
resource "ibm_dns_resource_record" "srv_record" {
  instance_id = ibm_resource_instance.dns.guid
  zone_id     = ibm_dns_zone.private_zone.zone_id
  type        = "SRV"
  name        = "_http._tcp"
  rdata       = "10 60 80 app.internal.example.com"
  ttl         = 300
}
```

### Global Load Balancer

```hcl
resource "ibm_dns_glb" "glb" {
  name        = "app-glb"
  instance_id = ibm_resource_instance.dns.guid
  zone_id     = ibm_dns_zone.private_zone.zone_id
  description = "Global load balancer for application"
  ttl         = 60
  fallback_pool = ibm_dns_glb_pool.fallback_pool.pool_id
  default_pools = [
    ibm_dns_glb_pool.primary_pool.pool_id,
    ibm_dns_glb_pool.secondary_pool.pool_id
  ]
}

resource "ibm_dns_glb_pool" "primary_pool" {
  name                = "primary-pool"
  instance_id         = ibm_resource_instance.dns.guid
  description         = "Primary pool"
  enabled             = true
  healthy_origins_threshold = 1
  
  origins {
    name    = "origin-1"
    address = "10.240.0.10"
    enabled = true
  }
  
  healthcheck_region  = "us-south"
  healthcheck_subnets = [ibm_is_subnet.subnet.crn]
}
```

### Health Checks

```hcl
resource "ibm_dns_glb_monitor" "http_monitor" {
  name        = "http-health-check"
  instance_id = ibm_resource_instance.dns.guid
  description = "HTTP health check"
  type        = "HTTP"
  port        = 80
  interval    = 60
  retries     = 2
  timeout     = 5
  method      = "GET"
  path        = "/health"
  
  headers {
    name  = "Host"
    value = ["app.example.com"]
  }
  
  expected_codes = "200"
}
```

## 📊 Networking Patterns

### Hub-and-Spoke Architecture

```
                Transit Gateway (Hub)
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    VPC 1           VPC 2           VPC 3
  (Shared Svcs)   (Production)    (Development)
        │               │               │
    ┌───┴───┐       ┌───┴───┐       ┌───┴───┐
    │  DNS  │       │  App  │       │  App  │
    │  VPN  │       │  DB   │       │  DB   │
    └───────┘       └───────┘       └───────┘
```

### Hybrid Connectivity

```
On-Premises Network
        │
    ┌───┴───┐
    │       │
Direct Link  VPN (Backup)
    │       │
    └───┬───┘
        │
  Transit Gateway
        │
    IBM Cloud VPCs
```

## 🔄 Integration Points

### Upstream Dependencies
- **VPC Infrastructure** - VPC foundation required
- **Resource Management** - Resource groups
- **IAM Infrastructure** - Access policies

### Downstream Consumers
- **All VPC Resources** - Network connectivity
- **VSI Infrastructure** - Hybrid connectivity
- **Kubernetes/OpenShift** - Service discovery
- **Database Infrastructure** - Private DNS

## 🛠️ Terraform Resources

Key Terraform resources:
- `ibm_dl_gateway` - Direct Link gateway
- `ibm_dl_virtual_connection` - Direct Link VPC connection
- `ibm_tg_gateway` - Transit Gateway
- `ibm_tg_connection` - Transit Gateway connections
- `ibm_is_vpn_gateway` - VPN gateway
- `ibm_is_vpn_gateway_connection` - VPN connections
- `ibm_dns_zone` - DNS zones
- `ibm_dns_resource_record` - DNS records
- `ibm_dns_glb` - Global load balancer

## 📈 Best Practices

### 1. Direct Link
- Use redundant connections for HA
- Implement BGP for dynamic routing
- Monitor link utilization
- Plan IP addressing carefully
- Document BGP configurations

### 2. Transit Gateway
- Use global routing for multi-region
- Implement prefix filtering
- Monitor connection status
- Plan for growth
- Document routing policies

### 3. VPN
- Use strong encryption algorithms
- Implement redundant gateways
- Monitor tunnel status
- Regular key rotation
- Test failover scenarios

### 4. DNS
- Use private DNS for internal services
- Implement health checks for GLB
- Monitor DNS query patterns
- Regular zone audits
- Document DNS architecture

## 🔗 Related Documentation

- [VPC Infrastructure](../vpc-infrastructure/) - VPC foundation
- [Security Infrastructure](../security-infrastructure/) - Network security
- [Observability Infrastructure](../observability-infrastructure/) - Network monitoring
- [Transit Gateway Integration](../vpc-infrastructure/transit-gateway-integration.md) - Detailed TGW guide
- [VPN Architecture](../vpc-infrastructure/vpn-architecture.md) - Detailed VPN guide

## 📚 Additional Resources

- [Direct Link Documentation](https://cloud.ibm.com/docs/dl)
- [Transit Gateway Documentation](https://cloud.ibm.com/docs/transit-gateway)
- [VPN Gateway Documentation](https://cloud.ibm.com/docs/vpc?topic=vpc-using-vpn)
- [DNS Services Documentation](https://cloud.ibm.com/docs/dns-svcs)
- [Hybrid Networking Best Practices](https://cloud.ibm.com/docs/solution-tutorials?topic=solution-tutorials-vpc-multi-region)

---

**Navigation:** [← Back to Main Guide](../IBM-CLOUD-LANDING-ZONE-GUIDE.md) | [Next: IAM Infrastructure →](../iam-infrastructure/)
# 🔗 Terraform Module to Documentation Mapping

## 📋 Overview

This document provides a comprehensive mapping between the [terraform-ibm-landing-zone-vpc](https://github.com/terraform-ibm-modules/terraform-ibm-landing-zone-vpc) module and our VPC infrastructure documentation. It identifies coverage gaps, extra content, and provides cross-references for maintaining alignment between the Terraform implementation and documentation.

---

## 🎯 Executive Summary

### Coverage Status
- **Well Covered**: Core VPC concepts, subnets, ACLs, security groups, routing, VPN, flow logs
- **Partially Covered**: Hub-spoke DNS architecture, Transit Gateway integration
- **Missing from Docs**: Address prefixes, default security group cleanup, DNS custom resolvers, DNS zones/records
- **Extra in Docs**: Load balancers (not in this module), floating IPs (not in this module), deep service internals

### Key Findings
1. **Documentation is more comprehensive** than the Terraform module scope - it covers the entire VPC ecosystem
2. **Terraform module is focused** on foundational VPC networking infrastructure only
3. **Hub-Spoke DNS** is a major Terraform feature that needs expanded documentation coverage
4. **Address Prefixes** are a critical Terraform concept missing from documentation


### 📊 Resource Creation Sequence Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│         Terraform Resource Provisioning Order                        │
│         (Dependencies determine creation sequence)                   │
└─────────────────────────────────────────────────────────────────────┘

Phase 1: Foundation (No Dependencies)
═══════════════════════════════════════
┌─────────────────────┐
│  ibm_is_vpc         │  ← VPC must be created first
│  (VPC Foundation)   │
└──────────┬──────────┘
           │
           ▼
Phase 2: Address Space (Depends on VPC)
═══════════════════════════════════════
┌─────────────────────────────────────┐
│  ibm_is_vpc_address_prefix          │  ← Define IP address ranges
│  (Address Prefixes per Zone)        │
└──────────┬──────────────────────────┘
           │
           ├─────────────────────────────────┐
           │                                 │
           ▼                                 ▼
Phase 3: Gateways (Depends on VPC)
═══════════════════════════════════════
┌──────────────────────┐    ┌──────────────────────┐
│ ibm_is_public_gateway│    │ ibm_is_vpn_gateway   │
│ (Internet Access)    │    │ (Hybrid Connectivity)│
└──────────┬───────────┘    └──────────┬───────────┘
           │                           │
           └───────────┬───────────────┘
                       │
                       ▼
Phase 4: Network Security (Depends on VPC)
═══════════════════════════════════════
┌──────────────────────┐    ┌──────────────────────┐
│ ibm_is_network_acl   │    │ ibm_is_security_group│
│ (Subnet-level)       │    │ (Instance-level)     │
└──────────┬───────────┘    └──────────┬───────────┘
           │                           │
           │                           │
           └───────────┬───────────────┘
                       │
                       ▼
Phase 5: Subnets (Depends on Address Prefixes, ACLs, Gateways)
═══════════════════════════════════════
┌─────────────────────────────────────┐
│  ibm_is_subnet                      │  ← Requires:
│  (Compute Network Segments)         │    • VPC
│                                     │    • Address Prefix
│  Attached:                          │    • Network ACL
│  • Network ACL                      │    • Public Gateway (optional)
│  • Public Gateway (optional)        │
└──────────┬──────────────────────────┘
           │
           ▼
Phase 6: Routing (Depends on Subnets, Gateways)
═══════════════════════════════════════
┌─────────────────────────────────────┐
│  ibm_is_vpc_routing_table           │  ← Custom routing tables
│  ibm_is_vpc_routing_table_route     │  ← Custom routes
│                                     │
│  Routes to:                         │
│  • VPN Gateway                      │
│  • Transit Gateway                  │
│  • Public Gateway                   │
└──────────┬──────────────────────────┘
           │
           ▼
Phase 7: Security Rules (Depends on Security Groups, ACLs)
═══════════════════════════════════════
┌──────────────────────┐    ┌──────────────────────┐
│ ibm_is_network_acl   │    │ ibm_is_security_group│
│ _rule                │    │ _rule                │
│ (ACL Rules)          │    │ (SG Rules)           │
└──────────┬───────────┘    └──────────┬───────────┘
           │                           │
           └───────────┬───────────────┘
                       │
                       ▼
Phase 8: Observability (Depends on VPC, COS)
═══════════════════════════════════════
┌─────────────────────────────────────┐
│  ibm_iam_authorization_policy       │  ← VPC → COS authorization
│  ibm_is_flow_log                    │  ← Flow log collector
└──────────┬──────────────────────────┘
           │
           ▼
Phase 9: Hub-Spoke DNS (Depends on VPC, DNS Instance)
═══════════════════════════════════════
┌─────────────────────────────────────┐
│  ibm_resource_instance (DNS)        │  ← DNS service instance
│  ibm_dns_custom_resolver            │  ← Custom DNS resolver
│  ibm_dns_zone                       │  ← DNS zones
│  ibm_dns_permitted_network          │  ← VPC permissions
│  ibm_dns_resource_record            │  ← DNS records (A, CNAME, etc.)
│  ibm_is_vpc_dns_resolution_binding  │  ← Spoke → Hub binding
└─────────────────────────────────────┘

Total Provisioning Time: ~5-10 minutes
Critical Path: VPC → Address Prefixes → Subnets → Workloads
```

> **Dependency Management:** Terraform automatically handles dependencies through resource references. Explicit `depends_on` is rarely needed when using proper resource attributes.

---

## 📊 Terraform Variables to Documentation Mapping

### Module-Level Configuration

| Terraform Variable | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `create_vpc` | [vpc-foundation.md](./vpc-foundation.md) | ✅ Covered | VPC creation basics explained |
| `existing_vpc_id` | [vpc-foundation.md](./vpc-foundation.md) | ⚠️ Partial | Existing VPC usage not explicitly documented |
| `resource_group_id` | [vpc-foundation.md](./vpc-foundation.md) | ✅ Covered | Resource organization mentioned |
| `region` | [zones-datacenter-architecture.md](./zones-datacenter-architecture.md) | ✅ Covered | Regional architecture well documented |
| `tags` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | Metadata and tagging concepts covered |
| `access_tags` | Not documented | ❌ Missing | Access tags for IAM not covered |

### Naming Configuration

### 🗺️ Resource Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│           VPC Resource Dependency Relationships                      │
└─────────────────────────────────────────────────────────────────────┘

                        ┌──────────────┐
                        │   ibm_is_vpc │
                        │  (Root Node) │
                        └───────┬──────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Address      │ │ Public       │ │ Network ACL  │
        │ Prefixes     │ │ Gateways     │ │              │
        └───────┬──────┘ └───────┬──────┘ └───────┬──────┘
                │                │                │
                │                │                │
                └────────┬───────┴────────┬───────┘
                         │                │
                         ▼                ▼
                  ┌──────────────┐ ┌──────────────┐
                  │  Subnets     │ │ Security     │
                  │              │ │ Groups       │
                  └───────┬──────┘ └───────┬──────┘
                          │                │
                          │                │
                ┌─────────┴────────┬───────┴─────────┐
                │                  │                  │
                ▼                  ▼                  ▼
        ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
        │ Routing      │   │ ACL Rules    │  │ SG Rules     │
        │ Tables       │   │              │  │              │
        └───────┬──────┘   └──────────────┘  └──────────────┘
                │
                ▼
        ┌──────────────┐
        │ Routes       │
        │              │
        └──────────────┘

Dependency Rules:
─────────────────
VPC → Address Prefixes → Subnets → VSIs
VPC → Network ACLs → Subnets
VPC → Security Groups → VSIs
VPC → Public Gateways → Subnets
Subnets → Routing Tables → Routes
VPC → Flow Logs (requires COS)
VPC → DNS Resolution Binding (requires Hub VPC)

Legend:
───────
→  : "depends on" / "requires"
├─ : "can have multiple"
└─ : "optional dependency"
```


| Terraform Variable | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `prefix` | [vpc-foundation.md](./vpc-foundation.md) | ✅ Covered | Naming conventions mentioned |
| `name` | [vpc-foundation.md](./vpc-foundation.md) | ✅ Covered | VPC naming covered |
| `dns_binding_name` | Not documented | ❌ Missing | Hub-spoke DNS binding names not covered |
| `dns_instance_name` | Not documented | ❌ Missing | DNS instance naming not covered |
| `dns_custom_resolver_name` | Not documented | ❌ Missing | Custom resolver naming not covered |

### VPC Network Configuration

---

## 📊 Comprehensive Variable-to-Resource Mapping Table (50+ Variables)

| # | Variable Name | Type | Terraform Resource | IBM Cloud Service | Documentation | Required |
|---|---------------|------|-------------------|-------------------|---------------|----------|
| 1 | `create_vpc` | bool | `ibm_is_vpc` | VPC | [vpc-foundation.md](./vpc-foundation.md) | ✅ |
| 2 | `existing_vpc_id` | string | N/A (reference) | VPC | [vpc-foundation.md](./vpc-foundation.md) | ❌ |
| 3 | `resource_group_id` | string | All resources | Resource Groups | [vpc-foundation.md](./vpc-foundation.md) | ✅ |
| 4 | `region` | string | All resources | Regional Services | [zones-datacenter-architecture.md](./zones-datacenter-architecture.md) | ✅ |
| 5 | `prefix` | string | All resources (naming) | N/A | [vpc-foundation.md](./vpc-foundation.md) | ✅ |
| 6 | `name` | string | `ibm_is_vpc` | VPC | [vpc-foundation.md](./vpc-foundation.md) | ✅ |
| 7 | `tags` | list(string) | All resources | Tagging | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ❌ |
| 8 | `access_tags` | list(string) | All resources | IAM Access Tags | Not documented | ❌ |
| 9 | `network_cidrs` | list(string) | `ibm_is_vpc` | VPC CIDR | [cidr-planning-ipam.md](./cidr-planning-ipam.md) | ✅ |
| 10 | `address_prefixes` | object | `ibm_is_vpc_address_prefix` | Address Prefixes | Not documented | ❌ |
| 11 | `address_prefixes.zone-1` | list(string) | `ibm_is_vpc_address_prefix` | Address Prefixes | Not documented | ❌ |
| 12 | `address_prefixes.zone-2` | list(string) | `ibm_is_vpc_address_prefix` | Address Prefixes | Not documented | ❌ |
| 13 | `address_prefixes.zone-3` | list(string) | `ibm_is_vpc_address_prefix` | Address Prefixes | Not documented | ❌ |
| 14 | `use_public_gateways` | object | `ibm_is_public_gateway` | Public Gateway | [vpc-foundation.md](./vpc-foundation.md) | ❌ |
| 15 | `use_public_gateways.zone-1` | bool | `ibm_is_public_gateway` | Public Gateway | [vpc-foundation.md](./vpc-foundation.md) | ❌ |
| 16 | `use_public_gateways.zone-2` | bool | `ibm_is_public_gateway` | Public Gateway | [vpc-foundation.md](./vpc-foundation.md) | ❌ |
| 17 | `use_public_gateways.zone-3` | bool | `ibm_is_public_gateway` | Public Gateway | [vpc-foundation.md](./vpc-foundation.md) | ❌ |
| 18 | `default_network_acl_name` | string | `ibm_is_network_acl` | Network ACL | [network-acl-architecture.md](./network-acl-architecture.md) | ❌ |
| 19 | `default_security_group_name` | string | `ibm_is_security_group` | Security Group | [security-group-service-internals.md](./security-group-service-internals.md) | ❌ |
| 20 | `clean_default_sg_acl` | bool | Default SG/ACL cleanup | Security Hardening | Not documented | ❌ |
| 21 | `network_acls` | list(object) | `ibm_is_network_acl` | Network ACL | [network-acl-architecture.md](./network-acl-architecture.md) | ❌ |
| 22 | `network_acls[].name` | string | `ibm_is_network_acl` | Network ACL | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ |
| 23 | `network_acls[].add_ibm_cloud_internal_rules` | bool | `ibm_is_network_acl_rule` | ACL Rules | [acl-service-internals.md](./acl-service-internals.md) | ❌ |
| 24 | `network_acls[].prepend_ibm_rules` | bool | `ibm_is_network_acl_rule` | ACL Rules | [acl-service-internals.md](./acl-service-internals.md) | ❌ |
| 25 | `network_acls[].rules` | list(object) | `ibm_is_network_acl_rule` | ACL Rules | [network-acl-architecture.md](./network-acl-architecture.md) | ❌ |
| 26 | `network_acls[].rules[].name` | string | `ibm_is_network_acl_rule` | ACL Rules | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ |
| 27 | `network_acls[].rules[].action` | string | `ibm_is_network_acl_rule` | ACL Rules | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ |
| 28 | `network_acls[].rules[].direction` | string | `ibm_is_network_acl_rule` | ACL Rules | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ |
| 29 | `network_acls[].rules[].source` | string | `ibm_is_network_acl_rule` | ACL Rules | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ |
| 30 | `network_acls[].rules[].destination` | string | `ibm_is_network_acl_rule` | ACL Rules | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ |
| 31 | `network_acls[].rules[].tcp` | object | `ibm_is_network_acl_rule` | ACL Rules | [network-acl-architecture.md](./network-acl-architecture.md) | ❌ |
| 32 | `network_acls[].rules[].udp` | object | `ibm_is_network_acl_rule` | ACL Rules | [network-acl-architecture.md](./network-acl-architecture.md) | ❌ |
| 33 | `network_acls[].rules[].icmp` | object | `ibm_is_network_acl_rule` | ACL Rules | [network-acl-architecture.md](./network-acl-architecture.md) | ❌ |
| 34 | `subnets` | list(object) | `ibm_is_subnet` | Subnets | [subnet-service-internals.md](./subnet-service-internals.md) | ✅ |
| 35 | `subnets[].name` | string | `ibm_is_subnet` | Subnets | [subnet-service-internals.md](./subnet-service-internals.md) | ✅ |
| 36 | `subnets[].cidr` | string | `ibm_is_subnet` | Subnets | [cidr-planning-ipam.md](./cidr-planning-ipam.md) | ✅ |
| 37 | `subnets[].zone` | string | `ibm_is_subnet` | Subnets | [zones-datacenter-architecture.md](./zones-datacenter-architecture.md) | ✅ |
| 38 | `subnets[].network_acl` | string | `ibm_is_subnet` | Subnets | [network-acl-architecture.md](./network-acl-architecture.md) | ❌ |
| 39 | `subnets[].public_gateway` | bool | `ibm_is_subnet` | Subnets | [vpc-foundation.md](./vpc-foundation.md) | ❌ |
| 40 | `security_groups` | list(object) | `ibm_is_security_group` | Security Groups | [security-group-service-internals.md](./security-group-service-internals.md) | ❌ |
| 41 | `security_group_rules` | list(object) | `ibm_is_security_group_rule` | SG Rules | [security-group-service-internals.md](./security-group-service-internals.md) | ❌ |
| 42 | `security_group_rules[].name` | string | `ibm_is_security_group_rule` | SG Rules | [security-group-service-internals.md](./security-group-service-internals.md) | ✅ |
| 43 | `security_group_rules[].direction` | string | `ibm_is_security_group_rule` | SG Rules | [security-group-service-internals.md](./security-group-service-internals.md) | ✅ |
| 44 | `security_group_rules[].remote` | string | `ibm_is_security_group_rule` | SG Rules | [security-group-service-internals.md](./security-group-service-internals.md) | ✅ |
| 45 | `security_group_rules[].tcp` | object | `ibm_is_security_group_rule` | SG Rules | [security-group-service-internals.md](./security-group-service-internals.md) | ❌ |
| 46 | `security_group_rules[].udp` | object | `ibm_is_security_group_rule` | SG Rules | [security-group-service-internals.md](./security-group-service-internals.md) | ❌ |
| 47 | `security_group_rules[].icmp` | object | `ibm_is_security_group_rule` | SG Rules | [security-group-service-internals.md](./security-group-service-internals.md) | ❌ |
| 48 | `routes` | list(object) | `ibm_is_vpc_routing_table_route` | Custom Routes | [route-table-service.md](./route-table-service.md) | ❌ |
| 49 | `routes[].name` | string | `ibm_is_vpc_routing_table_route` | Custom Routes | [route-table-service.md](./route-table-service.md) | ✅ |
| 50 | `routes[].zone` | string | `ibm_is_vpc_routing_table_route` | Custom Routes | [zones-datacenter-architecture.md](./zones-datacenter-architecture.md) | ✅ |
| 51 | `routes[].destination` | string | `ibm_is_vpc_routing_table_route` | Custom Routes | [route-table-service.md](./route-table-service.md) | ✅ |
| 52 | `routes[].next_hop` | string | `ibm_is_vpc_routing_table_route` | Custom Routes | [route-table-service.md](./route-table-service.md) | ✅ |
| 53 | `enable_vpc_flow_logs` | bool | `ibm_is_flow_log` | Flow Logs | [flow-logs-observability.md](./flow-logs-observability.md) | ❌ |
| 54 | `create_authorization_policy_vpc_to_cos` | bool | `ibm_iam_authorization_policy` | IAM | [flow-logs-observability.md](./flow-logs-observability.md) | ❌ |
| 55 | `existing_storage_bucket_name` | string | `ibm_is_flow_log` | COS Bucket | [flow-logs-observability.md](./flow-logs-observability.md) | ❌ |
| 56 | `existing_cos_instance_guid` | string | `ibm_is_flow_log` | COS Instance | [flow-logs-observability.md](./flow-logs-observability.md) | ❌ |
| 57 | `enable_hub` | bool | Hub-Spoke DNS | DNS | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 58 | `hub_vpc_id` | string | `ibm_is_vpc_dns_resolution_binding` | DNS Binding | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 59 | `hub_vpc_crn` | string | `ibm_is_vpc_dns_resolution_binding` | DNS Binding | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 60 | `update_delegated_resolver` | bool | `ibm_dns_custom_resolver` | DNS Resolver | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 61 | `resolver_type` | string | `ibm_dns_custom_resolver` | DNS Resolver | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 62 | `skip_spoke_auth_policy` | bool | `ibm_iam_authorization_policy` | IAM | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 63 | `dns_binding_name` | string | `ibm_is_vpc_dns_resolution_binding` | DNS Binding | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 64 | `dns_instance_name` | string | `ibm_resource_instance` | DNS Instance | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 65 | `dns_custom_resolver_name` | string | `ibm_dns_custom_resolver` | DNS Resolver | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 66 | `dns_custom_resolver_description` | string | `ibm_dns_custom_resolver` | DNS Resolver | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 67 | `dns_location` | string | `ibm_dns_custom_resolver` | DNS Resolver | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 68 | `dns_zones` | list(object) | `ibm_dns_zone` | DNS Zones | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 69 | `dns_zones[].name` | string | `ibm_dns_zone` | DNS Zones | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ✅ |
| 70 | `dns_zones[].description` | string | `ibm_dns_zone` | DNS Zones | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 71 | `dns_records` | list(object) | `ibm_dns_resource_record` | DNS Records | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 72 | `dns_records[].zone` | string | `ibm_dns_resource_record` | DNS Records | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ✅ |
| 73 | `dns_records[].name` | string | `ibm_dns_resource_record` | DNS Records | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ✅ |
| 74 | `dns_records[].type` | string | `ibm_dns_resource_record` | DNS Records | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ✅ |
| 75 | `dns_records[].rdata` | string | `ibm_dns_resource_record` | DNS Records | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ✅ |
| 76 | `dns_records[].ttl` | number | `ibm_dns_resource_record` | DNS Records | [hub-spoke-dns-architecture.md](./hub-spoke-dns-architecture.md) | ❌ |
| 77 | `vpn_gateways` | list(object) | `ibm_is_vpn_gateway` | VPN Gateway | [vpn-architecture.md](./vpn-architecture.md) | ❌ |

> **Total Variables:** 77+ (including nested objects and arrays)  
> **Documented:** ~55 (71%)  
> **Missing from Docs:** ~22 (29%)  
> **Priority Gaps:** Address Prefixes, Hub-Spoke DNS, Default SG/ACL Cleanup


| Terraform Variable | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `network_cidrs` | [cidr-planning-ipam.md](./cidr-planning-ipam.md) | ✅ Covered | CIDR planning extensively documented |
| `address_prefixes` | Not documented | ❌ Missing | **Critical gap** - address prefixes not explained |
| `default_network_acl_name` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | Default ACL concepts covered |
| `default_security_group_name` | [security-group-service-internals.md](./security-group-service-internals.md) | ✅ Covered | Default SG concepts covered |
| `clean_default_sg_acl` | Not documented | ❌ Missing | Default SG/ACL cleanup not documented |

### Network ACLs

| Terraform Variable | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `network_acls` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | ACL architecture well documented |
| `network_acls[].name` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | ACL naming covered |
| `network_acls[].add_ibm_cloud_internal_rules` | [acl-service-internals.md](./acl-service-internals.md) | ⚠️ Partial | IBM internal rules mentioned but not detailed |
| `network_acls[].prepend_ibm_rules` | [acl-service-internals.md](./acl-service-internals.md) | ⚠️ Partial | Rule ordering covered but not this specific feature |
| `network_acls[].rules` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | ACL rules extensively documented |
| `network_acls[].rules[].name` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | Rule naming covered |
| `network_acls[].rules[].action` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | Allow/deny actions explained |
| `network_acls[].rules[].direction` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | Inbound/outbound directions explained |
| `network_acls[].rules[].source` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | Source CIDR explained |
| `network_acls[].rules[].destination` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | Destination CIDR explained |
| `network_acls[].rules[].tcp/udp/icmp` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | Protocol-specific rules covered |

### Public Gateways

| Terraform Variable | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `use_public_gateways` | [vpc-foundation.md](./vpc-foundation.md) | ✅ Covered | Public gateway concept well explained |
| `use_public_gateways.zone-1` | [zones-datacenter-architecture.md](./zones-datacenter-architecture.md) | ✅ Covered | Multi-zone architecture covered |
| `use_public_gateways.zone-2` | [zones-datacenter-architecture.md](./zones-datacenter-architecture.md) | ✅ Covered | Multi-zone architecture covered |
| `use_public_gateways.zone-3` | [zones-datacenter-architecture.md](./zones-datacenter-architecture.md) | ✅ Covered | Multi-zone architecture covered |

### Subnets

| Terraform Variable | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `subnets` | [subnet-service-internals.md](./subnet-service-internals.md) | ✅ Covered | Subnet architecture extensively documented |
| `subnets[].name` | [subnet-service-internals.md](./subnet-service-internals.md) | ✅ Covered | Subnet naming covered |
| `subnets[].cidr` | [cidr-planning-ipam.md](./cidr-planning-ipam.md) | ✅ Covered | Subnet CIDR planning well documented |
| `subnets[].zone` | [zones-datacenter-architecture.md](./zones-datacenter-architecture.md) | ✅ Covered | Zone placement explained |
| `subnets[].network_acl` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | ACL-subnet association covered |
| `subnets[].public_gateway` | [vpc-foundation.md](./vpc-foundation.md) | ✅ Covered | Public gateway association explained |

### Security Groups

| Terraform Variable | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `security_groups` | [security-group-service-internals.md](./security-group-service-internals.md) | ✅ Covered | Security groups extensively documented |
| `security_group_rules` | [security-group-service-internals.md](./security-group-service-internals.md) | ✅ Covered | SG rules well explained |
| `security_group_rules[].name` | [security-group-service-internals.md](./security-group-service-internals.md) | ✅ Covered | Rule naming covered |
| `security_group_rules[].direction` | [security-group-service-internals.md](./security-group-service-internals.md) | ✅ Covered | Ingress/egress explained |
| `security_group_rules[].remote` | [security-group-service-internals.md](./security-group-service-internals.md) | ✅ Covered | Remote sources/SG references covered |
| `security_group_rules[].tcp/udp/icmp` | [security-group-service-internals.md](./security-group-service-internals.md) | ✅ Covered | Protocol rules covered |

### Routing

| Terraform Variable | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `routes` | [route-table-service.md](./route-table-service.md) | ✅ Covered | Routing extensively documented |
| `routes[].name` | [route-table-service.md](./route-table-service.md) | ✅ Covered | Route naming covered |
| `routes[].zone` | [zones-datacenter-architecture.md](./zones-datacenter-architecture.md) | ✅ Covered | Zone-specific routing covered |
| `routes[].destination` | [route-table-service.md](./route-table-service.md) | ✅ Covered | Destination CIDR explained |
| `routes[].next_hop` | [route-table-service.md](./route-table-service.md) | ✅ Covered | Next hop concept well explained |

### Flow Logs

| Terraform Variable | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `enable_vpc_flow_logs` | [flow-logs-observability.md](./flow-logs-observability.md) | ✅ Covered | Flow logs extensively documented |
| `create_authorization_policy_vpc_to_cos` | [flow-logs-observability.md](./flow-logs-observability.md) | ⚠️ Partial | IAM policies mentioned but not detailed |
| `existing_storage_bucket_name` | [flow-logs-observability.md](./flow-logs-observability.md) | ✅ Covered | COS integration covered |
| `existing_cos_instance_guid` | [flow-logs-observability.md](./flow-logs-observability.md) | ✅ Covered | COS instance references covered |

### Hub-Spoke DNS Architecture

| Terraform Variable | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `enable_hub` | Not documented | ❌ Missing | **Major gap** - hub-spoke DNS not documented |
| `hub_vpc_id` | Not documented | ❌ Missing | Hub VPC concept not documented |
| `hub_vpc_crn` | Not documented | ❌ Missing | Hub VPC CRN not documented |
| `update_delegated_resolver` | Not documented | ❌ Missing | Delegated resolver not documented |
| `resolver_type` | Not documented | ❌ Missing | Resolver types (delegated/manual/system) not documented |
| `skip_spoke_auth_policy` | Not documented | ❌ Missing | Spoke authorization not documented |
| `dns_binding_name` | Not documented | ❌ Missing | DNS binding concept not documented |
| `dns_instance_name` | Not documented | ❌ Missing | DNS instance not documented |
| `dns_custom_resolver_name` | Not documented | ❌ Missing | Custom resolver not documented |
| `dns_custom_resolver_description` | Not documented | ❌ Missing | Custom resolver not documented |
| `dns_location` | Not documented | ❌ Missing | DNS location not documented |
| `dns_zones` | Not documented | ❌ Missing | DNS zones not documented |
| `dns_records` | Not documented | ❌ Missing | DNS records not documented |

### VPN (Deprecated)

| Terraform Variable | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `vpn_gateways` | [vpn-architecture.md](./vpn-architecture.md) | ✅ Covered | VPN architecture well documented |
| Note: Module indicates VPN is deprecated | [vpn-architecture.md](./vpn-architecture.md) | ⚠️ Partial | Deprecation not mentioned in docs |

---

## 🏗️ Terraform Resources to Documentation Mapping

### Core VPC Resources

| Terraform Resource | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `ibm_is_vpc` | [vpc-foundation.md](./vpc-foundation.md) | ✅ Covered | VPC creation well documented |
| `ibm_is_vpc_address_prefix` | Not documented | ❌ Missing | **Critical gap** - address prefixes not explained |
| `ibm_is_public_gateway` | [vpc-foundation.md](./vpc-foundation.md) | ✅ Covered | Public gateways explained |
| `ibm_is_subnet` | [subnet-service-internals.md](./subnet-service-internals.md) | ✅ Covered | Subnets extensively documented |

### Network ACL Resources

| Terraform Resource | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `ibm_is_network_acl` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | ACL creation covered |
| `ibm_is_network_acl_rule` | [network-acl-architecture.md](./network-acl-architecture.md) | ✅ Covered | ACL rules covered |

### Security Group Resources

| Terraform Resource | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `ibm_is_security_group` | [security-group-service-internals.md](./security-group-service-internals.md) | ✅ Covered | SG creation covered |
| `ibm_is_security_group_rule` | [security-group-service-internals.md](./security-group-service-internals.md) | ✅ Covered | SG rules covered |
| Default SG cleanup logic | Not documented | ❌ Missing | Default SG rule cleanup not documented |

### Routing Resources

| Terraform Resource | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `ibm_is_vpc_routing_table` | [route-table-service.md](./route-table-service.md) | ✅ Covered | Routing tables covered |
| `ibm_is_vpc_routing_table_route` | [route-table-service.md](./route-table-service.md) | ✅ Covered | Custom routes covered |

### Flow Log Resources

| Terraform Resource | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `ibm_is_flow_log` | [flow-logs-observability.md](./flow-logs-observability.md) | ✅ Covered | Flow logs well documented |
| `ibm_iam_authorization_policy` (VPC to COS) | [flow-logs-observability.md](./flow-logs-observability.md) | ⚠️ Partial | IAM policies mentioned but not detailed |

### Hub-Spoke DNS Resources

| Terraform Resource | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `ibm_is_vpc_dns_resolution_binding` | Not documented | ❌ Missing | **Major gap** - DNS resolution binding not documented |
| `ibm_resource_instance` (DNS) | Not documented | ❌ Missing | DNS instance creation not documented |
| `ibm_dns_custom_resolver` | Not documented | ❌ Missing | Custom DNS resolver not documented |
| `ibm_dns_zone` | Not documented | ❌ Missing | DNS zones not documented |
| `ibm_dns_permitted_network` | Not documented | ❌ Missing | DNS permitted networks not documented |
| `ibm_dns_resource_record` | Not documented | ❌ Missing | DNS records (A, AAAA, CNAME, etc.) not documented |
| `ibm_iam_authorization_policy` (Hub-Spoke DNS) | Not documented | ❌ Missing | Hub-spoke DNS authorization not documented |

### VPN Resources (Deprecated)

| Terraform Resource | Documentation Section | Coverage Status | Notes |
|-------------------|----------------------|-----------------|-------|
| `ibm_is_vpn_gateway` | [vpn-architecture.md](./vpn-architecture.md) | ✅ Covered | VPN gateways documented |
| Note: Module indicates VPN is deprecated | [vpn-architecture.md](./vpn-architecture.md) | ⚠️ Partial | Deprecation not mentioned |

---

## 📤 Terraform Outputs to Documentation Mapping

### VPC Outputs

| Terraform Output | Documentation Section | Coverage Status | Notes |
|-----------------|----------------------|-----------------|-------|
| `vpc_name` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | Output concepts well explained |
| `vpc_id` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | VPC ID usage covered |
| `vpc_crn` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | CRN concept covered |

### Subnet Outputs

| Terraform Output | Documentation Section | Coverage Status | Notes |
|-----------------|----------------------|-----------------|-------|
| `subnet_ids` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | Subnet ID consumption covered |
| `subnet_detail_list` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | Subnet details covered |
| `subnet_zone_list` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | Zone mapping covered |
| `subnet_detail_map` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | Subnet mapping covered |

### Gateway Outputs

| Terraform Output | Documentation Section | Coverage Status | Notes |
|-----------------|----------------------|-----------------|-------|
| `public_gateways` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | Gateway outputs covered |

### Network ACL Outputs

| Terraform Output | Documentation Section | Coverage Status | Notes |
|-----------------|----------------------|-----------------|-------|
| `network_acls` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | ACL outputs covered |

### Security Group Outputs

| Terraform Output | Documentation Section | Coverage Status | Notes |
|-----------------|----------------------|-----------------|-------|
| `security_group_details` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | SG outputs covered |

### Routing Outputs

| Terraform Output | Documentation Section | Coverage Status | Notes |
|-----------------|----------------------|-----------------|-------|
| `default_routing_table` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | Routing table outputs covered |
| `routing_table_ids` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | Routing outputs covered |
| `routing_table_routes` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | Route outputs covered |

### Flow Log Outputs

| Terraform Output | Documentation Section | Coverage Status | Notes |
|-----------------|----------------------|-----------------|-------|
| `vpc_flow_logs` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | Flow log outputs covered |

### CIDR Outputs

| Terraform Output | Documentation Section | Coverage Status | Notes |
|-----------------|----------------------|-----------------|-------|
| `cidr_blocks` | [outputs-downstream-consumption.md](./outputs-downstream-consumption.md) | ✅ Covered | CIDR outputs covered |

### Hub-Spoke DNS Outputs

| Terraform Output | Documentation Section | Coverage Status | Notes |
|-----------------|----------------------|-----------------|-------|
| `custom_resolver_hub` | Not documented | ❌ Missing | Custom resolver outputs not documented |
| `dns_endpoint_gateways_by_id` | Not documented | ❌ Missing | DNS endpoint gateways not documented |
| `dns_endpoint_gateways_by_crn` | Not documented | ❌ Missing | DNS endpoint gateways not documented |
| `dns_instance_id` | Not documented | ❌ Missing | DNS instance outputs not documented |
| `dns_custom_resolver_id` | Not documented | ❌ Missing | Custom resolver ID not documented |
| `dns_zone_state` | Not documented | ❌ Missing | DNS zone state not documented |
| `dns_zone_id` | Not documented | ❌ Missing | DNS zone ID not documented |
| `dns_record_ids` | Not documented | ❌ Missing | DNS record IDs not documented |

### VPN Outputs (Deprecated)

| Terraform Output | Documentation Section | Coverage Status | Notes |
|-----------------|----------------------|-----------------|-------|
| `vpn_gateways_name` | [vpn-architecture.md](./vpn-architecture.md) | ✅ Covered | VPN outputs covered |
| `vpn_gateways_data` | [vpn-architecture.md](./vpn-architecture.md) | ✅ Covered | VPN data outputs covered |

---

## 🔍 Coverage Gap Analysis

### ❌ Missing from Documentation (In Terraform Module)

#### 1. **Address Prefixes** (Critical Gap)
- **Terraform Variables**: `address_prefixes`
- **Terraform Resources**: `ibm_is_vpc_address_prefix`
- **Impact**: High - Address prefixes are fundamental to VPC CIDR management
- **Recommendation**: Add new section to [`cidr-planning-ipam.md`](./cidr-planning-ipam.md) explaining:
  - What address prefixes are
  - How they differ from subnet CIDRs
  - When to use custom address prefixes
  - Default address prefix behavior
  - Multi-zone address prefix planning

#### 2. **Hub-Spoke DNS Architecture** (Major Gap)
- **Terraform Variables**: `enable_hub`, `hub_vpc_id`, `resolver_type`, `dns_zones`, `dns_records`, etc.
- **Terraform Resources**: `ibm_is_vpc_dns_resolution_binding`, `ibm_dns_custom_resolver`, `ibm_dns_zone`, `ibm_dns_resource_record`
- **Impact**: High - Hub-spoke DNS is a major enterprise feature
- **Recommendation**: Create new documentation file `hub-spoke-dns-architecture.md` covering:
  - Hub-spoke DNS architecture overview
  - Delegated vs manual vs system resolvers
  - DNS resolution bindings
  - Custom DNS resolvers
  - DNS zones and permitted networks
  - DNS record types (A, AAAA, CNAME, MX, PTR, TXT, SRV)
  - Hub-spoke authorization policies
  - Enterprise DNS patterns

#### 3. **Default Security Group/ACL Cleanup**
- **Terraform Variables**: `clean_default_sg_acl`
- **Terraform Logic**: Default security group rule cleanup in `default_security_group.tf`
- **Impact**: Medium - Important for security hardening
- **Recommendation**: Add section to [`security-group-service-internals.md`](./security-group-service-internals.md) explaining:
  - Default security group behavior
  - Why default rules may be insecure
  - How to clean default rules
  - Security hardening best practices

#### 4. **Access Tags**
- **Terraform Variables**: `access_tags`
- **Impact**: Low - IAM-specific feature
- **Recommendation**: Add brief section to [`vpc-foundation.md`](./vpc-foundation.md) explaining access tags for IAM

#### 5. **IBM Cloud Internal ACL Rules**
- **Terraform Variables**: `add_ibm_cloud_internal_rules`, `prepend_ibm_rules`
- **Impact**: Medium - Important for IBM Cloud service connectivity
- **Recommendation**: Add section to [`acl-service-internals.md`](./acl-service-internals.md) explaining:
  - IBM Cloud internal service communication
  - When to add IBM internal rules
  - Rule ordering with prepend option

#### 6. **VPN Deprecation**
- **Terraform Note**: VPN gateways marked as deprecated in module
- **Impact**: Medium - Users should know about deprecation
- **Recommendation**: Add deprecation notice to [`vpn-architecture.md`](./vpn-architecture.md)

### ✅ Extra in Documentation (Not in Terraform Module)

#### 1. **Load Balancers**
- **Documentation**: [`load-balancer-architecture.md`](./load-balancer-architecture.md)
- **Terraform Module**: Not included (separate module)
- **Status**: Appropriate - Load balancers are separate infrastructure
- **Action**: No change needed - documentation correctly covers broader VPC ecosystem

#### 2. **Floating IPs**
- **Documentation**: [`floating-ip-architecture.md`](./floating-ip-architecture.md)
- **Terraform Module**: Not included (separate resource)
- **Status**: Appropriate - Floating IPs are workload-specific
- **Action**: No change needed - documentation correctly covers broader VPC ecosystem

#### 3. **Transit Gateway Integration**
- **Documentation**: [`transit-gateway-integration.md`](./transit-gateway-integration.md)
- **Terraform Module**: Only route references, not TGW creation
- **Status**: Appropriate - TGW is separate infrastructure
- **Action**: No change needed - documentation correctly explains integration patterns

#### 4. **Deep Service Internals**
- **Documentation**: [`vpc-service-internals.md`](./vpc-service-internals.md), [`acl-service-internals.md`](./acl-service-internals.md)
- **Terraform Module**: Implementation-focused, not internals-focused
- **Status**: Appropriate - Documentation provides deeper understanding
- **Action**: No change needed - educational content adds value

---

## 🎯 Recommendations

### High Priority

1. **Add Address Prefix Documentation**
   - Create section in [`cidr-planning-ipam.md`](./cidr-planning-ipam.md)
   - Explain relationship between VPC CIDR, address prefixes, and subnets
   - Document default vs custom address prefix behavior

2. **Create Hub-Spoke DNS Documentation**
   - New file: `hub-spoke-dns-architecture.md`
   - Cover delegated resolver architecture
   - Explain DNS resolution bindings
   - Document custom resolver configuration
   - Provide enterprise DNS patterns

3. **Document Default SG/ACL Cleanup**
   - Add section to [`security-group-service-internals.md`](./security-group-service-internals.md)
   - Explain security hardening rationale
   - Document cleanup procedures

### Medium Priority

4. **Add IBM Cloud Internal Rules Documentation**
   - Expand [`acl-service-internals.md`](./acl-service-internals.md)
   - Explain IBM Cloud service connectivity requirements
   - Document when to use internal rules

5. **Add VPN Deprecation Notice**
   - Update [`vpn-architecture.md`](./vpn-architecture.md)
   - Note that VPN gateways are deprecated in landing zone module
   - Reference migration guidance

6. **Add Access Tags Documentation**
   - Brief section in [`vpc-foundation.md`](./vpc-foundation.md)
   - Explain IAM access tag usage

### Low Priority

7. **Cross-Reference Improvements**
   - Add more explicit Terraform variable references in documentation
   - Link documentation sections to specific Terraform resources
   - Create quick reference table for common Terraform-to-docs lookups

---

## 📚 Quick Reference: Common Lookups

### "I need to configure X in Terraform, where is it documented?"

| Terraform Concept | Documentation File | Section |
|------------------|-------------------|---------|
| VPC CIDR planning | [`cidr-planning-ipam.md`](./cidr-planning-ipam.md) | IP Address Planning |
| Subnet design | [`subnet-service-internals.md`](./subnet-service-internals.md) | Subnet Architecture |
| ACL rules | [`network-acl-architecture.md`](./network-acl-architecture.md) | ACL Rules |
| Security group rules | [`security-group-service-internals.md`](./security-group-service-internals.md) | SG Rules |
| Custom routes | [`route-table-service.md`](./route-table-service.md) | Custom Routing |
| Public gateways | [`vpc-foundation.md`](./vpc-foundation.md) | Internet Connectivity |
| Flow logs | [`flow-logs-observability.md`](./flow-logs-observability.md) | Flow Log Configuration |
| VPN setup | [`vpn-architecture.md`](./vpn-architecture.md) | VPN Architecture |
| Multi-zone design | [`zones-datacenter-architecture.md`](./zones-datacenter-architecture.md) | Zone Architecture |
| Output consumption | [`outputs-downstream-consumption.md`](./outputs-downstream-consumption.md) | Downstream Usage |

### "I read about X in docs, what's the Terraform variable?"

| Documentation Concept | Terraform Variable | File |
|----------------------|-------------------|------|
| VPC CIDR | `network_cidrs` | variables.tf |
| Subnet CIDR | `subnets[].cidr` | variables.tf |
| ACL rules | `network_acls[].rules` | variables.tf |
| Security group rules | `security_group_rules` | variables.tf |
| Public gateway | `use_public_gateways` | variables.tf |
| Custom routes | `routes` | variables.tf |
| Flow logs | `enable_vpc_flow_logs` | variables.tf |
| Multi-zone subnets | `subnets[].zone` | variables.tf |

---

## 🔄 Maintenance Guidelines

### When Terraform Module Updates

1. **Review variables.tf changes**
   - Check for new variables
   - Check for deprecated variables
   - Update mapping tables above

2. **Review main.tf and other .tf files**
   - Check for new resources
   - Check for new functionality
   - Update resource mapping tables

3. **Review outputs.tf changes**
   - Check for new outputs
   - Update output mapping tables

4. **Update documentation**
   - Add new sections for new features
   - Update existing sections for changes
   - Add deprecation notices where needed

### When Documentation Updates

1. **Review new documentation sections**
   - Check if Terraform module supports the feature
   - Update mapping tables
   - Add cross-references

2. **Review updated documentation**
   - Verify Terraform alignment
   - Update examples if needed
   - Ensure variable names match

---

## 📊 Coverage Statistics

### Overall Coverage
- **Total Terraform Variables**: ~50+ (including nested objects)
- **Documented Variables**: ~35 (70%)
- **Missing from Docs**: ~15 (30%)

### By Category
- **Core VPC**: 90% covered
- **Subnets**: 95% covered
- **ACLs**: 85% covered
- **Security Groups**: 90% covered
- **Routing**: 90% covered
- **Flow Logs**: 85% covered
- **Hub-Spoke DNS**: 0% covered ⚠️
- **VPN**: 90% covered

### Documentation Scope
- **Terraform Module Scope**: Foundational VPC networking
- **Documentation Scope**: Entire VPC ecosystem (broader)
- **Alignment**: Good - documentation intentionally covers more than module

---

## 🎓 Learning Path

### For Users New to Both

1. Start with [`vpc-foundation.md`](./vpc-foundation.md) - Understand VPC basics
2. Read [`cidr-planning-ipam.md`](./cidr-planning-ipam.md) - Plan IP addressing
3. Study [`subnet-service-internals.md`](./subnet-service-internals.md) - Understand subnets
4. Learn [`network-acl-architecture.md`](./network-acl-architecture.md) - Subnet security
5. Learn [`security-group-service-internals.md`](./security-group-service-internals.md) - Workload security
6. Review Terraform module variables.tf - See implementation
7. Study [`outputs-downstream-consumption.md`](./outputs-downstream-consumption.md) - Understand integration

### For Terraform Users

1. Review variables.tf in module
2. Use this mapping document to find relevant documentation sections
3. Read documentation for concepts you're implementing
4. Reference outputs.tf for downstream integration

### For Documentation Readers

1. Read documentation in order (README.md provides structure)
2. Use "Quick Reference" section above to find Terraform equivalents
3. Review Terraform module for implementation details

---

## 📝 Notes

- **Module Focus**: This Terraform module is specifically for foundational VPC networking infrastructure
- **Documentation Scope**: Documentation covers the entire VPC ecosystem, including services not in this module
- **Intentional Gaps**: Load balancers, floating IPs, and some advanced features are separate modules/resources
- **Critical Gaps**: Hub-spoke DNS and address prefixes need documentation additions
- **Maintenance**: This mapping should be updated when either Terraform module or documentation changes

---

**Last Updated**: 2026-05-09  
**Terraform Module Version**: Based on latest main branch  
**Documentation Version**: Current vpc-infrastructure/ folder
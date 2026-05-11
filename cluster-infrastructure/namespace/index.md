# Kubernetes Namespace Documentation

This directory restructures namespace management into focused, beginner-friendly documents.

## Contents

1. [Namespace Fundamentals](01-namespace-fundamentals.md)
2. [Namespace Architecture](02-namespace-architecture.md)
3. [Terraform Module Usage](03-terraform-module-usage.md)
4. [Resource Quotas and Limit Ranges](04-resource-quotas-limits.md)
5. [RBAC and Security](05-rbac-security.md)
6. [Network Policies](06-network-policies.md)
7. [Terraform to Kubernetes Mapping](07-terraform-mapping.md)
8. [Best Practices](08-best-practices.md)
9. [Troubleshooting](09-troubleshooting.md)

## Purpose

Namespaces are the foundational unit for organizing, governing, and securing workloads in a shared Kubernetes or OpenShift cluster. This documentation explains both the Kubernetes concept and how the `terraform-ibm-namespace` module is used to implement namespace patterns in IBM Cloud Landing Zone environments.

## Recommended reading order

- Start with fundamentals if you are new to Kubernetes namespaces.
- Continue with architecture to understand the platform model.
- Review Terraform usage and mapping before implementing the module.
- Use the resource, RBAC, and network sections when designing multi-tenant environments.
- Finish with best practices and troubleshooting for day-2 operations.
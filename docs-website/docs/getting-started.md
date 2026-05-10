# Getting Started with IBM Cloud Landing Zone

Welcome to IBM Cloud Landing Zone! This guide will help you get started with deploying enterprise-grade infrastructure on IBM Cloud.

## 🎯 What is IBM Cloud Landing Zone?

IBM Cloud Landing Zone is a comprehensive infrastructure-as-code solution that provides:

- **Production-Ready Templates**: Pre-configured infrastructure patterns
- **Best Practices**: Security, networking, and operational best practices
- **Modular Design**: 11 core infrastructure modules
- **Terraform-Based**: Infrastructure as Code for consistency
- **Enterprise-Grade**: Designed for production workloads

## 🚀 Quick Start

Follow these steps to deploy your first Landing Zone:

### 1. Prerequisites

Before you begin, ensure you have:

- [ ] IBM Cloud account with appropriate permissions
- [ ] Terraform installed (version 1.0 or later)
- [ ] IBM Cloud CLI installed
- [ ] Git installed
- [ ] Basic understanding of cloud infrastructure

### 2. Set Up Your Environment

```bash
# Install IBM Cloud CLI
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh

# Install Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Verify installations
ibmcloud --version
terraform --version
```

### 3. Authenticate

```bash
# Login to IBM Cloud
ibmcloud login

# Set target region
ibmcloud target -r us-south

# Create API key
ibmcloud iam api-key-create my-api-key -d "API key for Landing Zone"
```

### 4. Clone Repository

```bash
git clone https://github.com/ibm-cloud/landing-zone.git
cd landing-zone
```

### 5. Configure Variables

Create a `terraform.tfvars` file:

```hcl
# IBM Cloud Configuration
ibmcloud_api_key = "your-api-key-here"
region           = "us-south"
resource_group   = "landing-zone-rg"

# VPC Configuration
vpc_name         = "landing-zone-vpc"
address_prefixes = ["10.0.0.0/16"]

# Tags
tags = ["env:production", "project:landing-zone"]
```

### 6. Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply the configuration
terraform apply
```

## 📚 Learning Path

Choose your path based on your role:

=== "Cloud Architect"
    1. [VPC Architecture](vpc/vpc-foundation/)
    2. [Network Design](vpc/cidr-planning-ipam/)
    3. [Security Architecture](security/)
    4. [High Availability](vpc/zones-datacenter-architecture/)

=== "DevOps Engineer"
    1. [Terraform Configuration](vpc/terraform-mapping/)
    2. [Cluster Deployment](cluster/)
    3. [CI/CD Integration](observability/)
    4. [Automation](reference/best-practices/)

=== "Security Engineer"
    1. [IAM Configuration](iam/)
    2. [Network Security](vpc/network-acl-architecture/)
    3. [Encryption](security/)
    4. [Compliance](security/)

## 🎓 Next Steps

After completing the quick start:

1. **Explore Modules**: Learn about each infrastructure module
2. **Customize**: Adapt the configuration to your needs
3. **Deploy Services**: Add compute, storage, and database services
4. **Monitor**: Set up observability and monitoring
5. **Secure**: Implement security best practices

## 📖 Additional Resources

- [Prerequisites Guide](getting-started/prerequisites/)
- [Installation Guide](getting-started/installation/)
- [Best Practices](reference/best-practices/)
- [Troubleshooting](reference/troubleshooting/)
- [FAQ](reference/faq/)

## 💡 Tips for Success

!!! tip "Start Small"
    Begin with a simple VPC deployment and gradually add complexity.

!!! warning "Plan Your CIDR"
    Carefully plan your IP address space before deployment - it cannot be changed later.

!!! success "Use Version Control"
    Store your Terraform configurations in Git for tracking and collaboration.

!!! info "Test First"
    Always test in a non-production environment before deploying to production.

## 🤝 Getting Help

- **Documentation**: Browse the complete documentation
- **GitHub Issues**: Report bugs or request features
- **IBM Cloud Support**: Contact IBM Cloud support for assistance
- **Community**: Join the IBM Cloud community forums

## 🔗 Quick Links

<div class="quick-links">
  <a href="vpc/" class="quick-link">
    <span class="quick-link-icon">🌐</span>
    <div class="quick-link-text">
      <div class="quick-link-title">VPC Infrastructure</div>
      <div class="quick-link-description">Start with networking</div>
    </div>
  </a>

  <a href="reference/terraform/" class="quick-link">
    <span class="quick-link-icon">🔧</span>
    <div class="quick-link-text">
      <div class="quick-link-title">Terraform Modules</div>
      <div class="quick-link-description">Infrastructure as Code</div>
    </div>
  </a>

  <a href="reference/best-practices/" class="quick-link">
    <span class="quick-link-icon">⭐</span>
    <div class="quick-link-text">
      <div class="quick-link-title">Best Practices</div>
      <div class="quick-link-description">Expert recommendations</div>
    </div>
  </a>

  <a href="reference/troubleshooting/" class="quick-link">
    <span class="quick-link-icon">🔍</span>
    <div class="quick-link-text">
      <div class="quick-link-title">Troubleshooting</div>
      <div class="quick-link-description">Common issues</div>
    </div>
  </a>
</div>
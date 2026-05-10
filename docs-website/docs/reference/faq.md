# Frequently Asked Questions

## General

**Q: What is IBM Cloud Landing Zone?**
A: A comprehensive infrastructure-as-code solution for deploying enterprise-grade infrastructure on IBM Cloud.

**Q: What are the prerequisites?**
A: IBM Cloud account, Terraform, IBM Cloud CLI, and appropriate permissions.

**Q: Is it production-ready?**
A: Yes, Landing Zone is designed for production workloads.

## VPC

**Q: Can I change VPC CIDR after creation?**
A: No, CIDR blocks cannot be changed after VPC creation. Plan carefully.

**Q: How many subnets can I create?**
A: Up to 15 subnets per VPC per zone.

**Q: What's the difference between ACLs and Security Groups?**
A: ACLs are stateless and apply to subnets. Security Groups are stateful and apply to instances.

## Deployment

**Q: How long does deployment take?**
A: Typically 15-30 minutes for a complete Landing Zone.

**Q: Can I customize the configuration?**
A: Yes, all configurations are customizable via Terraform variables.

**Q: How do I update my deployment?**
A: Modify your Terraform configuration and run `terraform apply`.

## Cost

**Q: What are the costs?**
A: Costs vary based on resources deployed. Use the IBM Cloud cost estimator.

**Q: How can I optimize costs?**
A: Right-size resources, use tagging, and monitor usage regularly.

## Support

**Q: Where can I get help?**
A: GitHub Issues, IBM Cloud Support, or community forums.

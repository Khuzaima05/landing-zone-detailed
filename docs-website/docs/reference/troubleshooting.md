# Troubleshooting

## Common Issues

### VPC Deployment Issues

**Issue**: VPC creation fails
- Check IAM permissions
- Verify region availability
- Check resource quotas
- Review CIDR conflicts

**Issue**: Subnet creation fails
- Verify CIDR is within VPC range
- Check zone availability
- Review ACL rules

### Connectivity Issues

**Issue**: Cannot connect to VSI
- Check security group rules
- Verify floating IP assignment
- Review network ACL rules
- Check route tables

**Issue**: VPN connection fails
- Verify pre-shared key
- Check peer gateway configuration
- Review firewall rules
- Verify IKE/IPSec settings

### Performance Issues

**Issue**: Slow network performance
- Check bandwidth limits
- Review security group rules
- Verify load balancer configuration
- Check for network congestion

## Getting Help

- Check IBM Cloud status page
- Review documentation
- Contact IBM Cloud support
- Join community forums

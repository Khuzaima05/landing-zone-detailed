/**
 * Cumulative Progress Tracker - Shows overall reading progress across all documentation
 * Tracks progress through VPC, VSI, and Cluster infrastructure sections
 */

(function() {
  'use strict';

  // Global ordered list of all tracked documentation pages
  // This represents the complete learning journey across all sections
  const allPages = [
    // VPC Infrastructure (18 pages)
    { path: 'vpc/index', title: 'VPC Overview', section: 'VPC' },
    { path: 'vpc/vpc-foundation', title: 'VPC Foundation', section: 'VPC' },
    { path: 'vpc/vpc-service-internals', title: 'VPC Service Internals', section: 'VPC' },
    { path: 'vpc/zones-datacenter-architecture', title: 'Zones & Datacenters', section: 'VPC' },
    { path: 'vpc/cidr-planning-ipam', title: 'CIDR Planning', section: 'VPC' },
    { path: 'vpc/subnet-service-internals', title: 'Subnet Service', section: 'VPC' },
    { path: 'vpc/network-acl-architecture', title: 'Network ACL', section: 'VPC' },
    { path: 'vpc/acl-service-internals', title: 'ACL Internals', section: 'VPC' },
    { path: 'vpc/security-group-service-internals', title: 'Security Groups', section: 'VPC' },
    { path: 'vpc/route-table-service', title: 'Route Tables', section: 'VPC' },
    { path: 'vpc/vpn-architecture', title: 'VPN', section: 'VPC' },
    { path: 'vpc/transit-gateway-integration', title: 'Transit Gateway', section: 'VPC' },
    { path: 'vpc/floating-ip-architecture', title: 'Floating IPs', section: 'VPC' },
    { path: 'vpc/load-balancer-architecture', title: 'Load Balancers', section: 'VPC' },
    { path: 'vpc/flow-logs-observability', title: 'Flow Logs', section: 'VPC' },
    { path: 'vpc/hub-spoke-dns-architecture', title: 'Hub-Spoke DNS', section: 'VPC' },
    { path: 'vpc/terraform-mapping', title: 'Terraform Mapping', section: 'VPC' },
    { path: 'vpc/outputs-downstream-consumption', title: 'Outputs', section: 'VPC' },
    
    // VSI Infrastructure (13 pages)
    { path: 'vsi/index', title: 'VSI Overview', section: 'VSI' },
    { path: 'vsi/vsi-provisioning-overview', title: 'Provisioning Overview', section: 'VSI' },
    { path: 'vsi/vsi-resource-scoping', title: 'Resource Scoping', section: 'VSI' },
    { path: 'vsi/vsi-network-foundation', title: 'Network Foundation', section: 'VSI' },
    { path: 'vsi/vsi-compute-instantiation', title: 'Compute', section: 'VSI' },
    { path: 'vsi/vsi-storage-configuration', title: 'Storage', section: 'VSI' },
    { path: 'vsi/vsi-instance-networking', title: 'Networking', section: 'VSI' },
    { path: 'vsi/vsi-security-groups', title: 'Security Groups', section: 'VSI' },
    { path: 'vsi/vsi-secondary-interfaces', title: 'Secondary Interfaces', section: 'VSI' },
    { path: 'vsi/vsi-load-balancer', title: 'Load Balancer', section: 'VSI' },
    { path: 'vsi/vsi-observability', title: 'Observability', section: 'VSI' },
    { path: 'vsi/vsi-lifecycle-recovery', title: 'Lifecycle', section: 'VSI' },
    { path: 'vsi/vsi-architecture-summary', title: 'Architecture Summary', section: 'VSI' },
    
    // Cluster Infrastructure (35 pages - base-ocp-vpc + namespace)
    { path: 'cluster/index', title: 'Cluster Overview', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/index', title: 'Base OCP VPC', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/01-openshift-fundamentals', title: 'OpenShift Fundamentals', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/02-cluster-architecture', title: 'Architecture', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/03-prerequisites-planning', title: 'Prerequisites', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/04-cluster-provisioning-flow', title: 'Provisioning Flow', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/05-resource-scoping', title: 'Resource Scoping', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/06-vpc-networking-integration', title: 'VPC Integration', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/07-worker-pools-configuration', title: 'Worker Pools', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/08-operating-system-selection', title: 'OS Selection', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/09-security-groups-network-isolation', title: 'Security Groups', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/10-kms-encryption', title: 'KMS Encryption', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/11-cos-registry-storage', title: 'COS Registry', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/12-cluster-endpoints', title: 'Endpoints', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/13-addons-extensions', title: 'Add-ons', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/14-autoscaling-configuration', title: 'Autoscaling', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/15-load-balancer-vpe-security', title: 'LB & VPE', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/16-cbr-rules', title: 'CBR Rules', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/17-secrets-manager-integration', title: 'Secrets Manager', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/18-cluster-lifecycle', title: 'Lifecycle', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/19-runtime-scripts-verification', title: 'Runtime Scripts', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/20-terraform-mapping', title: 'Terraform Mapping', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/21-terraform-module-usage', title: 'Module Usage', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/22-best-practices', title: 'Best Practices', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/23-troubleshooting', title: 'Troubleshooting', section: 'Cluster' },
    { path: 'cluster/base-ocp-vpc/24-outputs-integration', title: 'Outputs', section: 'Cluster' },
    { path: 'cluster/namespace/index', title: 'Namespace Overview', section: 'Cluster' },
    { path: 'cluster/namespace/01-namespace-fundamentals', title: 'Namespace Fundamentals', section: 'Cluster' },
    { path: 'cluster/namespace/02-namespace-architecture', title: 'Namespace Architecture', section: 'Cluster' },
    { path: 'cluster/namespace/03-terraform-module-usage', title: 'Terraform Module', section: 'Cluster' },
    { path: 'cluster/namespace/04-resource-quotas-limits', title: 'Resource Quotas', section: 'Cluster' },
    { path: 'cluster/namespace/05-rbac-security', title: 'RBAC Security', section: 'Cluster' },
    { path: 'cluster/namespace/06-network-policies', title: 'Network Policies', section: 'Cluster' },
    { path: 'cluster/namespace/07-terraform-mapping', title: 'Terraform Mapping', section: 'Cluster' },
    { path: 'cluster/namespace/08-best-practices', title: 'Best Practices', section: 'Cluster' },
    { path: 'cluster/namespace/09-troubleshooting', title: 'Troubleshooting', section: 'Cluster' }
  ];

  const totalPages = allPages.length;

  /**
   * Find the current page index in the global page list
   * @returns {number} Index of current page, or -1 if not found
   */
  function getCurrentPageIndex() {
    const path = window.location.pathname;
    
    // Normalize path by removing leading/trailing slashes and .html extension
    const normalizedPath = path.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '').replace(/\/$/, '');
    
    return allPages.findIndex(page => {
      const pagePath = page.path.replace(/^\/+|\/+$/g, '');
      return normalizedPath.includes(pagePath) || normalizedPath === pagePath;
    });
  }

  /**
   * Get section icon based on section name
   */
  function getSectionIcon(section) {
    const icons = {
      'VPC': '🌐',
      'VSI': '💻',
      'Cluster': '☸️'
    };
    return icons[section] || '📚';
  }

  /**
   * Create and display the progress tracker
   */
  function createProgressTracker() {
    // Remove existing tracker if present
    const existing = document.querySelector('.doc-progress-tracker');
    if (existing) {
      existing.remove();
    }

    const currentIndex = getCurrentPageIndex();
    
    // Only show tracker if we're on a tracked page
    if (currentIndex === -1) {
      return;
    }

    const currentPage = allPages[currentIndex];
    const progress = ((currentIndex + 1) / totalPages) * 100;
    const completedPages = currentIndex + 1;

    const tracker = document.createElement('div');
    tracker.className = 'doc-progress-tracker';
    tracker.innerHTML = `
      <div class="progress-header">
        <span class="progress-icon">${getSectionIcon(currentPage.section)}</span>
        <span class="progress-title">Documentation Progress</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <div class="progress-info">
        <span class="progress-current">${completedPages} of ${totalPages}</span>
        <span class="progress-percent">${Math.round(progress)}%</span>
      </div>
      <div class="progress-section-info">
        <span class="current-section">${currentPage.section}: ${currentPage.title}</span>
      </div>
      <div class="progress-chapters">
        ${allPages.map((page, idx) => {
          let status = 'pending';
          if (idx < currentIndex) status = 'completed';
          else if (idx === currentIndex) status = 'current';
          
          // Add section divider
          const showDivider = idx > 0 && allPages[idx - 1].section !== page.section;
          const divider = showDivider ? `<div class="section-divider">${getSectionIcon(page.section)} ${page.section}</div>` : '';
          
          return `
            ${divider}
            <a href="/${page.path}/" 
               class="progress-chapter ${status}"
               title="${page.section}: ${page.title}">
              <span class="chapter-dot"></span>
              <span class="chapter-title">${page.title}</span>
            </a>
          `;
        }).join('')}
      </div>
    `;

    document.body.appendChild(tracker);

    // Add toggle functionality
    const header = tracker.querySelector('.progress-header');
    header.addEventListener('click', () => {
      tracker.classList.toggle('collapsed');
    });
  }

  /**
   * Initialize the progress tracker
   */
  function init() {
    createProgressTracker();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Handle MkDocs instant navigation
  // MkDocs Material uses navigation.instant which requires special handling
  document.addEventListener('DOMContentLoaded', () => {
    // Listen for instant navigation events
    document$.subscribe(() => {
      // Small delay to ensure DOM is updated
      setTimeout(createProgressTracker, 50);
    });
  });

  // Fallback: Also listen for location changes (for instant navigation)
  let lastPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      createProgressTracker();
    }
  }, 100);
})();

// Made with Bob

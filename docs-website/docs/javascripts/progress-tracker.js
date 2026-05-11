/**
 * Progress Tracker - Shows reading progress and navigation flow
 * Minimalistic design that appears on the side
 */

(function() {
  'use strict';

  // Configuration for each documentation section
  const sectionConfigs = {
    'vpc': {
      title: 'VPC Infrastructure',
      icon: '🌐',
      chapters: [
        { path: 'vpc/index.md', title: 'Overview' },
        { path: 'vpc/vpc-foundation.md', title: 'Foundation' },
        { path: 'vpc/vpc-service-internals.md', title: 'Service Internals' },
        { path: 'vpc/zones-datacenter-architecture.md', title: 'Zones & Datacenters' },
        { path: 'vpc/cidr-planning-ipam.md', title: 'CIDR Planning' },
        { path: 'vpc/subnet-service-internals.md', title: 'Subnet Service' },
        { path: 'vpc/network-acl-architecture.md', title: 'Network ACL' },
        { path: 'vpc/acl-service-internals.md', title: 'ACL Internals' },
        { path: 'vpc/security-group-service-internals.md', title: 'Security Groups' },
        { path: 'vpc/route-table-service.md', title: 'Route Tables' },
        { path: 'vpc/vpn-architecture.md', title: 'VPN' },
        { path: 'vpc/transit-gateway-integration.md', title: 'Transit Gateway' },
        { path: 'vpc/floating-ip-architecture.md', title: 'Floating IPs' },
        { path: 'vpc/load-balancer-architecture.md', title: 'Load Balancers' },
        { path: 'vpc/flow-logs-observability.md', title: 'Flow Logs' },
        { path: 'vpc/hub-spoke-dns-architecture.md', title: 'Hub-Spoke DNS' },
        { path: 'vpc/terraform-mapping.md', title: 'Terraform Mapping' },
        { path: 'vpc/outputs-downstream-consumption.md', title: 'Outputs' }
      ]
    },
    'vsi': {
      title: 'VSI Infrastructure',
      icon: '💻',
      chapters: [
        { path: 'vsi/index.md', title: 'Overview' },
        { path: 'vsi/vsi-provisioning-overview.md', title: 'Provisioning Overview' },
        { path: 'vsi/vsi-resource-scoping.md', title: 'Layer 1: Resource Scoping' },
        { path: 'vsi/vsi-network-foundation.md', title: 'Layer 2: Network Foundation' },
        { path: 'vsi/vsi-compute-instantiation.md', title: 'Layer 3: Compute' },
        { path: 'vsi/vsi-storage-configuration.md', title: 'Layer 4: Storage' },
        { path: 'vsi/vsi-instance-networking.md', title: 'Layer 5: Networking' },
        { path: 'vsi/vsi-security-groups.md', title: 'Layer 6: Security Groups' },
        { path: 'vsi/vsi-secondary-interfaces.md', title: 'Layer 7: Secondary Interfaces' },
        { path: 'vsi/vsi-load-balancer.md', title: 'Layer 8: Load Balancer' },
        { path: 'vsi/vsi-observability.md', title: 'Layer 9: Observability' },
        { path: 'vsi/vsi-lifecycle-recovery.md', title: 'Layer 10: Lifecycle' },
        { path: 'vsi/vsi-architecture-summary.md', title: 'Architecture Summary' }
      ]
    },
    'cluster': {
      title: 'Cluster Infrastructure',
      icon: '☸️',
      chapters: [
        { path: 'cluster/index.md', title: 'Overview' },
        { path: 'cluster/base-ocp-vpc/index.md', title: 'Base OCP VPC' },
        { path: 'cluster/base-ocp-vpc/01-openshift-fundamentals.md', title: '01: OpenShift Fundamentals' },
        { path: 'cluster/base-ocp-vpc/02-cluster-architecture.md', title: '02: Architecture' },
        { path: 'cluster/base-ocp-vpc/03-prerequisites-planning.md', title: '03: Prerequisites' },
        { path: 'cluster/base-ocp-vpc/04-cluster-provisioning-flow.md', title: '04: Provisioning Flow' },
        { path: 'cluster/base-ocp-vpc/05-resource-scoping.md', title: '05: Resource Scoping' },
        { path: 'cluster/base-ocp-vpc/06-vpc-networking-integration.md', title: '06: VPC Integration' },
        { path: 'cluster/base-ocp-vpc/07-worker-pools-configuration.md', title: '07: Worker Pools' },
        { path: 'cluster/base-ocp-vpc/08-operating-system-selection.md', title: '08: OS Selection' },
        { path: 'cluster/base-ocp-vpc/09-security-groups-network-isolation.md', title: '09: Security Groups' },
        { path: 'cluster/base-ocp-vpc/10-kms-encryption.md', title: '10: KMS Encryption' },
        { path: 'cluster/base-ocp-vpc/11-cos-registry-storage.md', title: '11: COS Registry' },
        { path: 'cluster/base-ocp-vpc/12-cluster-endpoints.md', title: '12: Endpoints' },
        { path: 'cluster/base-ocp-vpc/13-addons-extensions.md', title: '13: Add-ons' },
        { path: 'cluster/base-ocp-vpc/14-autoscaling-configuration.md', title: '14: Autoscaling' },
        { path: 'cluster/base-ocp-vpc/15-load-balancer-vpe-security.md', title: '15: LB & VPE' },
        { path: 'cluster/base-ocp-vpc/16-cbr-rules.md', title: '16: CBR Rules' },
        { path: 'cluster/base-ocp-vpc/17-secrets-manager-integration.md', title: '17: Secrets Manager' },
        { path: 'cluster/base-ocp-vpc/18-cluster-lifecycle.md', title: '18: Lifecycle' },
        { path: 'cluster/base-ocp-vpc/19-runtime-scripts-verification.md', title: '19: Runtime Scripts' },
        { path: 'cluster/base-ocp-vpc/20-terraform-mapping.md', title: '20: Terraform Mapping' },
        { path: 'cluster/base-ocp-vpc/21-terraform-module-usage.md', title: '21: Module Usage' },
        { path: 'cluster/base-ocp-vpc/22-best-practices.md', title: '22: Best Practices' },
        { path: 'cluster/base-ocp-vpc/23-troubleshooting.md', title: '23: Troubleshooting' },
        { path: 'cluster/base-ocp-vpc/24-outputs-integration.md', title: '24: Outputs' }
      ]
    }
  };

  function getCurrentSection() {
    const path = window.location.pathname;
    for (const [key, config] of Object.entries(sectionConfigs)) {
      if (path.includes(`/${key}/`)) {
        return { key, config };
      }
    }
    return null;
  }

  function getCurrentChapterIndex(section, chapters) {
    const path = window.location.pathname;
    return chapters.findIndex(chapter => 
      path.includes(chapter.path.replace('.md', ''))
    );
  }

  function createProgressTracker() {
    const sectionData = getCurrentSection();
    if (!sectionData) return;

    const { config } = sectionData;
    const currentIndex = getCurrentChapterIndex(sectionData.key, config.chapters);
    if (currentIndex === -1) return;

    const progress = ((currentIndex + 1) / config.chapters.length) * 100;

    const tracker = document.createElement('div');
    tracker.className = 'doc-progress-tracker';
    tracker.innerHTML = `
      <div class="progress-header">
        <span class="progress-icon">${config.icon}</span>
        <span class="progress-title">${config.title}</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <div class="progress-info">
        <span class="progress-current">${currentIndex + 1} of ${config.chapters.length}</span>
        <span class="progress-percent">${Math.round(progress)}%</span>
      </div>
      <div class="progress-chapters">
        ${config.chapters.map((chapter, idx) => {
          let status = 'pending';
          if (idx < currentIndex) status = 'completed';
          else if (idx === currentIndex) status = 'current';
          
          return `
            <a href="/${chapter.path.replace('.md', '/')}" 
               class="progress-chapter ${status}"
               title="${chapter.title}">
              <span class="chapter-dot"></span>
              <span class="chapter-title">${chapter.title}</span>
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

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createProgressTracker);
  } else {
    createProgressTracker();
  }

  // Re-initialize on navigation (for instant loading)
  document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
      const existing = document.querySelector('.doc-progress-tracker');
      if (existing) existing.remove();
      createProgressTracker();
    });

    observer.observe(document.querySelector('.md-content'), {
      childList: true,
      subtree: true
    });
  });
})();

// Made with Bob

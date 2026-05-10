# Installation

## Step 1: Install IBM Cloud CLI

### macOS
```bash
curl -fsSL https://clis.cloud.ibm.com/install/osx | sh
```

### Linux
```bash
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh
```

### Windows
Download from [IBM Cloud CLI](https://cloud.ibm.com/docs/cli)

## Step 2: Install Terraform

### macOS (Homebrew)
```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

### Linux
```bash
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

### Windows
Download from [terraform.io](https://www.terraform.io/downloads)

## Step 3: Verify Installation

```bash
ibmcloud --version
terraform --version
```

## Step 4: Login to IBM Cloud

```bash
ibmcloud login
```

## Step 5: Install Plugins

```bash
ibmcloud plugin install vpc-infrastructure
ibmcloud plugin install cloud-object-storage
```

## Step 6: Create API Key

```bash
ibmcloud iam api-key-create landing-zone-key -d "Landing Zone API Key"
```

Save the API key securely - you'll need it for Terraform.

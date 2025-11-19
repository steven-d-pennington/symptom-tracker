#!/bin/bash

# Configuration
VPC_ID="vpc-xxxxxxxxx"  # Replace with your VPC ID
DESCRIPTION="Temporary whitelist security group"
GROUP_NAME="TEMP_WHITELIST"
PROTOCOL="tcp"
PORT="443"  # Change to the port you want to allow (443, 80, 22, etc.)

# IP addresses to whitelist
IPS=(
    "119.29.33.95"
    "12.193.130.115"
    "120.233.128.103"
    "137.83.105.226"
    "147.219.112.245"
    "154.54.249.212"
    "172.236.228.39"
    "172.56.100.173"
    "172.56.103.156"
    "172.58.144.250"
    "172.59.116.130"
    "172.59.129.63"
    "217.113.194.172"
    "217.113.194.173"
    "217.113.194.174"
    "217.113.194.175"
    "217.113.194.176"
    "217.113.194.177"
    "217.113.194.178"
    "217.113.194.179"
    "217.113.194.180"
    "217.113.194.181"
    "217.113.194.236"
    "217.113.194.237"
    "217.216.112.66"
    "23.87.151.127"
    "24.173.140.254"
    "38.65.231.52"
    "45.79.120.183"
    "47.206.74.146"
    "47.237.174.64"
    "64.62.156.10"
    "64.62.156.11"
    "64.62.156.13"
    "64.62.156.16"
    "64.62.156.18"
    "64.62.156.21"
    "65.29.149.114"
    "68.99.78.210"
    "70.168.124.102"
    "74.95.62.29"
    "75.145.45.105"
    "91.196.152.188"
    "91.231.89.113"
    "96.60.172.156"
)

echo "Creating security group: $GROUP_NAME"

# Create the security group
SG_ID=$(aws ec2 create-security-group \
    --group-name "$GROUP_NAME" \
    --description "$DESCRIPTION" \
    --vpc-id "$VPC_ID" \
    --query 'GroupId' \
    --output text)

if [ $? -eq 0 ]; then
    echo "Security group created successfully: $SG_ID"
else
    echo "Failed to create security group"
    exit 1
fi

# Add IP addresses to the security group
echo "Adding IP addresses to security group..."

for IP in "${IPS[@]}"; do
    echo "Adding $IP/32..."
    aws ec2 authorize-security-group-ingress \
        --group-id "$SG_ID" \
        --protocol "$PROTOCOL" \
        --port "$PORT" \
        --cidr "$IP/32" \
        --output text

    if [ $? -eq 0 ]; then
        echo "  ✓ Added $IP"
    else
        echo "  ✗ Failed to add $IP"
    fi
done

echo ""
echo "Done! Security group ID: $SG_ID"
echo "Total IPs added: ${#IPS[@]}"

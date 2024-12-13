#!/bin/bash

# Step 1: Get the private IP address
PRIVATE_IP=$(ifconfig en0 | grep "inet " | awk '{print $2}')

# Check if IP address is fetched
if [ -z "$PRIVATE_IP" ]; then
  echo "Could not fetch private IP address."
  exit 1
fi
echo "Private IP Address: $PRIVATE_IP"

# Step 2: Update .env file
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
  # Replace or add the PRIVATE_IP entry in the .env file
  sed -i '' "s|SERVER=http://192.*|SERVER=http://$PRIVATE_IP:3001|" $ENV_FILE || echo "SERVER=$PRIVATE_IP" >> $ENV_FILE
  echo ".env file updated."
else
  echo ".env file not found."
fi

# Step 3: Update network_security_config.xml file
XML_FILE="android/app/src/main/res/xml/network_security_config.xml"
if [ -f "$XML_FILE" ]; then
  # Replace the IP address within network_security_config.xml (assuming there is a placeholder or a specific tag to update)
  # This example assumes you have <domain includeSubdomains="false">192.168.x.x</domain> in your XML file.
  sed -i '' "s|<domain includeSubdomains=\"false\">192.*</domain>|<domain includeSubdomains=\"false\">$PRIVATE_IP</domain>|g" $XML_FILE
  echo "network_security_config.xml file updated."
else
  echo "network_security_config.xml file not found."
fi
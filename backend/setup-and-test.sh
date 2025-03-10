#!/bin/bash

# Color codes for output formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Slice Streaming Platform Test Suite =====${NC}"
echo -e "${YELLOW}This script will set up the test environment and run tests for the Slice platform.${NC}"

# Check if MongoDB is running
echo -e "\n${BLUE}Checking MongoDB connection...${NC}"
if nc -z localhost 27017 2>/dev/null; then
    echo -e "${GREEN}MongoDB is running on port 27017${NC}"
else
    echo -e "${RED}ERROR: MongoDB is not running on port 27017${NC}"
    echo -e "${YELLOW}Please start MongoDB before running this script${NC}"
    exit 1
fi

# Seed the database with brands
echo -e "\n${BLUE}Seeding database with brand data...${NC}"
node seed-brands.js

# Run the test script to verify functionality
echo -e "\n${BLUE}Running database feature tests...${NC}"
node test-features.js

echo -e "\n${GREEN}==========================${NC}"
echo -e "${GREEN}Setup and testing complete!${NC}"
echo -e "${GREEN}==========================${NC}"

echo -e "\n${YELLOW}To start the application:${NC}"
echo -e "1. Start the backend server:   ${BLUE}node start-server.js${NC}"
echo -e "2. Start the frontend:         ${BLUE}cd ../streaming-platform && npm run dev${NC}"
echo -e "\n${YELLOW}Key features to test:${NC}"
echo -e "✓ Pizza slice allocation on videos"
echo -e "✓ Pizza avatar in navbar and profile"
echo -e "✓ Slice history on the profile page"
echo -e "✓ Brand discovery page at /brands"
echo -e "✓ Individual brand pages at /brands/:slug"
echo -e "✓ Brand dashboard at /brand-dashboard"
echo -e "\n${GREEN}Happy testing!${NC}"
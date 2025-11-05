#!/bin/bash
# Database seeders 
# biar instan tambah data
#
# ============================================
# LOGIN CREDENTIALS (Setelah Seeding)
# ============================================
# TOTAL USERS: ~11,000+ users
#
# DOSEN (69 accounts):
#   Username: [nama tanpa spasi, lowercase]
#   Email: [username]@grademind.edu
#   Password: admin1234
#   Contoh: budisantoso@grademind.edu / admin1234
#
# MAHASISWA (10,923 accounts = 33 dept × 331):
#   Username: [NRP]
#   Email: [NRP]@grademind.edu
#   Password: user1234
#
#   Format NRP: PPPPYYIXXX (10 digit)
#   PPPP : Departemen (5001-5033)
#   YY   : Tahun angkatan (19-25)
#   I    : Program/Batch digit (1)
#   XXX  : Index mahasiswa (001-331)
#
#   Contoh Login Mahasiswa:
#   - 5001231001 / user1234 (Dept 5001, tahun 23, index 001)
#   - 5012241331 / user1234 (Dept 5012, tahun 24, index 331)
#   - 5033251155 / user1234 (Dept 5033, tahun 25, index 155)
#
# Catatan: 
#   - Bisa login dengan username/NRP ATAU email
#   - Setiap departemen (5001-5033) punya 331 mahasiswa lengkap
#   - Cek database untuk melihat username dosen & NRP spesifik
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   GradeMind Database Seeder${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Auto-navigate to backend directory if not already there
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)/backend"

if [ -f "main.py" ]; then
    # Already in backend directory
    WORKING_DIR="."
elif [ -f "$BACKEND_DIR/main.py" ]; then
    # Navigate to backend directory
    cd "$BACKEND_DIR" || exit 1
    WORKING_DIR="$BACKEND_DIR"
    echo -e "${GREEN}Navigated to backend directory${NC}"
    echo ""
else
    echo -e "${RED}Error: Could not find backend directory${NC}"
    echo -e "${YELLOW}Please ensure you're running this from the project structure${NC}"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo -e "${YELLOW}Please create .env file with DATABASE_URL${NC}"
    exit 1
fi

# Menu
echo -e "${GREEN}Select seeder mode:${NC}"
echo "1. Seed database (append data)"
echo "2. Reset and seed (WARNING: will delete all data)"
echo "3. Install dependencies only"
echo "4. Exit"
echo ""
read -p "Enter your choice (1-4): " choice

# Detect Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo -e "${RED}Error: Python not found${NC}"
    exit 1
fi

case $choice in
    1)
        echo -e "${BLUE}Starting database seeder...${NC}"
        $PYTHON_CMD -m services.seeders.database_seeder
        ;;
    2)
        echo -e "${RED}WARNING: This will DELETE ALL existing data!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo -e "${BLUE}Resetting and seeding database...${NC}"
            $PYTHON_CMD -c "import asyncio; from services.seeders.database_seeder import reset_and_seed; asyncio.run(reset_and_seed())"
        else
            echo -e "${YELLOW}Operation cancelled${NC}"
        fi
        ;;
    3)
        echo -e "${BLUE}Installing dependencies...${NC}"
        if command -v pip3 &> /dev/null; then
            pip3 install faker
        elif command -v pip &> /dev/null; then
            pip install faker
        else
            echo -e "${RED}Error: pip not found${NC}"
            exit 1
        fi
        echo -e "${GREEN}Dependencies installed!${NC}"
        ;;
    4)
        echo -e "${YELLOW}Exiting...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}  Login Credentials${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${GREEN}Total Users: ~11,000+ (69 Dosen + 10,923 Mahasiswa)${NC}"
echo ""
echo -e "${GREEN}Dosen (69 accounts):${NC}"
echo -e "  Password: ${YELLOW}admin1234${NC}"
echo "  Username: [nama tanpa spasi, lowercase]"
echo "  Email: [username]@grademind.edu"
echo "  Contoh: budisantoso / admin1234"
echo ""
echo -e "${GREEN}Mahasiswa (10,923 accounts = 33 dept × 331):${NC}"
echo -e "  Password: ${YELLOW}user1234${NC}"
echo "  Format: [NRP]/user1234 (atau [NRP]@grademind.edu/user1234)"
echo "  Format NRP: PPPPYYIXXX (10 digit)"
echo ""
echo -e "  Contoh Login:"
echo "    5001231001/user1234 (Dept 5001, index 001)"
echo "    5012241331/user1234 (Dept 5012, index 331)"
echo "    5033251155@grademind.edu/user1234 (Dept 5033, index 155)"
echo ""
echo -e "${YELLOW}Catatan:${NC}"
echo "  - Setiap departemen (5001-5033) punya 331 mahasiswa"
echo "  - Dosen username dari nama (tanpa spasi, lowercase)"
echo "  - Mahasiswa username = NRP"
echo "  - Cek database untuk username/NRP spesifik"
echo -e "${BLUE}================================================${NC}"
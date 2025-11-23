#!/bin/bash
# Script to fix all route handlers for Next.js 15+ async params

echo "Fixing async params in all route files..."

# Find all route.ts files with dynamic params (files in [id], [no], etc. directories)
find app/api -type f -name "route.ts" -path "*/\[*\]/*" | while read file; do
    echo "Processing: $file"

    # Check if file needs fixing (has non-Promise params)
    if grep -q "params }: { params: {" "$file" && ! grep -q "params }: { params: Promise<{" "$file"; then
        echo "  - Fixing $file"

        # Backup original
        cp "$file" "$file.backup"

        # Replace params type declarations with Promise version
        # Handle single param like { id: string }
        sed -i 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "$file"

        # Handle single param like { no: string }
        sed -i 's/{ params }: { params: { no: string } }/{ params }: { params: Promise<{ no: string }> }/g' "$file"

        # Handle two params like { id: string; Kd_Desa: string }
        sed -i 's/{ params }: { params: { id: string; Kd_Desa: string } }/{ params }: { params: Promise<{ id: string; Kd_Desa: string }> }/g' "$file"

        echo "  ✓ Fixed type declarations in $file"
    fi
done

echo "Done! Files have been updated."
echo "Note: You still need to:"
echo "1. Add 'const { id } = await params' (or appropriate param name) at the start of each function"
echo "2. Replace all 'params.id' with 'id' (or appropriate param name)"
echo "3. Review each file manually"

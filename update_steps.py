#!/usr/bin/env python3
"""
Script to update ProfileSetup.tsx step numbers after removing Step 9
Old steps 10, 11, 12, 13 become 9, 10, 11, 12
"""

import re

# Read the file
with open('/app/src/pages/ProfileSetup.tsx', 'r') as f:
    content = f.read()

# Find the end of Step 8 and start of Step 9
step8_end = content.find('    // STEP 9: REMOVED')
if step8_end == -1:
    print("Error: Could not find Step 9 marker")
    exit(1)

# Find the start of Step 10
step10_start = content.find('    // STEP 10:', step8_end)
if step10_start == -1:
    print("Error: Could not find Step 10")
    exit(1)

# Delete everything between Step 8 end and Step 10 start (removing Step 9 content)
# But keep the comment
marker_end = content.find('\n', step8_end)
content = content[:marker_end + 1] + content[step10_start:]

# Now update all step numbers: 10->9, 11->10, 12->11, 13->12
replacements = [
    ('// STEP 10:', '// STEP 9:'),
    ('if (step === 10)', 'if (step === 9)'),
    ('// STEP 11:', '// STEP 10:'),
    ('if (step === 11)', 'if (step === 10)'),
    ('// STEP 12:', '// STEP 11:'),
    ('if (step === 12)', 'if (step === 11)'),
    ('// STEP 13:', '// STEP 12:'),
    ('if (step === 13)', 'if (step === 12)'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write back
with open('/app/src/pages/ProfileSetup.tsx', 'w') as f:
    f.write(content)

print("✅ Successfully updated step numbers!")
print("Steps 10-13 are now steps 9-12")

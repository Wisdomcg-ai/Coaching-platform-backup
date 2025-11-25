const fs = require('fs');

// Read the file
const filePath = './src/app/business-profile/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Pattern replacements for text inputs (not in relative divs)
content = content.replace(
  /className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/g,
  'className={getInputClassName()}'
);

// Pattern for inputs with pr-8 (has % or $ symbol after)
content = content.replace(
  /className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/g,
  'className={getInputClassName()}'
);

// Pattern for selects
content = content.replace(
  /className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/g,
  (match, offset) => {
    // Check if this is within a <select> tag
    const before = content.substring(Math.max(0, offset - 100), offset);
    if (before.includes('<select')) {
      return 'className={getSelectClassName()}';
    }
    return match;
  }
);

// Pattern for textareas
content = content.replace(
  /className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"(\s+rows=)/g,
  'className={getTextareaClassName()}$1'
);

// Update labels to font-semibold
content = content.replace(
  /className="block text-sm font-medium text-gray-700 mb-2"/g,
  'className="block text-sm font-semibold text-gray-700 mb-2"'
);

// Update section dividers
content = content.replace(
  /className="border-b pb-6"/g,
  'className="border-b border-gray-200 pb-8"'
);

// Update section headers
content = content.replace(
  /className="text-lg font-semibold text-gray-800 mb-4"/g,
  'className="text-lg font-semibold text-gray-900 mb-6"'
);

// Write back
fs.writeFileSync(filePath, content);
console.log('✅ Updated all input fields!');

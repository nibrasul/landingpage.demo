const fs = require('fs');
const path = require('path');

const components = [
  'HeroSection',
  'TrustedBySection',
  'MetricsStrip',
  'WhyTapfolioSection',
  'ProductsSection',
  'HowItWorksSection',
  'EcosystemBento',
  'SecuritySection',
  'LiveDemoSection',
  'TrustCompanySection',
  'ConfiguratorSection',
  'FooterSection'
];

const dir = path.join(__dirname, 'src', 'components', 'sections');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

components.forEach(comp => {
  const file = path.join(dir, `${comp}.tsx`);
  const content = `import React from 'react';

export default function ${comp}() {
  return (
    <section id="${comp.toLowerCase()}" className="w-full py-24 min-h-[50vh] flex items-center justify-center bg-white border-b border-gray-100">
      <h2 className="text-3xl font-bold font-display text-gray-900">${comp}</h2>
    </section>
  );
}
`;
  fs.writeFileSync(file, content);
});

console.log('Scaffolded all components successfully.');

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname);

// Get all html files
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const seoTags = `
  <!-- SEO, AEO, GEO & OpenGraph -->
  <meta property="og:title" content="Pendidikan Malang - Pusat Bimbingan & Layanan Edukasi">
  <meta property="og:description" content="Platform bimbingan belajar dan pelatihan edukasi terbaik di Kota Pendidikan Malang.">
  <meta property="og:url" content="https://pendidikanmalang.vercel.app/">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://pendidikanmalang.vercel.app/assets/img/favicon.png">
  <meta property="og:site_name" content="Pendidikan Malang">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Pendidikan Malang - Pusat Bimbingan & Layanan Edukasi">
  <meta name="twitter:description" content="Platform bimbingan belajar dan pelatihan edukasi terbaik di Kota Pendidikan Malang.">
  <meta name="twitter:image" content="https://pendidikanmalang.vercel.app/assets/img/favicon.png">
  <link rel="canonical" href="https://pendidikanmalang.vercel.app/">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Pendidikan Malang",
    "url": "https://pendidikanmalang.vercel.app/",
    "logo": "https://pendidikanmalang.vercel.app/assets/img/favicon.png",
    "description": "Platform bimbingan belajar dan pelatihan edukasi terbaik di Kota Pendidikan Malang.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Pendidikan Malang No. 1",
      "addressLocality": "Malang",
      "addressRegion": "Jawa Timur",
      "addressCountry": "ID"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+62-812-1736-6600",
      "contactType": "customer service"
    }
  }
  </script>
`;

const waWidget = `
  <a href="https://wa.me/6281217366600" class="floating-wa" target="_blank" aria-label="Chat WhatsApp">
    <i class="bi bi-whatsapp"></i>
  </a>
`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Insert SEO tags before </head>
  if (!content.includes('property="og:title"')) {
    content = content.replace('</head>', `${seoTags}\n</head>`);
  }

  // Insert WA Widget before </body>
  if (!content.includes('class="floating-wa"')) {
    content = content.replace('</body>', `${waWidget}\n</body>`);
  }

  // Defer scripts
  // replace <script src="assets/..."></script> with <script src="assets/..." defer></script>
  content = content.replace(/<script src="([^"]+)"( defer)?><\/script>/g, (match, src, deferArg) => {
    if (deferArg || src.includes('validate.js')) return match; // validate.js might break if deferred improperly? Actually all vendor scripts are fine to defer if they don't block render.
    return `<script src="${src}" defer></script>`;
  });

  // Lazy load images
  content = content.replace(/<img ([^>]+)>/g, (match, attrs) => {
    // skip if already has loading="lazy" or loading="eager"
    if (attrs.includes('loading=')) return match;
    // skip if it's the main hero image maybe? Actually, adding lazy loading to all images is mostly fine, 
    // but better to just inject loading="lazy" safely.
    return `<img ${attrs} loading="lazy">`;
  });
  // Note: the regex for img might match nested things incorrectly if html is broken, but standard html is fine.

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});

// Generates the downloadable CV PDFs from the cv-data JSON files, so the PDFs
// always stay in sync with the website. Uses the locally installed Chrome/Edge
// (via puppeteer-core) to print an HTML template styled after the original CV.
//
// Usage: npm run pdf
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const BROWSER_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const LABELS = {
  es: {
    summary: 'Resumen Profesional',
    education: 'Educación',
    publications: 'Publicaciones',
    experience: 'Experiencia Profesional',
    competitions: 'Competencias y Premios',
    certifications: 'Certificaciones',
    skills: 'Habilidades Técnicas',
    languages: 'Idiomas',
    authors: 'Autores',
    link: 'Enlace',
    diplomas: 'Diplomas en Google Drive',
  },
  en: {
    summary: 'Professional Summary',
    education: 'Education',
    publications: 'Publications',
    experience: 'Professional Experience',
    competitions: 'Competitions & Awards',
    certifications: 'Certifications',
    skills: 'Technical Skills',
    languages: 'Languages',
    authors: 'Authors',
    link: 'Link',
    diplomas: 'Diplomas on Google Drive',
  },
};

const escapeHtml = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// Converts "[text](url)" markdown links into anchors (after HTML-escaping).
const md = (s) => escapeHtml(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

function renderHtml(data, lang) {
  const t = LABELS[lang];
  const p = data.personalInfo;

  const contactLinks = [
    `<a href="tel:${p.phone.replaceAll(' ', '')}">${escapeHtml(p.phone)}</a>`,
    `<a href="mailto:${p.email}">${p.email}</a>`,
    p.linkedin && `<a href="${p.linkedin}">LinkedIn</a>`,
    p.scholar && `<a href="${p.scholar}">Google Scholar</a>`,
    p.diplomas && `<a href="${p.diplomas}">${t.diplomas}</a>`,
  ]
    .filter(Boolean)
    .join(' | ');

  const experience = data.experience
    .map(
      (e) => `
      <div class="entry">
        <div class="company-bar">${escapeHtml(e.company)} | ${escapeHtml(e.position)}</div>
        <p class="meta">${escapeHtml(e.location ?? '')}${e.location ? ', ' : ''}${escapeHtml(e.period)}</p>
        <ul>${e.description.map((d) => `<li>${md(d)}</li>`).join('')}</ul>
      </div>`,
    )
    .join('');

  const education = data.education
    .map(
      (e) => `
      <div class="edu">
        <p class="edu-degree">${escapeHtml(e.degree)}</p>
        <p>${escapeHtml(e.institution)}, ${escapeHtml(e.period)}</p>
      </div>`,
    )
    .join('');

  const publications = data.publications
    .map((pub) => {
      const links = [
        pub.doi && `<a href="https://doi.org/${pub.doi}">DOI: ${pub.doi}</a>`,
        pub.link && `<a href="${pub.link}">${t.link}</a>`,
      ]
        .filter(Boolean)
        .join(' | ');
      return `
      <div class="pub">
        <p class="pub-title">${escapeHtml(pub.title)}</p>
        <p>${escapeHtml(pub.authors.join(', '))}. <em>${escapeHtml(pub.publication)}</em>, ${pub.date}.${links ? ` ${links}` : ''}</p>
      </div>`;
    })
    .join('');

  const competitions = data.competitions
    .map(
      (c) => `
      <div class="pub">
        <p class="pub-title">${escapeHtml(c.title)} — ${escapeHtml(c.position)}</p>
        <p>${escapeHtml(c.platform)}${c.url ? ` | <a href="${c.url}">${t.link}</a>` : ''}</p>
      </div>`,
    )
    .join('');

  const certifications = data.certifications
    .map((c) => `<li>${escapeHtml(c.name)} — ${escapeHtml(c.issuer)} (${c.year})</li>`)
    .join('');

  const skills = data.skills.categories
    .map(
      (cat) => `
      <p><strong>${escapeHtml(cat.title)}:</strong> ${escapeHtml(cat.skills.join(', '))}</p>`,
    )
    .join('');

  const languages = data.languages
    .map((l) => `<li>${escapeHtml(l.name)}: ${escapeHtml(l.level)}</li>`)
    .join('');

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Calibri, Carlito, 'Segoe UI', sans-serif;
    font-size: 10.5pt;
    color: #1f2937;
    line-height: 1.45;
  }
  a { color: #155e75; }
  h1 { font-size: 26pt; font-weight: 600; color: #155e75; letter-spacing: 0.5px; }
  .job-title { font-size: 11pt; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
  .contact { margin: 10px 0 14px; font-size: 10pt; }
  .section-bar {
    background: #155e75;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 11pt;
    font-weight: 600;
    padding: 4px 10px;
    margin: 14px 0 8px;
    break-after: avoid;
  }
  .company-bar {
    background: #cfe8f3;
    color: #0f3a4a;
    text-transform: uppercase;
    font-size: 10.5pt;
    font-weight: 600;
    padding: 3px 10px;
    margin-bottom: 4px;
    break-after: avoid;
  }
  .meta { font-style: italic; margin-bottom: 4px; }
  .entry { margin-bottom: 10px; }
  .entry ul { padding-left: 18px; }
  .entry li { margin-bottom: 2px; text-align: justify; }
  .summary { text-align: justify; }
  .edu, .pub { margin-bottom: 7px; break-inside: avoid; }
  .edu-degree, .pub-title { color: #155e75; font-weight: 600; text-transform: uppercase; font-size: 10.5pt; }
  .pub-title { text-transform: none; font-size: 11pt; }
  .certs, .langs { padding-left: 18px; }
  .certs li, .langs li { margin-bottom: 2px; }
</style>
</head>
<body>
  <h1>${escapeHtml(p.name).toUpperCase()}</h1>
  <p class="job-title">${escapeHtml(p.title)}</p>
  <p class="contact">${contactLinks}</p>

  <div class="section-bar">${t.summary}</div>
  <p class="summary">${escapeHtml(data.summary)}</p>

  <div class="section-bar">${t.education}</div>
  ${education}

  <div class="section-bar">${t.publications}</div>
  ${publications}

  <div class="section-bar">${t.experience}</div>
  ${experience}

  <div class="section-bar">${t.competitions}</div>
  ${competitions}

  <div class="section-bar">${t.certifications}</div>
  <ul class="certs">${certifications}</ul>

  <div class="section-bar">${t.skills}</div>
  ${skills}

  <div class="section-bar">${t.languages}</div>
  <ul class="langs">${languages}</ul>
</body>
</html>`;
}

const executablePath = BROWSER_PATHS.find((p) => existsSync(p));
if (!executablePath) {
  console.error('No Chrome/Edge installation found in the known paths.');
  process.exit(1);
}

const jobs = [
  { data: 'src/data/cv-data.json', lang: 'es', out: 'src/assets/Pablo Neirz Vergara_CV_ESP.pdf' },
  {
    data: 'src/data/cv-data-en.json',
    lang: 'en',
    out: 'src/assets/Pablo Neirz Vergara_CV_ENG.pdf',
  },
];

const browser = await puppeteer.launch({ executablePath });
try {
  for (const job of jobs) {
    const data = JSON.parse(readFileSync(join(root, job.data), 'utf8'));
    const page = await browser.newPage();
    await page.setContent(renderHtml(data, job.lang), { waitUntil: 'networkidle0' });
    await page.pdf({
      path: join(root, job.out),
      format: 'A4',
      printBackground: true,
      margin: { top: '1.6cm', bottom: '1.6cm', left: '1.7cm', right: '1.7cm' },
    });
    await page.close();
    console.log(`Generated ${job.out}`);
  }
} finally {
  await browser.close();
}

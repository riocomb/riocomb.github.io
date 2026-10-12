'use strict';

const labels = { upcoming: 'Em preparação', confirmed: 'Confirmada', past: 'Realizada' };
const element = (tag, className, content) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
};
const safeUrl = value => {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
};
const externalLink = (label, url) => {
  const link = element('a', '', label);
  link.href = url;
  return link;
};
let siteData;
let selectedEditionId;

function selectEdition(edition, navigate = false) {
  selectedEditionId = edition.id;
  edition = localize(edition);
  document.getElementById('edition-title').textContent = edition.title;
  document.getElementById('edition-institutions').hidden = edition.institution !== 'UERJ';
  document.getElementById('edition-number').textContent = edition.number;
  document.getElementById('edition-status').textContent = t(labels[edition.status]);
  document.querySelector('.section-top .eyebrow').textContent = edition.id === siteData.featuredEdition ? t("01 / Edição em destaque") : t("01 / Edição selecionada");
  document.getElementById('edition-description').textContent = edition.description;
  document.getElementById('edition-description').hidden = !edition.description;
  const facts = document.getElementById('edition-facts');
  facts.replaceChildren();
  for (const [label, value] of [[t("Data"), edition.date || t("A confirmar")], [t("Local"), edition.venue || t("A confirmar")], [t("Participação"), edition.participation || t("A confirmar")]]) {
    const row = element('div');
    const detail = element('dd', '', value);
    if (label === t('Participação') && edition.visitors?.length) {
      detail.replaceChildren(element('p', 'visitors-label', t('Pesquisadores visitantes')));
      const visitors = element('ul', 'visitors-list');
      for (const original of edition.visitors) {
        const visitor = localize(original);
        const item = element('li');
        item.append(element('strong', '', visitor.name), element('span', '', visitor.affiliation));
        visitors.append(item);
      }
      detail.append(visitors);
    }
    row.append(element('dt', '', label), detail);
    facts.append(row);
  }
  renderProgram(edition);
  renderOrganizers(edition);
  document.getElementById('practical-location').textContent = edition.venue || t("Local a confirmar.");
  const contact = document.getElementById('practical-contact');
  contact.replaceChildren();
  if (edition.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(edition.contactEmail)) {
    const link = element('a', '', edition.contactEmail);
    link.href = `mailto:${edition.contactEmail}`;
    contact.append(link);
  } else contact.append(document.createTextNode(t('Contato: a confirmar.')));
  const registration = document.getElementById('practical-registration');
  const url = safeUrl(edition.registrationUrl);
  registration.replaceChildren(url ? externalLink(t("Inscrições ↗"), url) : document.createTextNode(edition.participation || t("Inscrições: a confirmar.")));
  document.querySelectorAll('[data-edition]').forEach(button => {
    const current = button.dataset.edition === edition.id;
    button.setAttribute('aria-pressed', String(current));
    button.textContent = current ? t("Edição selecionada ↑") : t("Ver edição ↗");
  });
  if (navigate) {
    const location = new URL(window.location.href);
    location.searchParams.set('edicao', edition.id);
    location.searchParams.set('lang', language);
    location.hash = 'edicao';
    history.pushState({}, '', location);
    const heading = document.getElementById('edition-title');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    document.getElementById('edicao').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
}

function renderOrganizers(edition) {
  const list = document.getElementById('organizers-list');
  list.replaceChildren();
  for (const original of edition.organizers || []) {
    const organizer = typeof original === 'string' ? {name: original} : localize(original);
    const item = element('li');
    item.append(element('h3', '', organizer.name));
    if (organizer.role) item.append(element('p', 'organizer-role', organizer.role));
    if (organizer.affiliation) item.append(element('p', '', organizer.affiliation));
    list.append(item);
  }
  if (!list.childElementCount) list.append(element('li', '', t('Organização: a confirmar.')));
}

function renderProgram(edition) {
  const container = document.getElementById('program-content');
  container.replaceChildren();
  if (!edition.schedule?.length) {
    const empty = element('div', 'empty-state');
    empty.append(element('p', '', edition.status === 'past' ? t("Programação não disponível.") : t("Horários e palestras a confirmar.")));
    container.append(empty);
  }
  let currentDay;
  for (const original of edition.schedule || []) {
    const session = localize(original);
    if (session.day && session.day !== currentDay) {
      container.append(element('h3', 'program-day', session.day));
      currentDay = session.day;
    }
    const row = element('article', 'session');
    const time = element('span', '', session.time || t("A confirmar"));
    const copy = element('div');
    if (session.speakerPhoto && /^assets\/[a-z0-9-]+\.png$/.test(session.speakerPhoto)) {
      const photo = element('img', 'speaker-photo');
      photo.src = session.speakerPhoto;
      photo.alt = session.speakerPhotoAlt || session.speaker || '';
      photo.width = 392;
      photo.height = 483;
      photo.loading = 'lazy';
      copy.append(photo);
    }
    copy.append(element('h3', '', session.title || t("Título a confirmar")), element('p', '', session.speaker || (session.type === 'roundtable' ? '' : t("Palestrante a confirmar"))));
    if (session.description) copy.append(element('p', '', session.description));
    if (session.abstract) {
      const details = element('details');
      details.append(element('summary', '', t("Leia o resumo")), element('p', '', session.abstract));
      copy.append(details);
    }
    row.append(time, copy);
    container.append(row);
  }
  const materials = (edition.materials || []).map(localize).filter(item => safeUrl(item.url));
  if (materials.length) {
    const section = element('div', 'materials');
    section.append(element('h3', '', t("Materiais do encontro")));
    const list = element('ul');
    for (const item of materials) {
      const li = element('li');
      li.append(externalLink(item.label, safeUrl(item.url)));
      list.append(li);
    }
    section.append(list);
    container.append(section);
  }
}

function editionButton(edition) {
  const button = element('button', '', t("Ver edição ↗"));
  button.type = 'button';
  button.dataset.edition = edition.id;
  button.setAttribute('aria-label', `${language === "en" ? "Select" : "Selecionar"} ${localize(edition).title}`);
  button.addEventListener('click', () => selectEdition(edition, true));
  return button;
}

function renderEditions() {
  const grid = document.getElementById('edition-list');
  grid.replaceChildren();
  for (const [index, original] of siteData.editions.entries()) {
    const edition = localize(original);
    if (edition.status === 'past') continue;
    const card = element('article', 'edition-card');
    const top = element('div', 'card-top');
    top.append(element('span', 'card-number', String(index + 1).padStart(2, '0')), element('span', 'card-status', t(labels[edition.status])));
    card.append(top, element('h3', '', edition.title), element('p', '', edition.date || t("Data a confirmar")), editionButton(edition));
    grid.append(card);
  }
  const past = siteData.editions.filter(edition => edition.status === 'past');
  const archive = document.getElementById('archive-content');
  archive.replaceChildren(element('p', '', t('Nenhuma edição realizada.')));
  if (past.length) {
    archive.replaceChildren();
    for (const original of past) {
      const edition = localize(original);
      const row = element('div', 'archive-item');
      const copy = element('div');
      copy.append(element('h3', '', edition.title), element('p', '', edition.date || t("Data não informada")));
      row.append(copy, editionButton(edition));
      archive.append(row);
    }
  }
}

function featuredLinks() {
 const query = '?lang=' + language + '&edicao=' + encodeURIComponent(siteData.featuredEdition) + '#edicao';
 document.querySelector('.hero .button').href = query;
 document.querySelector('nav a').href = query;
}
translatePage();
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
 language=button.dataset.language;
 const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState({},'',url);
 translatePage();
 if(siteData){renderEditions();selectEdition(siteData.editions.find(e=>e.id===selectedEditionId)||siteData.editions[0]);featuredLinks();}
 const error=document.querySelector('.load-error');if(error)error.textContent=t('Não foi possível carregar as edições. Recarregue a página ou tente novamente mais tarde.');
}));
fetch('data/editions.json', { cache: 'no-store' })
  .then(response => {
    if (!response.ok) throw new Error('Falha ao carregar as edições');
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data.editions) || !data.editions.length || data.editions.some(edition => !edition.id || !edition.title || !t(labels[edition.status]))) throw new Error('Dados de edições inválidos');
    siteData = data;
    renderEditions();
    featuredLinks();
    const requested = new URL(window.location.href).searchParams.get('edicao');
    selectEdition(data.editions.find(edition => edition.id === requested) || data.editions.find(edition => edition.id === data.featuredEdition) || data.editions[0]);
    window.addEventListener('popstate', () => {
      language=new URL(location.href).searchParams.get('lang')==='pt'?'pt':'en';
      translatePage();renderEditions();featuredLinks();
      const id = new URL(window.location.href).searchParams.get('edicao') || data.featuredEdition;
      selectEdition(data.editions.find(edition => edition.id === id) || data.editions[0]);
    });
  })
  .catch(() => {
    document.getElementById('edition-list').append(element('p', 'load-error', t("Não foi possível carregar as edições. Recarregue a página ou tente novamente mais tarde.")));
  });

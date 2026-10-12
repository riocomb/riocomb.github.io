'use strict';
const english = {
 'Pesquisadores visitantes':'Visiting researchers',
 'Universidade do Estado do Rio de Janeiro':'Rio de Janeiro State University',
 'Instituto de Matemática e Estatística':'Institute of Mathematics and Statistics',
 'Organização':'Organizing committee','Contato e participação':'Contact and participation','Contato: a confirmar.':'Contact: to be confirmed.',
 'Pular para o conteúdo':'Skip to content', 'Rio COMB — início':'Rio COMB — home', 'Navegação principal':'Main navigation',
 'Edição em destaque':'Featured edition','Edições':'Editions','Sobre a série':'About the series',
 'Seminários de Combinatória no Rio de Janeiro':'Combinatorics seminars in Rio de Janeiro',
 'Ver edição em destaque':'View featured edition','Ver programação':'View programme',
 '01 / Edição em destaque':'01 / Featured edition','01 / Edição selecionada':'01 / Selected edition',
 'Em preparação':'In preparation','Confirmada':'Confirmed','Realizada':'Past edition',
 'Primeira edição':'First edition','Rio COMB — 1ª edição':'Rio COMB — First edition',
 'Data':'Date','Local':'Venue','Participação':'Participation','A confirmar':'To be confirmed',
 'UERJ · sala a confirmar':'UERJ · room to be confirmed',
 'UERJ · campus e sala a confirmar':'UERJ · campus and room to be confirmed',
 'Programação':'Programme','Horários e palestras a confirmar.':'Times and talks to be confirmed.',
 'Horário a confirmar':'Time to be confirmed',
 'Ative o JavaScript para carregar as edições.':'Enable JavaScript to load the editions.',
 'Próximas edições':'Upcoming editions','Datas e periodicidade a confirmar.':'Dates and frequency to be confirmed.',
 'Edições anteriores':'Past editions','Nenhuma edição realizada.':'No past editions yet.',
 'Série de seminários acadêmicos de combinatória no Rio de Janeiro.':'An academic seminar series on combinatorics in Rio de Janeiro.',
 'Informações práticas':'Practical information','Organização e contato':'Organizers and contact',
 'A confirmar.':'To be confirmed.','UERJ · campus e sala a confirmar.':'UERJ · campus and room to be confirmed.',
 'Inscrições: a confirmar.':'Registration: to be confirmed.','Voltar ao início ↑':'Back to top ↑',
 'Local a confirmar.':'Venue to be confirmed.','Organização: a confirmar.':'Organizers: to be confirmed.',
 ' Contato: a confirmar.':' Contact: to be confirmed.','Inscrições ↗':'Registration ↗',
 'Edição selecionada ↑':'Selected edition ↑','Ver edição ↗':'View edition ↗',
 'Programação não disponível.':'Programme unavailable.','Título a confirmar':'Title to be confirmed',
 'Palestrante a confirmar':'Speaker to be confirmed','Leia o resumo':'Read abstract','Materiais do encontro':'Seminar materials',
 'Data a confirmar':'Date to be confirmed','Data não informada':'Date unavailable',
 'Não foi possível carregar as edições. Recarregue a página ou tente novamente mais tarde.':'Unable to load the editions. Reload the page or try again later.',
 'Malha em grafo do Pão de Açúcar alto e estreito à esquerda e do Morro da Urca mais baixo e largo à direita':'Graph mesh of the tall, narrow Sugarloaf Mountain on the left and the lower, wider Morro da Urca on the right'
};
let language = new URL(location.href).searchParams.get('lang') === 'pt' ? 'pt' : 'en';
const t = text => language === 'en' ? english[text] || text : text;
const localize = object => ({...object, ...object.translations?.[language]});
function translatePage() {
 document.documentElement.lang=language==='pt'?'pt-BR':'en';
 document.querySelectorAll('[data-i18n]').forEach(node=>{node.textContent=t(node.dataset.i18n);});
 document.querySelectorAll('[data-i18n-aria]').forEach(node=>{node.setAttribute('aria-label',t(node.dataset.i18nAria));});
 document.querySelectorAll('[data-i18n-alt]').forEach(node=>{node.alt=t(node.dataset.i18nAlt);});
 document.querySelector('meta[name="description"]').content='Rio COMB — '+t('Seminários de Combinatória no Rio de Janeiro');
 document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
}

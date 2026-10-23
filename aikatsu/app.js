'use strict';
const form = document.querySelector('#filters');
const prefecture = document.querySelector('#prefecture');
const query = document.querySelector('#query');
const results = document.querySelector('#results');
const count = document.querySelector('#result-count');
const message = document.querySelector('#message');
const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ja');
let shops = [];
let total = 0;
let prefectures = [];

function applyUrl() {
  const params = new URLSearchParams(location.search);
  const selected = params.get('prefecture') || '';
  prefecture.value = prefectures.includes(selected) ? selected : '';
  query.value = params.get('q') || '';
}

function render(updateUrl = true) {
  const terms = normalize(query.value).trim().split(/\s+/).filter(Boolean);
  const matches = shops.filter(shop => (!prefecture.value || shop.prefecture === prefecture.value) && terms.every(term => shop.search.includes(term)));
  const fragment = document.createDocumentFragment();
  const groups = new Map();
  for (const shop of matches) {
    if (!groups.has(shop.prefecture)) groups.set(shop.prefecture, []);
    groups.get(shop.prefecture).push(shop);
  }
  for (const [name, stores] of groups) {
    const section = document.createElement('section');
    section.className = 'prefecture-group';
    const heading = document.createElement('h2');
    heading.textContent = name;
    const number = document.createElement('span');
    number.textContent = `${stores.length}店舗`;
    heading.append(number);
    const list = document.createElement('ul');
    list.className = 'shop-list';
    for (const shop of stores) {
      const item = document.createElement('li');
      item.className = 'shop';
      const info = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = shop.name;
      const address = document.createElement('p');
      address.className = 'address';
      address.textContent = shop.address;
      info.append(title, address);
      const map = document.createElement('a');
      map.className = 'map-link';
      map.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((shop.address.startsWith(shop.prefecture) ? '' : shop.prefecture + ' ') + shop.address + ' ' + shop.name)}`;
      map.target = '_blank';
      map.rel = 'noopener noreferrer';
      map.textContent = '地図 ↗';
      map.setAttribute('aria-label', `${shop.name}を地図で開く（新しいタブ）`);
      item.append(info, map);
      list.append(item);
    }
    section.append(heading, list);
    fragment.append(section);
  }
  results.replaceChildren(fragment);
  count.textContent = `${matches.length.toLocaleString('ja-JP')} / ${total.toLocaleString('ja-JP')}店舗`;
  message.hidden = matches.length !== 0;
  message.textContent = '条件に一致する店舗がありません。';
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.delete('prefecture');
    url.searchParams.delete('q');
    if (prefecture.value) url.searchParams.set('prefecture', prefecture.value);
    if (query.value.trim()) url.searchParams.set('q', query.value.trim());
    history.replaceState(null, '', url);
  }
}

async function init() {
  try {
    const response = await fetch(new URL('shops.json', document.baseURI));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    shops = data.shops.map(shop => ({...shop, search: normalize(`${shop.name} ${shop.prefecture} ${shop.address}`)}));
    total = shops.length;
    prefectures = [...new Set(shops.map(shop => shop.prefecture))];
    for (const name of prefectures) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      prefecture.append(option);
    }
    for (const [id, value] of [['source-date', data.sourceAsOf], ['updated-date', data.updatedAt]]) {
      const time = document.getElementById(id);
      const [year, month, day] = value.split('-').map(Number);
      time.dateTime = value;
      time.textContent = `${year}年${month}月${day}日`;
    }
    prefecture.disabled = query.disabled = false;
    applyUrl();
    render(false);
    form.addEventListener('submit', event => event.preventDefault());
    prefecture.addEventListener('change', () => render());
    query.addEventListener('input', () => render());
    form.addEventListener('reset', () => {
      prefecture.value = '';
      query.value = '';
      render();
    });
    window.addEventListener('popstate', () => { applyUrl(); render(false); });
  } catch (error) {
    count.textContent = '読み込めませんでした';
    message.hidden = false;
    message.textContent = '店舗情報を読み込めませんでした。再読み込みするか、上の公式PDFをご確認ください。';
    console.error(error);
  } finally {
    results.setAttribute('aria-busy', 'false');
  }
}
init();

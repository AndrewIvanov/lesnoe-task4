import {houses,KEY,validInteger,validBookings} from './data.js';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
let selected=null, bookings=[];
function notice(message){$('notice').textContent=message;}
function load(){try{const raw=localStorage.getItem(KEY);if(raw===null)return;const data=JSON.parse(raw);if(!validBookings(data))throw Error('invalid');bookings=data;}catch{notice('Не удалось прочитать сохранённые брони. Можно начать заново или сбросить демо.');}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(bookings));return true;}catch{notice('Брони доступны в текущем сеансе, но сохранить их в браузере не удалось.');return false;}}
const occupied=h=>h.busy||bookings.some(b=>b.houseId===h.id);
const filtered=()=>houses.filter(h=>h.capacity>=Number($('filterGuests').value)&&h.price<=Number($('filterPrice').value));
const status=h=>occupied(h)?'× Занят':selected===h.id?'✓ Выбран':'○ Свободен';
function make(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
function renderObjects(){const visible=filtered();$('results').textContent=`Найдено: ${visible.length} из ${houses.length}`;$('markers').replaceChildren();$('list').replaceChildren();for(const h of visible){const marker=make('button','marker'+(selected===h.id?' selected':''));marker.type='button';marker.style.left=h.x+'%';marker.style.top=h.y+'%';marker.disabled=occupied(h);marker.setAttribute('aria-label',`${h.name}, ${status(h)}, ${money(h.price)} за ночь`);marker.setAttribute('aria-pressed',String(selected===h.id));marker.append(make('b','','⌂ '+h.id),make('span','',status(h)));marker.onclick=()=>choose(h.id,'markers');marker.dataset.id=h.id;$('markers').append(marker);const card=make('button','house'+(selected===h.id?' selected':''));card.type='button';card.disabled=occupied(h);card.dataset.id=h.id;card.setAttribute('aria-pressed',String(selected===h.id));card.append(make('span','symbol','⌂ '+h.id),make('strong','',h.name),make('span','',`До ${h.capacity} гостей · ${money(h.price)}/ночь`),make('span','status',status(h)));card.onclick=()=>choose(h.id,'list');$('list').append(card);}if(!visible.length){$('list').append(make('p','empty','Нет подходящих домов. Измените фильтры.'));const empty=make('p','empty','Нет подходящих домов');empty.style.position='absolute';empty.style.left='10%';empty.style.top='30%';$('markers').append(empty);}}
function clearErrors(){for(const id of ['guestError','nightError','formError'])$(id).textContent='';for(const id of ['guests','nights'])$(id).removeAttribute('aria-invalid');}
function renderDetail() {
  const house = houses.find(h => h.id === selected);
  const booked = house ? occupied(house) : false;
  $('detailTitle').textContent = house ? house.name : 'Выберите дом';
  $('description').textContent = house ? house.description : 'Нажмите на свободный дом на схеме или в списке.';
  $('rate').textContent = house ? `${money(house.price)} / ночь · до ${house.capacity} гостей` : '';
  $('bookingForm').hidden = !house;
  $('guests').max = house ? house.capacity : 8;
  $('guests').disabled = booked;
  $('nights').disabled = booked;
  $('bookingSubmit').disabled = booked;
  $('bookingSubmit').textContent = booked ? 'Бронь подтверждена' : 'Подтвердить бронь';
  clearErrors();
  updateTotal();
}
function choose(id,source){const h=houses.find(h=>h.id===id);if(!h||occupied(h)||!filtered().includes(h))return;selected=id;$('guests').value=Math.min(h.capacity,Number($('filterGuests').value));$('nights').value=1;notice('');renderObjects();renderDetail();$(source).querySelector(`[data-id="${id}"]`)?.focus();}
function updateTotal(){const h=houses.find(h=>h.id===selected);const nights=$('nights').valueAsNumber;$('total').textContent=h&&validInteger(nights,1,30)?money(h.price*nights):'—';}
function filtersChanged(){if(selected!==null&&!filtered().some(h=>h.id===selected)){selected=null;notice('Выбранный дом скрыт фильтрами. Выберите другой дом.');renderDetail();}else notice('');renderObjects();}
function renderBookings() {
  $('count').textContent = bookings.length;
  $('bookingList').replaceChildren();
  if (!bookings.length) {
    $('bookingList').append(make('p', 'empty', 'У вас пока нет бронирований.'));
    return;
  }
  for (const booking of bookings) {
    const house = houses.find(h => h.id === booking.houseId);
    const row = make('article', 'booking');
    const info = make('div');
    info.append(
      make('strong', '', house.name + ' · ' + money(booking.total)),
      make('p', '', `Бронь № ${booking.number} · Гостей: ${booking.guests} · Ночей: ${booking.nights}`),
    );
    const cancel = make('button', 'secondary', 'Отменить бронь');
    cancel.type = 'button';
    cancel.onclick = () => {
      bookings = bookings.filter(item => item.number !== booking.number);
      notice('Бронь отменена. Дом снова свободен.');
      save();
      renderObjects();
      if (selected === booking.houseId) renderDetail();
      renderBookings();
      $('resetDemo').focus();
    };
    row.append(info, cancel);
    $('bookingList').append(row);
  }
}
$('bookingForm').addEventListener('submit', event => {
  event.preventDefault();
  const house = houses.find(h => h.id === selected);
  if (!house || occupied(house)) return;

  clearErrors();
  const guests = $('guests').valueAsNumber;
  const nights = $('nights').valueAsNumber;
  let valid = true;
  if (!validInteger(guests, 1, house.capacity)) {
    $('guestError').textContent = `Введите целое число от 1 до ${house.capacity}.`;
    $('guests').setAttribute('aria-invalid', 'true');
    valid = false;
  }
  if (!validInteger(nights, 1, 30)) {
    $('nightError').textContent = 'Введите целое число от 1 до 30.';
    $('nights').setAttribute('aria-invalid', 'true');
    valid = false;
  }
  if (!valid) {
    document.querySelector('[aria-invalid="true"]').focus();
    return;
  }

  bookings.push({
    number: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    houseId: house.id,
    guests,
    nights,
    total: house.price * nights,
  });
  notice('Бронь подтверждена. Запись добавлена в «Мои брони».');
  save();
  renderObjects();
  renderDetail();
  renderBookings();
});
for(const id of ['guests','nights'])$(id).addEventListener('input',()=>{clearErrors();updateTotal();});for(const id of ['filterGuests','filterPrice'])$(id).addEventListener('change',filtersChanged);$('resetFilters').onclick=()=>{$('filterGuests').value='1';$('filterPrice').value='Infinity';filtersChanged();};$('resetDemo').onclick=()=>{if(!confirm('Удалить все учебные брони?'))return;bookings=[];selected=null;notice('Демо сброшено.');try{localStorage.removeItem(KEY);}catch{notice('Не удалось очистить сохранение браузера. Текущий сеанс сброшен.');}renderObjects();renderDetail();renderBookings();};
load();renderObjects();renderDetail();renderBookings();

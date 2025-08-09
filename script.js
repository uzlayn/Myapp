// Настройки
const ADMIN_ID = 704260288; // <-- Заменить на ID администратора

// Демо-база видео и пользователей (в реале хранить на сервере)
const videos = {
  video123: { src: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Большой фильм', fullLink: 'https://example.com/fullmovie123' },
  video456: { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm', title: 'Красивые цветы', fullLink: 'https://example.com/fullmovie456' }
};
let usersDB = [
  { id: 111111111, name: 'Иван', canAddVideo: false },
  { id: 222222222, name: 'Оля', canAddVideo: true }
];

// Попытка получить user id из Telegram WebApp
let currentUserId = 0;
if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
  currentUserId = Telegram.WebApp.initDataUnsafe.user.id;
} else {
  // Для локального теста — можно подставить свой id
  // currentUserId = 123456789;
}

// Элементы
const videoEl = document.getElementById('video');
const videoSource = document.getElementById('video'); // сам video элемент
const videoTitle = document.getElementById('videoTitle');
const likeBtn = document.getElementById('likeBtn');
const shareBtn = document.getElementById('shareBtn');
const addVideoBtn = document.getElementById('addVideoBtn');
const watchBtn = document.getElementById('watchBtn');

const paidAddModal = document.getElementById('paidAddModal');
const contactAdminBtn = document.getElementById('contactAdminBtn');
const closePaidModal = document.getElementById('closePaidModal');

const addVideoModal = document.getElementById('addVideoModal');
const closeAddModal = document.getElementById('closeAddModal');
const publishVideoBtn = document.getElementById('publishVideoBtn');

const adminIcon = document.getElementById('adminIcon');
const adminModal = document.getElementById('adminModal');
const closeAdminModal = document.getElementById('closeAdminModal');
const usersList = document.getElementById('usersList');

// Текущий видео id (парсится из URL ?start=video123)
function getStartParam() {
  return new URLSearchParams(window.location.search).get('start');
}
const currentVideoId = getStartParam() || 'video123';

function loadVideoById(id){
  const data = videos[id];
  if(!data){ videoTitle.textContent = 'Видео не найдено'; videoEl.src = ''; return; }
  videoEl.src = data.src;
  videoTitle.textContent = data.title;
  watchBtn.onclick = () => window.open(data.fullLink, '_blank');
}

loadVideoById(currentVideoId);

// Появление нижней кнопки после старта
videoEl.addEventListener('play', ()=>{
  setTimeout(()=> watchBtn.classList.add('show'), 900);
});

// Лайк
likeBtn.addEventListener('click', ()=>{
  likeBtn.classList.toggle('active');
  likeBtn.animate([{transform:'scale(1)'},{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:300,easing:'ease-out'});
});

// Переслать — копируем ссылку на мини-приложение с параметром
shareBtn.addEventListener('click', async ()=>{
  const shareUrl = `${location.origin}${location.pathname}?start=${currentVideoId}`;
  try{
    await navigator.clipboard.writeText(shareUrl);
    alert('Ссылка скопирована в буфер. Вставьте её в чат Telegram чтобы переслать.');
  }catch(e){ window.open(shareUrl,'_blank'); }
});

// Добавить видео — проверка прав
function userCanAddVideo(userId){
  const u = usersDB.find(x=>x.id===userId);
  return u ? u.canAddVideo : false;
}

addVideoBtn.addEventListener('click', ()=>{
  if(userCanAddVideo(currentUserId)){
    addVideoModal.classList.add('active');
  } else {
    paidAddModal.classList.add('active');
  }
});

contactAdminBtn.addEventListener('click', ()=>{
  // открываем чат с админом (замени на реальный username)
  window.open('https://t.me/your_admin_username','_blank');
});
closePaidModal.addEventListener('click', ()=> paidAddModal.classList.remove('active'));
closeAddModal.addEventListener('click', ()=> addVideoModal.classList.remove('active'));

publishVideoBtn.addEventListener('click', ()=>{
  const videoFile = document.getElementById('videoFileInput').files[0];
  const coverFile = document.getElementById('coverFileInput').files[0];
  const videoName = document.getElementById('videoNameInput').value.trim();
  const buttonName = document.getElementById('buttonNameInput').value.trim();
  const buttonLink = document.getElementById('buttonLinkInput').value.trim();
  if(!videoFile || !videoName || !buttonName || !buttonLink){ alert('Заполните все поля и выберите видео.'); return; }
  // Здесь: отправка на сервер/модерацию (fetch POST с FormData)
  alert('Видео отправлено на модерацию. Админ проверит и даст разрешение.');
  addVideoModal.classList.remove('active');
});

// --- Админка ---
if(currentUserId === ADMIN_ID){
  adminIcon.style.display = 'flex';
}

function renderUsersList(){
  usersList.innerHTML = '';
  usersDB.forEach(u=>{
    const row = document.createElement('div'); row.className = 'user-row';
    const info = document.createElement('div'); info.className='name'; info.textContent = `${u.name} (ID: ${u.id})`;
    const controls = document.createElement('div');
    const allowBtn = document.createElement('button'); allowBtn.className='allow'; allowBtn.textContent = 'Разрешить';
    const denyBtn = document.createElement('button'); denyBtn.className='deny'; denyBtn.textContent = 'Запретить';
    allowBtn.onclick = ()=>{ u.canAddVideo = true; renderUsersList(); /* send to server */ };
    denyBtn.onclick = ()=>{ u.canAddVideo = false; renderUsersList(); /* send to server */ };
    controls.appendChild(allowBtn); controls.appendChild(denyBtn);
    row.appendChild(info); row.appendChild(controls);
    usersList.appendChild(row);
  });
}

adminIcon && adminIcon.addEventListener('click', ()=>{ renderUsersList(); adminModal.classList.add('active'); });
closeAdminModal && closeAdminModal.addEventListener('click', ()=> adminModal.classList.remove('active'));

// Для дебага в локале — если хочешь видеть админку, раскомментируй:
// currentUserId = ADMIN_ID; adminIcon.style.display='flex';

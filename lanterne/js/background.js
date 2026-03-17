// Background service worker for Lanterne

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'lectio-fetch') {
    handleLectioFetch(msg).then(sendResponse).catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

async function handleLectioFetch({ schoolId, sessionId, autoKey, path }) {
  const url = 'https://www.lectio.dk';

  // Set all required Lectio cookies
  const cookies = [
    { name: 'ASP.NET_SessionId', value: sessionId, httpOnly: true },
    { name: 'autologinkeyV2', value: autoKey, httpOnly: false },
    { name: 'isloggedin3', value: 'Y', httpOnly: false },
  ];

  for (const c of cookies) {
    await chrome.cookies.set({
      url,
      domain: '.lectio.dk',
      name: c.name,
      value: c.value,
      path: '/',
      secure: true,
      httpOnly: c.httpOnly,
      sameSite: 'no_restriction'
    });
  }

  const fullUrl = `https://www.lectio.dk/lectio/${schoolId}/${path}`;
  const res = await fetch(fullUrl, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  return { html };
}

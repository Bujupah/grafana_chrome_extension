
document.addEventListener('DOMContentLoaded', () => {
  var get_pdf = document.getElementById('get-pdf');
  get_pdf.addEventListener('click', async () => {
    await getReport()
  }, false);
}, false);

function cookieinfo(tab) {
  chrome.cookies.getAll({ "url": tab.url }, (cookie) => {
    allCookieInfo = [];
    for (i = 0; i < cookie.length; i++) {
      allCookieInfo.push(cookie[i]);
    }
    localStorage.grafanaCookies = JSON.stringify(allCookieInfo);
  });
}
function init() {
  chrome.tabs.query({ "status": "complete", "windowId": chrome.windows.WINDOW_ID_CURRENT, "active": true }, async (tab) => {
    console.log(tab[0]);
    var url_parts = get_uri(tab[0].url)
    console.log(url_parts)
    cookieinfo(tab[0])
    if (url_parts.uid != undefined && url_parts.uid.length == 9 && url_parts.type == 'd' && !url_parts.path.includes('viewPanel')) {
      enable(tab[0])
    } else {
      disable()
    }
  });
}

function enable(tab) {
  document.getElementById('out-grafana').hidden = true
  document.getElementById('in-grafana').hidden = false
  document.getElementById('tenant-logo').src = tab.favIconUrl
}

function disable() {
  document.getElementById('out-grafana').hidden = false
  document.getElementById('in-grafana').hidden = true
}

const get_uri = (url) => {
  var parts = url.split('://')
  var proto = parts[0]
  var link_parts = parts[1].split('/')
  var domain = link_parts[0]
  var type = link_parts[1]
  var uid = link_parts[2]
  var path = link_parts[3]
  return { proto, domain, type, uid, path }
}

async function getReport() {
  chrome.tabs.query({ "status": "complete", "windowId": chrome.windows.WINDOW_ID_CURRENT, "active": true }, async (tab) => {
    toggle(true)
    const response = await fetch('https://g-render-pdf.herokuapp.com/render?dashURL=' + tab[0].url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf',
        'X-GRAFANA-DASH': tab[0].url,
        'X-GRAFANA-COOKIE': localStorage.grafanaCookies
      },
    });
    toggle(false);
    if (response.status != 200) {
      errorMsg(`Error [${response.status}]`);
      return
    }
    var blob = await response.blob()
    var file = new Blob([blob], { type: 'application/pdf' });
    var fileURL = URL.createObjectURL(file);
    window.open(fileURL);

  });
}

function errorMsg(message) {
  // document.getElementById('get-pdf-error').disabled = false
  // document.getElementById('get-pdf-error').innerText = message
}

function toggle(clicked) {
  if (!clicked) {
    // document.getElementById('get-pdf-error').disabled = true
    document.getElementById('get-pdf-label').innerText = 'Get PDF'
    document.getElementById('get-pdf-spinner').classList.add("hidden")
    document.getElementById('get-pdf').disabled = false
    document.getElementById('get-pdf').classList.remove("cursor-not-allowed")
  } else {
    document.getElementById('get-pdf').classList.add("cursor-not-allowed")
    document.getElementById('get-pdf').disabled = true
    document.getElementById('get-pdf-spinner').classList.remove("hidden")
    document.getElementById('get-pdf-label').innerText = 'Processing'
  }
}

window.onload = init;
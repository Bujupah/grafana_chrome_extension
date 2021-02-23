document.addEventListener("DOMContentLoaded", async () => {
  var button = document.querySelector("#send");
  button.addEventListener('click', async () => {
    var username = document.querySelector("#username").value;
    var password = document.querySelector("#password").value;
    if(!username && !password) return;
    button.classList.add('cursor-not-allowed')
    button.classList.add('disabled')
    document.querySelector("#loader").classList.remove('hidden')
    await getInfos(username, password);

  }, false);
}, false);

async function getInfos(username, password) {
  const body = JSON.stringify({username, password});
  const response = await fetch("https://esprit-shadowlands.herokuapp.com/do-it", {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  });
  document.querySelector("#loader").classList.add('hidden')
  document.querySelector("#send").classList.remove('cursor-not-allowed')
  document.querySelector("#send").classList.remove('disabled')
  
  if (response.status != 200) {
    return;
  }
  const data = await response.json()
  
  document.querySelector("#content-name").innerHTML = data.etudiant
  document.querySelector("#content-class").innerHTML = data.classname
  document.querySelector("#content-notes").innerHTML = data.notes
  document.querySelector("#content-abs").innerHTML = data.absences
}
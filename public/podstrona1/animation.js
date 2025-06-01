
  const userId = localStorage.getItem('user_id');

  if (!userId) {
    document.body.innerHTML = "<h2>Musisz być zalogowany, aby zobaczyć tę stronę.</h2>";
    setTimeout(() => window.location.href = '/', 2000);
  } else {
    fetch(`/api/user-info/${userId}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById('name').textContent = data.name || "Nieznany użytkownik";
        document.getElementById('avatar').src = data.avatar || '/images/default-avatar.png';
      })
      .catch(err => {
        console.error("Błąd ładowania danych użytkownika:", err);
      });
  }

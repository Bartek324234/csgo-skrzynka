document.getElementById('kontoBtn').addEventListener('click', function () {
  const userId = localStorage.getItem('user_id');
  if (!userId) {
    alert('Musisz być zalogowany, aby przejść do swojego konta.');
  } else {
    window.location.href = '/uzytkownikkonto/index.html';
  }
});

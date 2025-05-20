document.addEventListener("DOMContentLoaded", () => {
  const kontoBtn = document.getElementById("kontoBtn");
  const losowanieBtn = document.getElementById("losowanieBtn");

  if (kontoBtn) {
    kontoBtn.addEventListener("click", (e) => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        e.preventDefault();
        showToast("Musisz być zalogowany, aby przejść do konta.");
      } else {
        window.location.href = "/uzytkownikkonto/index.html";
      }
    });
  }

  if (losowanieBtn) {
    losowanieBtn.addEventListener("click", (e) => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        e.preventDefault();
        showToast("Musisz być zalogowany, aby przejść do losowania.");
      } else {
        window.location.href = "/podstrona1/index.html";
      }
    });
  }
});

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 3000);
}














 // Gwarantuje, że strona i wszystkie zasoby się załadują
    window.onload = function () {
      const loader = document.getElementById('loader');
      const content = document.getElementById('main-content');

      // Odczekaj 1 sekundę zanim zniknie loader
      setTimeout(() => {
        loader.style.display = 'none';
        content.classList.add('visible');
      }, 1000);
    };
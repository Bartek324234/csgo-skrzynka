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














 document.addEventListener("DOMContentLoaded", function () {
      const loader = document.getElementById('loader');
      const content = document.getElementById('main-content');

      setTimeout(() => {
        if (loader && content) {
          loader.style.display = 'none';
          content.classList.add('visible');
        }
      }, 1000); // 1 sekunda "ładowania"
    });
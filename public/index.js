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













document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const knife = document.getElementById("knife");
  const main = document.getElementById("main-content");

  // Po zakończeniu animacji – powiększ nóż i przejdź dalej
  setTimeout(() => {
    knife.classList.add("zoom");

    // Poczekaj chwilę i przejdź do strony
    setTimeout(() => {
      loader.style.display = "none";
      main.style.display = "block";
    }, 1000);
  }, 3000);
});

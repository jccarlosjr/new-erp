const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar-toggler");
const menuToggler = document.querySelector(".menu-toggler");

if (sidebar && sidebarToggler && menuToggler) {
  let collapsedSidebarHeight = "56px";
  let fullSidebarHeight = "calc(100vh - 32px)";

  sidebarToggler.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  const toggleMenu = (isMenuActive) => {
    sidebar.style.height = isMenuActive
      ? `${sidebar.scrollHeight}px`
      : collapsedSidebarHeight;
    menuToggler.querySelector("span").innerText = isMenuActive ? "close" : "menu";
  };

  menuToggler.addEventListener("click", () => {
    toggleMenu(sidebar.classList.toggle("menu-active"));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      sidebar.style.height = fullSidebarHeight;
    } else {
      sidebar.classList.remove("collapsed");
      sidebar.style.height = "auto";
      toggleMenu(sidebar.classList.contains("menu-active"));
    }
  });
} else {
  console.error("Um ou mais elementos não foram encontrados no DOM.");
}

document.addEventListener("DOMContentLoaded", () => {
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
  
    dropdownToggles.forEach((toggle) => {
      const dropdownMenu = toggle.nextElementSibling;
      const dropdownArrow = toggle.querySelector(".dropdown-arrow");
  
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
  
        const isOpen = dropdownMenu.classList.toggle("show");
  
        dropdownArrow.style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)";
  
        dropdownToggles.forEach((otherToggle) => {
          if (otherToggle !== toggle) {
            const otherMenu = otherToggle.nextElementSibling;
            const otherArrow = otherToggle.querySelector(".dropdown-arrow");
            otherMenu.classList.remove("show");
            otherArrow.style.transform = "rotate(0deg)";
          }
        });
      });
    });
  
    document.addEventListener("click", (e) => {
      dropdownToggles.forEach((toggle) => {
        const dropdownMenu = toggle.nextElementSibling;
        const dropdownArrow = toggle.querySelector(".dropdown-arrow");
  
        if (!toggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
          dropdownMenu.classList.remove("show");
          dropdownArrow.style.transform = "rotate(0deg)";
        }
      });
    });
  });
  
  
  
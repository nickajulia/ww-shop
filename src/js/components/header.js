const menus = document.querySelectorAll('.header__inline-menu .mega-menu');

menus.forEach(item => {
  item.addEventListener("mouseover", () => {
    item.setAttribute("open", true);
    item.querySelector("ul").addEventListener("mouseleave", () => {
      item.removeAttribute("open");
    });
    item.addEventListener("mouseleave", () => {
      item.removeAttribute("open");
    });
  });
});
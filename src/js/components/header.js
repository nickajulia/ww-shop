let items = document.querySelector(".header__inline-menu").querySelectorAll("details");
console.log(items)
items.forEach(item => {
  item.addEventListener("mouseover", () => {
    item.setAttribute("open", true);
    //var getHeightMega = $(item).find(".mega-menu__content").height();
    //console.log(getHeightMega);
    $(item).find(".mega-menu__content").slideDown();

    item.querySelector("ul").addEventListener("mouseleave", () => {
      $(item).find(".mega-menu__content").slideUp( 'fast',function() {
        item.removeAttribute("open");
      });
    });
    item.addEventListener("mouseleave", () => {
      $(item).find(".mega-menu__content").slideUp( 'fast',function() {
        item.removeAttribute("open");
      });
    });
  });
});
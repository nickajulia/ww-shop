import Flickity from "flickity";

const ProductTestimonial = () => {
  let breakpoint = window.matchMedia('(min-width: 990px)');
  if (breakpoint.matches === false) {
    var elem = document.querySelector('.testimonials-outer-wrap');
    new Flickity( elem, {
      // options
      freeScroll: true,
      contain: true,
      pageDots: true,
      prevNextButtons: false
    });
  }
}

export { ProductTestimonial };
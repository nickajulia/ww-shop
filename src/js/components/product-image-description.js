class ProductImageDescription {
  constructor() {
    this.selector = {
      mobileImgSelector: '[image-mobile-selector]',
      desktopImgSelector: '[image-desktop-selector]'
    }

    this.init();
  }
  
  renderDescriptionImage() {
    const imageDesktop = document.querySelector(this.selector.desktopImgSelector);
    const imageDesktopSrc = imageDesktop.getAttribute('src');

    if (window.matchMedia("(max-width: 989px)").matches) {
      const elem = document.createElement("img");
      elem.setAttribute('src', imageDesktopSrc);
      elem.setAttribute('class', 'img-fluid');
      document.querySelector(this.selector.mobileImgSelector).appendChild(elem);

      imageDesktop.remove();
    }
  }

  init() {
    if (document.querySelector(this.selector.desktopImgSelector)) {
      this.renderDescriptionImage();
    }
  }
}

export { ProductImageDescription };
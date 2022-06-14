class Tab {
  constructor() {
    this.classes = {
      tabsLink: '.tabs-link--scroll',
      tabContent: '.tab-content'
    }

    document.querySelectorAll(this.classes.tabsLink).forEach(element => {
      element.addEventListener('click', this.selectTabActive.bind(this));
    });;
  }

  selectTabActive(e) {
    e.preventDefault();
    const scroll = e.target.getAttribute('data-scroll'),
      scroll_to = e.target.getAttribute('data-scroll-element');
    // make tab active  
    this.seTabActive(e.target);
    if (!scroll) {
      this.removeActiveTabContent();
      document.querySelector(`#content-${e.target.id}`).classList.add('active');
    }
  }

  removeActiveTabContent() {
    document.querySelectorAll(this.classes.tabContent).forEach(element => {
      element.classList.remove('active');
    });
  }

  seTabActive(target) {
    document.querySelectorAll(this.classes.tabsLink).forEach(element => {
      element.classList.remove('active');
    });
    target.classList.add('active');
  }
}

new Tab();
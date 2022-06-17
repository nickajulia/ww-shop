const SkioCustom = () => {
  const SETUP_SUBSCRIPTION_TEXT = 'SETUP SUBSCRIPTION';
  const ADD_TO_CART_TEXT = 'ADD TO CART';
  const selectors = {
    skioGroup: '[skio-group-container]',
    onetime: '[skio-one-time]',
    submitButton: 'button[name="add"]'
  }

  const queryElement = (elem) => {
    return document.querySelector(elem);
  }

  document.querySelectorAll(selectors.skioGroup).forEach((elem) => {
    elem.addEventListener('change', (e) => {
      if (e.target.id.indexOf('skio-one-time') > -1) {
        queryElement(selectors.submitButton).querySelector('span').innerText = ADD_TO_CART_TEXT;
      } else {
        queryElement(selectors.submitButton).querySelector('span').innerText = SETUP_SUBSCRIPTION_TEXT;
      }
    })
  })
}

export { SkioCustom };
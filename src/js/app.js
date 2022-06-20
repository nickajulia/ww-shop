import './templates/product';
import { ProductTab } from "./components/product-tab";
import { ProductImageDescription } from "./components/product-image-description";
import './components/header';

if (document.querySelector('.product-tabs')) {
  new ProductTab();
}

if (document.querySelector('[image-desktop-selector]')) {
  new ProductImageDescription();
}
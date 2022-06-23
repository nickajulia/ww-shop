import $ from "jquery";
import { ProductTestimonial } from '../components/product-testimonial';
import { SkioCustom } from '../components/skio-custom';

$(document).ready(function() {

  if(document.querySelector('[section-type="main-product"]')) {
    $(".product-form__submit").click(function() {
      setTimeout(function() {
        $.getJSON('/cart.js', function(data) {
          const freeShippingPrice = window.ProductInfo.free_shipping_price * 100;
          console.log('data.total_price', data.total_price);
          console.log('freeShippingPrice', freeShippingPrice);
          if (data.total_price<freeShippingPrice) {
            console.log('pasok parin');
            var shippingLeft = ((freeShippingPrice - data.total_price)/100)*2;
            var shippingWidth = parseFloat(100 - shippingLeft);
            console.log('shippingWidth:'+shippingWidth);

            $(".shipping-tool-price").show();
            $(".shipping-bar-bg .shipping-tool").css({
              "width" : shippingWidth +"%"
            });
            $(".shipping-tool-price-text-wrap").css({
              "left": "calc(100% - "+ shippingLeft +"% - 43px)"
            });
            $(".shipping-tool-price-text").text((data.total_price)/100);
            $(".left-shipping-price").text(((freeShippingPrice - data.total_price)/100));
          } else {
            $('.shipping-tool').remove();
            $(".shipping-bar-bg").css({
              "background-color" : "#f05423"
            });

            $(".shipping-bar .text").text("You've got free shipping");
            $(".shipping-tool-price-text").text('');
            $(".shipping-tool-price-text-wrap, .shipping-bar-price").css({
                "display" : "none"
            })
          }
        });
      }, 900);
    });
  }
});

$(window).on("load resize", checkPosition);
var shopNowWrapper = $(".product-shop-now-wrapper");

function checkPosition() {
  var newWindowWidth = $(window).width();
  console.log("newWindowWidth:"+newWindowWidth);
  if (newWindowWidth <= 989) {
    $(window).scroll(function() {
      var newWindowWidthAgain = $(window).width();
      if (newWindowWidthAgain <= 989) {
        if ($(window).scrollTop() > 700) {
          $(shopNowWrapper).fadeIn();
        } else {
          $(shopNowWrapper).fadeOut();
        }
      }else{
        $(shopNowWrapper).hide();
      }
    });
  }else{
    $(shopNowWrapper).hide();
  }
}

if (document.querySelector('.skio-plan-picker')) {
  new SkioCustom();
}

if (document.querySelector('.product-testimonials')) {
  new ProductTestimonial();
}
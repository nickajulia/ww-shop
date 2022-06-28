import $ from "jquery";
import { ProductTestimonial } from '../components/product-testimonial';
import { SkioCustom } from '../components/skio-custom';

$(document).ready(function() {

  if(document.querySelector('[section-type="main-product"]')) {
    function fetchCartInfo () {
      setTimeout(function() {
        $.getJSON('/cart.js', function(data) {
          const freeShippingPrice = window.ProductInfo.free_shipping_price * 100;
          if (data.total_price<freeShippingPrice) {
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
            const totalPriceText = (data.total_price)/100;
            $(".shipping-tool-price-text").text(totalPriceText);
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
    }
    $(".product-form__submit").click(function() {
      fetchCartInfo();
    });

    $(document).on('click', '.quick-add__submit', function() {
      fetchCartInfo();
    })
  }
});

$(window).on("load resize", checkPosition);
var shopNowWrapper = $(".product-shop-now-wrapper");

function checkPosition() {
  var newWindowWidth = $(window).width();
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
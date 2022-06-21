import $ from "jquery";
import { ProductTestimonial } from '../components/product-testimonial';
import { SkioCustom } from '../components/skio-custom';

$(document).ready(function() {

  if(document.querySelector('[section-type="main-product"]')) {
    $(".product-form__submit").click(function() {
      setTimeout(function() {
        $.getJSON('/cart.js', function(cart) {
            //console.log(cart);
            console.log("processing...");
        }).done(function( cart ) {
            console.log("done");
            console.log(cart);

            var free_shipping_price = parseFloat(window.ProductInfo.free_shipping_price);
            var total_price = parseFloat(cart.total_price/100 );

            console.log("free_shipping_price");
            console.log(free_shipping_price);

            console.log("total_price");
            console.log(total_price);

            if( parseFloat(total_price) >= parseFloat(free_shipping_price) ){
              console.log(">=");
              $('.shipping-bar-bg').css('background-color', '#f15523');
              $('.shipping-tool').hide();
              $('span.text').html("");
              $('span.text').html("You've got free shipping");
            }else{
              console.log("<");
              $('.shipping-bar-bg').removeAttr("style");
              $('span.text').html("");
              $('span.text').html(`Add <b>$ <span class='left-shipping-price'>${window.ProductInfo.free_shipping_left}</span></b> more to your cart for free shipping!`);
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
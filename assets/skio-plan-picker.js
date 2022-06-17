/**
 * PARAMETERS
 *  - $planPicker: (required) the element to be used as the plan picker
 *  - overrides: (optional) override certain values
 * 
 * OVERRIDES
 *  - getVariantId: function
 * 
 * EVENTS
 *  - skio:plan-picker:loaded - (window) when skio script is loaded
 *  - skio:plan-picker:init - ($planPicker) when skio instance is initialized
 *  - skio:plan-picker:updated - ($planPicker) when skio instance is updated
 */

 (() => {
  if (window.SkioPlanPicker) return Error('Skio: Skio already loaded');

  // Skio Instances
  window.SkioPlanPickerInstances = [];

  window.SkioPlanPicker = ({ $planPicker, overrides = {} } = {}) => {
    try {
      const skio = {};

      // Log level
      skio.logLevel = 'info'; // set to error after setup
      const logLevels = { info: 1, warn: 2, error: 3 };

      function assert(condition, message, { messageType = 'error', exit = false, docsLink }) {
        if (!condition) {
          const formattedMessage = 'Skio' + (skio.key ? `-${skio.key}` : '') + ': ' + message + 
            (docsLink ? `\n\nCheck out ${docsLink}` : ''); 
          if (exit) throw Error(formattedMessage);
          if (!console[messageType]) messageType = 'error';
          if (logLevels[messageType] >= logLevels[skio.logLevel])
            console[messageType](formattedMessage);
          return true;
        }
        return false;
      }

      assert($planPicker, 'No $planPicker provided', { exit: true });
      skio.$planPicker = $planPicker;
  
      // KEY
      skio.key = $planPicker.getAttribute('skio-plan-picker');
      const keyCount = document.querySelectorAll(`[skio-plan-picker="${skio.key}"]`).length;
      assert(
        keyCount === 1,
        `Key needs to be unique, key: '${skio.key}' used ${keyCount} times`,
        { exit: true }
      );

      // MAIN PRODUCT
      skio.mainProduct = $planPicker.hasAttribute('skio-main-product');

      // DISCOUNT FORMAT	
      skio.discountFormat = $planPicker.getAttribute('skio-discount-format');	
      assert(	
        skio.discountFormat === 'percent' || skio.discountFormat === 'absolute', 	
        'Invalid discount format', 	
        { exit: true }	
      );

      // SELECTORS
      skio.selectors = {
        sellingPlanId: 'input[name="selling_plan"]',
        variantId: '[name="id"]',
        productJson: '[skio-product-json]',
        onetime: '[skio-one-time]',
        groupContainer: '[skio-group-container]',
        sellingPlanGroup: (id) => `[skio-selling-plan-group${id ? `="${id}"` : ''}]`,
        groupInput: `input[name="skio-group-${skio.key}"]`,
        sellingPlans: (id) => `[skio-selling-plans${id ? `="${id}"` : ''}]`,
        onetimePrice: '[skio-onetime-price]',
        subscriptionPrice: '[skio-subscription-price]',
        discount: '[skio-discount]',
        discountProperty: '[name="properties[Discount]"]',
      };
  
      // FORM
      const $$sellingPlan = $planPicker.querySelectorAll(skio.selectors.sellingPlanId);
      assert($$sellingPlan.length !== 0, 'No selling plan input element found', { exit: true });
      assert($$sellingPlan.length === 1, 'More than 1 selling plan input element found', 
        { messageType: 'warn' });
      const $sellingPlan = $$sellingPlan[0];
      skio.formAttr = $sellingPlan.getAttribute('form');
  
      if (skio.formAttr) skio.form = document.getElementById(skio.formAttr);
      if (!skio.form) skio.form = $planPicker.closest('form[action*="/cart/add"]');
      assert(
        skio.form, 'Couldn\'t find form, either connect to a form or submit using javascript', 
        { messageType: 'warn' }
      );
  
      // PRODUCT
      if (overrides.product) skio.product = overrides.product;
      else {
        const $$productJson = $planPicker.querySelectorAll(skio.selectors.productJson);
        assert($$productJson.length > 0, 'No product json element found', { exit: true });
        assert($$productJson.length === 1, 'Multiple product json elements found', 
          { messageType: 'warn' });
        skio.product = JSON.parse($$productJson[0].innerHTML);
      }
      assert(skio.product, 'Product is required', { exit: true });
  

      // VARIANT ID
      const validateVariantId = (variantId) => {
        try {
          const type = typeof variantId;
          const isNumber = type === 'number';
          assert(isNumber, `Variant id needs to be a number, got '${type}'`, { exit: true });
          const index = skio.product.variants.findIndex(variant => variant.id == variantId);
          const found = index !== -1;
          assert(found, `Variant with id '${variantId}' not found`, { exit: true });
          return true;
        } catch (err) {
          console.error(err);
          return false;
        }
      }
  
      const getVariantId = () => {
        try {
          // Override
          if (typeof overrides.getVariantId === 'function') {
            const variantId = overrides.getVariantId();
            assert(validateVariantId(variantId), `Invalid variant id '${variantId}'`, 
              { exit: true });
            skio.variantId = variantId;
            return variantId;
          }
          // Default
          if (skio.form) {
            const $variantId = skio.form.querySelector(skio.selectors.variantId);
            assert(
              $variantId, 
              `Can't find variant id element using selector '${skio.selectors.variantId}'`, 
              { exit: true }
            );
            const variantId = parseInt($variantId.value);
            assert(validateVariantId(variantId), `Invalid variant id '${variantId}'`, 
              { messageType: 'warn', exit: true });
            skio.variantId = variantId;
            return variantId;
          }
          assert(false, 'Failed to get variant id. No form and no getVariantId() override provided',
            { exit: true });
        } catch (err) {
          console.error(err);
          skio.variantId = null;
          return null;
        }
      }

      const getVariant = () => {
        const variantId = getVariantId();
        if (variantId === null) return null;
        const variant = skio.product.variants.find(variant => variant.id === variantId);
        skio.variant = variant;
        return variant;
      }

      // SELLING PLAN GROUPS
      const getAvailableSellingPlanGroupIds = () => {
        const variant = getVariant();
        const availableSellingPlanGroupIdsSet = new Set();
        variant.selling_plan_allocations.forEach(selling_plan_allocation => {
          const selling_plan_group_id = selling_plan_allocation.selling_plan_group_id;
          const selling_plan_group = skio.product.selling_plan_groups.find(
            selling_plan_group => selling_plan_group.id === selling_plan_group_id);
          if (selling_plan_group.name === 'Subscription' || selling_plan_group.name === 'Prepaid')
            availableSellingPlanGroupIdsSet.add(selling_plan_allocation.selling_plan_group_id);
        });
        const availableSellingPlanGroupIds = Array.from(availableSellingPlanGroupIdsSet);
        skio.availableSellingPlanGroupIds = availableSellingPlanGroupIds;
        return availableSellingPlanGroupIds;
      }
  
      skio.updateSellingPlanGroupAvailability = () => {
        try {
          const availableSellingPlanGroupIds = getAvailableSellingPlanGroupIds();
          assert(
            availableSellingPlanGroupIds !== null,
            'Issue getting available selling plan group ids',
            { exit: true }
          );
          const $$sellingPlanGroup = $planPicker.querySelectorAll(skio.selectors.sellingPlanGroup());
          let checkedNoLongerAvailable = false;
          $$sellingPlanGroup.forEach($sellingPlanGroup => {
            const sellingPlanGroupId = $sellingPlanGroup.getAttribute('skio-selling-plan-group');
            const isAvailable = availableSellingPlanGroupIds.includes(sellingPlanGroupId);
            $sellingPlanGroup.disabled = !isAvailable;
            const $groupContainer = $sellingPlanGroup.closest(skio.selectors.groupContainer);
            if (isAvailable) $groupContainer.classList.add('skio-group-container--available');
            else $groupContainer.classList.remove('skio-group-container--available');

            if ($sellingPlanGroup.checked && !isAvailable) {
              checkedNoLongerAvailable = true;
              $sellingPlanGroup.checked = false;
            }
          });

          if (checkedNoLongerAvailable) {
            const $onetime = $planPicker.querySelector(skio.selectors.onetime);
            if ($onetime && availableSellingPlanGroupIds.length === 0) 
              $onetime.checked = true;
            else {
              const $firstAvailableSellingPlanGroup = 
                $planPicker.querySelector(`${skio.selectors.sellingPlanGroup()}:not(:disabled)`);
              if ($firstAvailableSellingPlanGroup) $firstAvailableSellingPlanGroup.checked = true;
            }
          }

          skio.updateSellingPlan();
        } catch (err) {
          console.error(err);
        }
      }

      const getSelectedSellingPlanGroupId = () => {
        try {
          $planPicker.querySelectorAll(skio.selectors.groupInput).forEach(el => 
            el.closest(skio.selectors.groupContainer).classList
            .remove('skio-group-container--selected'));
          const $onetime = $planPicker.querySelector(skio.selectors.onetime);
          if ($onetime?.checked) {
            $onetime.closest(skio.selectors.groupContainer).classList
              .add('skio-group-container--selected');
            skio.selectedSellingPlanGroupId = null;
            return null;
          }
          const $selectedSellingPlanGroup = $planPicker.querySelector(
            `${skio.selectors.sellingPlanGroup()}:checked`);
          if (
            assert($selectedSellingPlanGroup, 'No selected selling plan group', { messageType: 'warn' })
          ) return null;
          $selectedSellingPlanGroup.closest(skio.selectors.groupContainer).classList
            .add('skio-group-container--selected');
          const selectedSellingPlanGroupId =
            $selectedSellingPlanGroup.getAttribute('skio-selling-plan-group');
          assert(selectedSellingPlanGroupId, 'No selected selling plan group id', { exit: true });
          skio.selectedSellingPlanGroupId = selectedSellingPlanGroupId;
          return selectedSellingPlanGroupId;
        } catch (err) {
          console.error(err);
          skio.selectedSellingPlanGroupId = null;
          return null;
        }
      }

      // SELLING PLAN
      const validateSellingPlanId = (sellingPlanId) => {
        try {
          const type = typeof sellingPlanId;
          const isNumber = type === 'number'
          assert(isNumber, `Selling plan id needs to be a number, got '${type}'`, { exit: true });
          const variant = getVariant();
          const index = variant.selling_plan_allocations.findIndex(selling_plan_allocation => 
            selling_plan_allocation.selling_plan_id === sellingPlanId);
          const found = index !== -1;
          assert(found, `Selling plan with id ${sellingPlanId} not found`, { exit: true });
          return true;
        } catch (err) {
          console.error(err);
          return false;
        }
      };

      const updateUrlParam = (sellingPlanId) => {
        if (sellingPlanId !== '' && !validateSellingPlanId(sellingPlanId)) sellingPlanId = '';
        const url = new URL(window.location.href);
        if (sellingPlanId === "") url.searchParams.delete('selling_plan');
        else url.searchParams.set("selling_plan", sellingPlanId);
        window.history.replaceState({}, '', url.href);
      }

      skio.updateSellingPlan = () => {
        try {
          const $sellingPlan = $planPicker.querySelector(skio.selectors.sellingPlanId);
          assert($sellingPlan, 'Couldn\'t find selling plan element', { exit: true });
          
          const sellingPlanGroupId = getSelectedSellingPlanGroupId();
          
          let sellingPlanId;
          let sellingPlanName;
          if (!sellingPlanGroupId) sellingPlanId = '', sellingPlanName = '';
          else {
            const $sellingPlans = $planPicker.querySelector(
              skio.selectors.sellingPlans(sellingPlanGroupId));
            assert($sellingPlans, 'Couldn\'t find selling plans element', { exit: true });
            sellingPlanId = parseInt($sellingPlans.value);
            sellingPlanName = $sellingPlans.options[$sellingPlans.selectedIndex].text
            assert(validateSellingPlanId(sellingPlanId), 'Invalid selling plan id', { exit: true });

            if ($planPicker.querySelectorAll(skio.selectors.sellingPlans()).length > 1) {
              $planPicker.querySelectorAll(skio.selectors.sellingPlans()).forEach((selector) => {
                let option = Array.from(selector.options).find(option => option.text == sellingPlanName);
                if (option) selector.value = option.value
              });
            }
            
          }
  
          skio.sellingPlanId = sellingPlanId;
          $sellingPlan.value = sellingPlanId;
          if (skio.mainProduct) updateUrlParam(sellingPlanId);
          updateDiscounts();
          updatePrices();
          $planPicker.dispatchEvent(new CustomEvent('skio:plan-picker:update', { detail: { skio } }));
        } catch (err) {
          console.error(err);
        }
      }

      // MONEY
      skio.moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: window?.Shopify?.currency?.active || 'USD',
      });

      /**
       * Needs to run after updateSellingPlan()
       * The logic here should match the discount logic in skio-plan-picker.liquid
       */
      const updateDiscounts = () => {
        skio.availableSellingPlanGroupIds.forEach(availableSellingPlanGroupId => {	
          const $sellingPlanGroup = $planPicker.querySelector(	
            `${skio.selectors.sellingPlanGroup(availableSellingPlanGroupId)}`	
          );	
          if (assert($sellingPlanGroup, 
            `No selling group element found with id "${availableSellingPlanGroupId}"`, 	
            { messageType: 'info' })) return;	
          const $sellingPlans = $sellingPlanGroup.closest(skio.selectors.groupContainer)
            .querySelector(skio.selectors.sellingPlans());	
          if (assert($sellingPlans, 'No selling plans element found', 	
            { messageType: 'info' })) return;	
          const $$discount = $sellingPlanGroup	
            .parentElement.querySelectorAll(skio.selectors.discount);	
          if ($$discount.length === 0) return;
          const selling_plan_group = skio.product.selling_plan_groups	
            .find(selling_plan_group => selling_plan_group.id === availableSellingPlanGroupId);	
          const selling_plan = selling_plan_group.selling_plans	
            .find(selling_plan => selling_plan.id === parseInt($sellingPlans.value));	
          const price_adjustment = selling_plan.price_adjustments[0];	
  	
          let current_discount_percent = 0;	
          let current_discount_absolute = 0;	
          switch (price_adjustment.value_type) {	
            case 'percentage':	
              current_discount_percent = price_adjustment.value;	
              current_discount_absolute = Math.round(skio.variant.price * price_adjustment.value / 100.0);	
              break;	
            case 'fixed_amount':	
              current_discount_percent = Math.round(price_adjustment.value * 1.0 / skio.variant.price * 100.0);	
              current_discount_absolute = price_adjustment.value;	
              break;	
            case 'price':	
              current_discount_percent = Math.round((skio.variant.price - price_adjustment.value) * 1.0 / skio.variant.price * 100.0);	
              current_discount_absolute = skio.variant.price - price_adjustment.value;	
              break;	
          }	
          let current_discount_text;	
          if (current_discount_percent == 0) current_discount_text = '';	
          else if (skio.discountFormat === 'percent')	
            current_discount_text = `${current_discount_percent}%`;	
          else current_discount_text = skio.moneyFormatter.format(current_discount_absolute / 100);	
  	
          $$discount.forEach(el => el.innerHTML = current_discount_text);	
        });

        const $discountProperty = $planPicker.querySelector(skio.selectors.discountProperty);	
        if ($discountProperty) {	
          const $onetime = $planPicker.querySelector(skio.selectors.onetime);
          const $selectedSellingPlanGroup = $planPicker	
            .querySelector(skio.selectors.sellingPlanGroup(skio.selectedSellingPlanGroupId));
          const $$discount = $selectedSellingPlanGroup
            .parentElement.querySelectorAll(skio.selectors.discount);	
          if ($onetime?.checked || $$discount.length === 0) {	
            $discountProperty.disabled = true;	
            $discountProperty.value = '';	
          } else {	
            $discountProperty.disabled = false;
            const $discount = $selectedSellingPlanGroup.parentElement.querySelector(
                skio.selectors.discount);
            if ($discount) $discountProperty.value = $discount.innerHTML;
          }	
        }
      }

      const updatePrices = () => {
        // Selling Plans	
        skio.availableSellingPlanGroupIds.forEach(availableSellingPlanGroupId => {	
          const $sellingPlanGroup = $planPicker.querySelector(	
            `${skio.selectors.sellingPlanGroup(availableSellingPlanGroupId)}`	
          );	
          if (assert($sellingPlanGroup, 
            `No selling group element found with id "${availableSellingPlanGroupId}"`, 	
            { messageType: 'info' })) return;	
          const $sellingPlans = $sellingPlanGroup.closest(skio.selectors.groupContainer)
            .querySelector(skio.selectors.sellingPlans());	
          if (assert($sellingPlans, 'No selling plans element found', 	
            { messageType: 'info' })) return;	
          const sellingPlan = skio.product.selling_plan_groups	
            .find(selling_plan_group => selling_plan_group.id === availableSellingPlanGroupId)	
            .selling_plans	
            .find(selling_plan => selling_plan.id === parseInt($sellingPlans.value));	
          const $subscriptionPrice = $sellingPlanGroup.parentElement
            .querySelector(skio.selectors.subscriptionPrice);	
          if (assert($subscriptionPrice, 'No price element found', 	
            { messageType: 'info' })) return;	
          const sellingPlanAllocation = skio.variant.selling_plan_allocations.find(
            selling_plan_allocation => selling_plan_allocation.selling_plan_id === sellingPlan.id)
          const price = sellingPlanAllocation.price / 100;
          $subscriptionPrice.innerHTML = skio.moneyFormatter.format(price);
        })	
        // One-time	
        const $onetimePrice = $planPicker.querySelector(skio.selectors.onetimePrice);
        if ($onetimePrice) {
          const onetimePrice = skio.variant.price / 100;	
          const onetimePriceFormatted = skio.moneyFormatter.format(onetimePrice);	
          $onetimePrice.innerHTML = onetimePriceFormatted;
        }
      }

      skio.update = () => skio.updateSellingPlanGroupAvailability();
      skio.update();

      // LISTENERS
      $planPicker
        .querySelectorAll(skio.selectors.groupInput)
        .forEach(el => el.addEventListener('change', skio.updateSellingPlanGroupAvailability));
      
      $planPicker
        .querySelectorAll(skio.selectors.sellingPlans())
        .forEach((el) => {
          const handler = (e) => {
            const $sellingPlanGroup = e.currentTarget
              .closest(skio.selectors.groupContainer)
              .querySelector(skio.selectors.groupInput);
            if ($sellingPlanGroup.checked) skio.updateSellingPlan();
            else {
              $sellingPlanGroup.checked = true;
              skio.updateSellingPlan();
            }
          }
          el.addEventListener('change', handler);
          el.addEventListener('focus', handler);
        });
      
      skio.form
        .querySelector(skio.selectors.variantId)
        .addEventListener('change', skio.update);
        
        // .querySelectorAll(skio.selectors.variantId)
        // .forEach(el => el.addEventListener('DOMSubtreeModified', skio.update));

        // .querySelector('INPUT CONTAINER SELECTOR')
        // .addEventListener('click', () => setTimeout(skio.update, 0));

      // Create MutationObserver instance to watch for change of selected option value inside select element for variant IDs
      // skio.variantObserver = 
      //   new MutationObserver(function(mutationsList, observer) {
      //     for(const mutation of mutationsList) {
      //       if (mutation.type === 'attributes') skio.update();
      //     }
      //   }).observe(skio.form.querySelector(skio.selectors.variantId), { attributeFilter: ['selected'], subtree: true });
  
      // Fire init event
      $planPicker.dispatchEvent(new CustomEvent('skio:plan-picker:init', { detail: { skio } }));
      // Add to instances
      window.SkioPlanPickerInstances.push(skio);
      // Attach to $planPicker
      $planPicker.skio = skio;

      return skio;
    } catch (err) {
      console.error(err);
    }
  };

  // Auto init
  window.SkioPlanPickerAutoInit = () => {
    const $$autoInitPlanPicker = document.querySelectorAll(
      '[skio-plan-picker][skio-auto-init]'
    );
    $$autoInitPlanPicker.forEach($autoInitPlanPicker => {
      window.SkioPlanPicker({ $planPicker: $autoInitPlanPicker });
    });
  }
  window.SkioPlanPickerAutoInit();

  window.dispatchEvent(new CustomEvent('skio:plan-picker:loaded'));
})()

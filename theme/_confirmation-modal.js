// Custom file


// 1. Get customerHash and allSubs
var customerHash;
var allSubs = [];
var url_que = [];
var feeProducts = [];
var addresses = [];

var proccessing = 'Processing ...'
var redirectionSimple = '<p>Redirecting...</p>'
var redirectingWithMessage = '<p>Redirecting...</p> <p class="message-disclaimer" >Note that this change overrides any previously skipped shipments. If needed, please re-skip shipments on the "upcoming subscription shipments" menu.</p>';

// debug
window.RechargeDebug = true

var debug = function (obj, el) {
  if (RechargeDebug) {
    if (el) {
      console.log(obj, ' ', el);
    } else {
      console.log(obj);
    }
  }
}


// Get data
function getAllSubs() {
  $.ajax({
    url: "/tools/recurring/portal/" + customerHash + "/request_objects",
    type: 'get',
    dataType: 'json',
    data: {
      schema: '{ "subscriptions": { "products": {} } }'
    }
  }).done(function (response) {
    allSubs = response.subscriptions;
  }).fail(function (response) {
    console.log(response);
  });
}

function getAllProductFees() {
  $.ajax({
    url: '/tools/recurring/portal/{{ customer.hash }}/request_objects',
    type: 'get',
    dataType: 'json',
    data: {
      schema: '{ "customer": {}, "products": { "title": "Bottle Deposit","base_source": "store_settings"}, "products_count": { "base_source": "store_settings" } }'
    }
  }).done(function (response) {
    // Successful request made
    feeProducts = response.products;
    console.log(response);
  }).fail(function (response) {
    // Request failed
    console.log(response);
  });
}

function getAddresses() {}

$(document).ready(function () {
  customerHash = window.recharge.customer;
  getAllSubs();
  feeProducts = window['feeProducts'].length ? window.feeProducts : getAllProductFees();
  addresses = window['addresses'].length ? window.addresses : getAddresses();
  setTimeout(function () {
    $('#product_search').attr('name', 'q')
  }, 3000)
});

// Helper functions
function moveAlong(redirectURL, callback, message) {
  if (typeof callback === 'function') {
    if (url_que.length) {
      var request = url_que.shift();
      callback(request);
    } else {
      $('.modal-cta').hide();
      if (!message) {
        message = redirectionSimple;
      }
      $('.modal-body').html(message);
      $('.modal-title').text('Updated successfully!');
      if (!redirectURL) {
        location.reload()
      } else {
        location.href = redirectURL;
      }
    }
  }
}

function getParams(param) {
  var name = (param).replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  var query = results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  return query
};

function getProductFees(subscription) {
  let feeID = subscription.properties.filter(prop => prop.name == 'fee_id').map(prop => prop.value)[0]
}

function getCaseQty(subscription) {
  // Get case qty by grabing tags 
  let fizz_fee,
    water_fee;
  let caseQty = 12;
  let subTitle = subscription.product.title;
  let feeID = subscription.properties.filter(prop => prop.name == 'fee_id').map(prop => prop.value)[0]
  let feeSubs = allSubs.filter((sub) => {
    if (!sub.product_title.includes('Bottle Deposit')) {
      for (let i = 0; i < sub.properties.length; i++) {
        if (sub.properties[i].value == feeID) {
          return sub
        }
      }
    }
  })

  if (feeSubs.length) {
    let tags = feeSubs[0].product.shopify_details.tags
    console.log(tags)
    if (tags.includes(',')) {
      tags = tags.split(', ')
      tags.forEach((e) => {
        if (e.includes('feeqty-water:')) {
          console.log('tag-', water_fee)
          water_fee = e.substring('feeqty-water:'.length) * 1;
        }
        if (e.includes('feeqty-fizz:')) {
          console.log('tag-', fizz_fee)
          fizz_fee = e.substring('feeqty-fizz:'.length) * 1;
        }
      })
    } else {
      if (tags.includes('feeqty-water:')) {
        water_fee = e.substring('feeqty-water:'.length) * 1;
      }
      if (tags.includes('feeqty-fizz:')) {
        fizz_fee = e.substring('feeqty-fizz:'.length) * 1;
      }
    }
  }

  if (subTitle == 'Bottle Deposit - Water' && water_fee) {
    console.log('qty-water ', water_fee)
    caseQty = water_fee
  }

  if (subTitle == 'Bottle Deposit - Carbonated' && fizz_fee) {
    console.log('qty-fezz ', fizz_fee)
    caseQty = fizz_fee
  }
  console.log(subTitle, caseQty)
  return caseQty
}

function formatDate(el) {
  var parts = el.split('-');
  var dateToFromate = new Date(parts[0], parts[1] - 1, parts[2]);
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var day = dateToFromate.getDate();
  var monthIndex = dateToFromate.getMonth();
  var year = dateToFromate.getFullYear();
  return monthNames[monthIndex] + ' ' + day + ',' + year;
}

// 2. Create Ajax Call Functions

//2.a Update qty - 
function updateProductQuantity(item) {
  let timesBy = item.type == 'fee' ? getCaseQty(item.subscription) : 1;
  $('.modal-cta').html(proccessing);
  $('.modal-cta').attr('disabled', true);
  $.ajax({
    url: item.url,
    type: 'post',
    dataType: 'json',
    data: {
      "quantity": item.value * timesBy
    }
  }).done(function () {
    //  $('.modal-cta').hide();
    //  $('.modal-body').text('Redirecting. . . ');
    //  $('.modal-title').text('Quantity updated successfully!'); 
    moveAlong(null, updateProductQuantity, redirectingWithMessage);
  }).fail(function (response) {
    window.console.log(response);
    $('.modal-title').text("We've encountered an error.");
    $('.modal-body').text('Please contact support or try again later.');
    $('.modal-cta').hide();
  });
}

//2.b Update frequency
function updateProductFrequency(item) {
  console.log(item)
  $('.modal-cta').html(proccessing);
  $('.modal-cta').attr('disabled', true);
  $.ajax({
    url: item.url,
    type: 'post',
    dataType: 'json',
    data: {
      charge_interval_frequency: item.value,
      charge_interval_unit: "day",
      order_interval_frequency: item.value,
      order_interval_unit: "day",
    }
  }).done(function () {
    // $('.modal-cta').hide();
    // $('.modal-body').text('Redirecting. . . ');
    // $('.modal-title').text('Frequency updated successfully!');
    console.log('changed')
    moveAlong(null, updateProductFrequency, redirectingWithMessage)
  }).fail(function (response) {
    window.console.log(response);
    $('.modal-title').text("We've encountered an error.");
    $('.modal-body').text('Please contact support or try again later.');
    $('.modal-cta').hide();
  });
}

//2.c Update Charge date
function updateProductChargeDate(item) {
  console.log(item)
  $('.modal-cta').html(proccessing);
  $('.modal-cta').attr('disabled', true);
  $.ajax({
    url: item.url,
    type: 'post',
    dataType: 'json',
    data: {
       date: item.value
    }
  }).done(function () {
    // $('.modal-cta').hide();
    // $('.modal-body').text('Redirecting. . . ');
    // $('.modal-title').text('Next shipment updated successfully!');
    console.log('changed')
    moveAlong(null, updateProductChargeDate, redirectingWithMessage)
  }).fail(function (response) {
    window.console.log(response);
    $('.modal-title').text("We've encountered an error.");
    $('.modal-body').text('Please contact support or try again later.');
    $('.modal-cta').hide();
  });
}

// 2.d Skip
var skipQue = []

function moveAlongSkip(redirectURL, callback, message) {
  if (typeof callback === 'function') {
    if (skipQue.length) {
      var request = skipQue.shift();
      callback(request);
    } else {
      if (!message) {
        message = redirectionSimple;
      }
      $('.modal-cta').hide();
      $('.modal-body').text(message);
      $('.modal-title').text('Updated successfully!');
      if (!redirectURL) {
        location.reload()
      } else {
        location.href = '/tools/recurring/portal/' + customerHash + '/subscriptions';
      }
    }
  }
}

function getSkipQue(options) {
  skipQue = window.schedule[options.id].orders.map(e => {
    return {
      url: urlCase(options.input, e.subscription),
      date: options.key,
      type: options.input,
      charge: e.charge
    }
  })
  moveAlongSkip(null, skipAndUnskip, redirectionSimple)
}

function skipAndUnskip(item) {
  $('.modal-cta').html(proccessing);
  $('.modal-cta').attr('disabled', true);
  var settings = {
    url: item.url,
    type: 'post',
    dataType: 'json'
  }

  if (item.options.input === 'unskip') {
    console.log(item.options.charge);
    settings.data = {
      charge_id: item.options.charge
    }
  }

  if (item.options.input === 'skip') {
    // if item.options.date is out of sync
    settings.data = {
      charge_id: item.options.charge,
      date: item.options.date
    }
  }

  console.log(item);

  $.ajax(settings).done(function (response) {
    console.log(response);
    setTimeout(moveAlong(null, skipAndUnskip, redirectionSimple), 3000);
  }).fail(function (response) {
    console.log(response);
  });
}

// 2.f Cancel
function cancelProductSubscription(item) {

  $('.modal-cta').html(proccessing);
  $('.modal-cta').attr('disabled', true);
  $.ajax({
    url: item.url,
    type: 'post',
    dataType: 'json',
    data: {
      "cancellation_reason": item.value
    },
  }).done(function (response) {
    // Successful request made 
    // $('.modal-cta').hide();
    // $('.modal-body').text('Redirecting. . . ');
    // $('.modal-title').text('Subscription successfully unskipped!');
    console.log('changed')
    moveAlong('{{ subscription_list_url }}', cancelProductSubscription)
  }).fail(function (response) {
    // Request failed
    console.log(response);
  });
}

// 2.f Activate
function activateSubscription(item) {

  $('.modal-cta').html(proccessing);
  $('.modal-cta').attr('disabled', true);
  $.ajax({
    url: item.url,
    type: 'post',
    dataType: 'json',
    data: {
      "cancellation_reason": item.value
    },
  }).done(function (response) {
    // Successful request made 
    // $('.modal-cta').hide();
    // $('.modal-body').text('Redirecting. . . ');
    // $('.modal-title').text('Subscription successfully unskipped!');
    console.log('changed')
    moveAlong('{{subscription_list_url}}', activateSubscription, redirectionSimple)
  }).fail(function (response) {
    // Request failed
    console.log(response);
  });
}

// 2.g Change address
function updateAddress(item) {
  $('.modal-cta').html(proccessing);
  $('.modal-cta').attr('disabled', true);
  $.ajax({
    url: item.url,
    type: 'post',
    dataType: 'json',
    data: {
      "cancellation_reason": item.value
    },
  }).done(function (response) {
    // Successful request made 
    // $('.modal-cta').hide();
    // $('.modal-body').text('Redirecting. . . ');
    // $('.modal-title').text('Subscription successfully unskipped!');
    console.log('changed')
    moveAlong('{{subscription_list_url}}', cancelProductSubscription)
  }).fail(function (response) {
    // Request failed
    console.log(response);
  });
}

// 2.h Swap
function swap(item) {
  $('.modal-cta').html(proccessing);
  $('.modal-cta').attr('disabled', true);
  $.ajax({
    url: '/tools/recurring/portal/' + customerHash + '/subscriptions/' + item.id,
    type: 'post',
    dataType: 'json',
    data: {
      "shopify_variant_id": item.variantID
    },
  }).done(function (response) {
    $('.modal-cta').hide();
    $('.modal-body').text(redirectionSimple);
    $('.modal-title').text('Subscription successfully swapped!');
    location.href = '/tools/recurring/portal/' + customerHash + '/subscriptions';
  }).fail(function (response) {
    // Request failed
    console.log(response);
  });
}

// 2.g Update Subscription address 
function updateSubscriptionAddress(item) {
  console.log(item)
  if (item.type == 'fee') {
    //redirect
    return;
  }

  $('.modal-cta').html(proccessing);
  $('.modal-cta').attr('disabled', true);

  var nextChargeDate = item.subscription.next_charge_scheduled_at;

  $.ajax({
    url: item.url,
    type: 'post',
    dataType: 'json',
    data: {
      "address_id": item.options.address_id
    },
  }).done(function (response) {
    $.ajax({
      url: item.url + '/set_next_charge_date',
      type: 'post',
      dataType: 'json',
      data: {
        "date": nextChargeDate
      }
    }).done(function () {
      moveAlong(null, updateSubscriptionAddress, redirectingWithMessage);
    }).fail(function () {
      moveAlong(null, updateSubscriptionAddress, redirectingWithMessage);
    });
  }).fail(function (response) {
    // Request failed
    console.log(response);
  });
}

// 2.g Add a new product
var newProductQue = []

function moveAlongProduct(redirectURL, callback) {
  if (typeof callback === 'function') {
    if (newProductQue.length) {
      var request = newProductQue.shift();
      callback(request);
    } else {
      $('.modal-cta').hide();
      $('.modal-body').text('Redirecting. . . ');
      $('.modal-title').text('Updated successfully!');
      if (!redirectURL) {
        //  location.reload()
      } else {
        //   location.href = '/tools/recurring/portal/'+customerHash+'/subscriptions';
      }
    }
  }
}

function getnewProductQue(options) {
  console.log(options)
  let fee_id = new Date().getTime();

  let productMain = {
    address_id: options.address_id,
    charge_interval_frequency: options.charge_interval_frequency,
    next_charge_scheduled_at: options.next_charge_date,
    order_interval_frequency: options.order_interval_frequency,
    order_interval_unit: options.order_interval_unit,
    purchase_type: options.purchase_type,
    quantity: options.quantity,
    shopify_variant_id: options.shopify_variant_id,
    properties: [{
      name: 'fee_id',
      value: fee_id
    }]
  }

  newProductQue.push(productMain)

  //get address
  var province = addresses.filter(e => e.id == options.address_id).map(e => e.province)[0]

  //determine if province has fees - returns the subscription product
  var provinceFees = feeProducts.map((e) => {
    let variants = e.shopify_details.variants;
    for (let i = 0; i < variants.length; i++) {
      if (variants[i].title == province) {
        return {
          type: e.title,
          variantID: variants[i].shopify_id
        }
      }
    }
  })
  console.log(provinceFees)
  // create fee if need be and push to array
  let productFeeArr = options.tags.split(',')
  if (productFeeArr.length && provinceFees.length) {
    let productFee = {
      address_id: options.address_id,
      charge_interval_frequency: options.charge_interval_frequency,
      next_charge_scheduled_at: options.next_charge_date,
      order_interval_frequency: options.order_interval_frequency,
      order_interval_unit: options.order_interval_unit,
      purchase_type: options.purchase_type,
      properties: [{
        "name": 'fee_id',
        "value": fee_id
      }]
    }
    productFeeArr.forEach((e) => {
      let feeType;
      let feeQty;
      if (e.includes('feeqty-water:')) {
        productFee.shopify_variant_id = provinceFees.filter(e => e.type == 'Bottle Deposit - Water').map(e => e.variantID)[0]
        productFee.quantity = e.substring('feeqty-water:'.length) * options.quantity;
        newProductQue.push(productFee)
      }
      if (e.includes('feeqty-fizz:')) {
        productFee.shopify_variant_id = provinceFees.filter(e => e.type == 'Bottle Deposit - Carbonated').map(e => e.variantID)[0]
        productFee.quantity = e.substring('feeqty-fizz:'.length) * options.quantity;
        newProductQue.push(productFee);
      }

    })
  }


  moveAlongProduct(true, newProduct)
}

function newProduct(item) {
  $.ajax({
    url: "/tools/recurring/portal/" + customerHash + "/subscriptions/",
    type: 'post',
    dataType: 'json',
    data: item
  }).done(function (response) {
    // Successful request made
    window.console.log(response);
    moveAlongProduct('{{subscription_list_url}}', newProduct, redirectionSimple)
  }).fail(function (response) {
    // Request failed
    window.console.log(response);
  });
}
 
function urlCase(input, sub) {
  switch (input) {
    case 'next-shipment':
      url = "/tools/recurring/portal/" + customerHash + "/subscriptions/" + sub.id + "/set_next_charge_date";
      break;
    case 'skip':
      url = "/tools/recurring/portal/" + customerHash + "/subscriptions/" + sub.id + "/skip";
      break;
    case 'unskip':
      url = "/tools/recurring/portal/" + customerHash + "/subscriptions/" + sub.id + "/unskip";
      break;
    case 'cancel':
      url = "/tools/recurring/portal/" + customerHash + "/subscriptions/" + sub.id + "/cancel";
      break;
    case 'cancel_onetime':
      url = "/tools/recurring/portal/" + customerHash + "/onetimes/" + sub.id + "/cancel"
      break;
    case 'add_onetime':
      url = "/tools/recurring/portal/" + customerHash + "/onetimes"
      break;
    case 'activate':
      url = "/tools/recurring/portal/" + customerHash + "/subscriptions/" + sub.id + "/activate";
      break;
    case 'address_change':
      url = "/tools/recurring/portal/" + customerHash + "/subscriptions/" + sub.id;
      break;
    case 'swap':
      url = "/tools/recurring/portal/" + customerHash + "/subscriptions/" + sub.id + "/swap"
      break;
    default:
      url = "/tools/recurring/portal/" + customerHash + "/subscriptions/" + sub.id;
  }

  return url
}

function getFeeUrls(options) {
  // make sure schedule object exists,
  let schedule = window.schedule;
  let feeArray = [];
  let feeSubs = allSubs.filter((sub) => {
    if (sub.product_title.includes('Bottle Deposit')) {
      for (let i = 0; i < sub.properties.length; i++) {
        if (sub.properties[i].name == "fee_id" && sub.properties[i].value == options.feeId) {

          if (schedule) {
            schedule.filter((shipment) => {
              let date = shipment.date;
              let orders = shipment.orders;

              if (options.date === date) {
                orders.filter((order) => {
                  if (order.subscription.id === sub.id) {
                    let url = urlCase(options.input, sub);
                    options.is_skipped = order.is_skipped;
                    const feeObj = {
                      type: 'fee',
                      url,
                      value: options.newValue,
                      key: options.key,
                      subscription: sub,
                      options
                    };

                    if (options.input === 'skip' && options.is_skipped === false) {
                      feeArray.push(feeObj);
                    }

                    if (options.input === 'unskip' && options.is_skipped === true) {
                      feeArray.push(feeObj);
                    }
                  }
                });
              }
            });
          };

        }
      }
    }
  });

  console.log(feeArray);
  return feeArray;
}

function getProductURL(options, value) {
  let sub = allSubs.filter((sub) => {
    if (sub.id == options.id) {
      return sub
    }
  })[0];
  let url = urlCase(options.input, options);
  var obj = {
    type: 'product',
    url,
    value: options.newValue,
    key: options.key,
    subscription: sub,
    options
  }
  return [obj]
}

// 3. Bind Product & Fee, build urls, call ajax functions
function bindProductWithFee(feeId, value, options) {
  // 3a. Build filter based on matched feeIds and build urls

  let feeUrl = getFeeUrls(options); // . [{ type , url, value , key , subscription}]
  let productUrl = getProductURL(options, value); // . [{ type , url, value, subscription }]
  let redirect = '';

  let moveAlongInputs = ['skip', 'unskip', 'activate', 'cancel']

  url_que = productUrl
  // Only add fees if we are not updating the address
  if (moveAlongInputs.includes(options.input)) {
    url_que = productUrl.concat(feeUrl)
  }

  // 3b. Make ajax calls based on input 
  switch (options.input) {
    case 'quantity':
      moveAlong(null, updateProductQuantity)
      //updateProductQuantity(url_que, value);
      break;
    case 'frequency':
      moveAlong(null, updateProductFrequency)
      // updateProductFrequency(productUrl, feeUrl, value);
      break;
    case 'next-shipment':
      moveAlong(null, updateProductChargeDate)
      //updateProductChargeDate(productUrl, feeUrl, value);
      break;
    case 'skip':
      // getSkipQue(options)
      moveAlong(null, skipAndUnskip)
      // skipProductSubscription(productUrl, feeUrl, value);
      break;
    case 'unskip':
      moveAlong(null, skipAndUnskip)
      //  moveAlong(null,unSkipProductSubscription) 
      // unSkipProductSubscription(productUrl, feeUrl, value);
      break;
    case 'cancel':
      moveAlong(null, cancelProductSubscription)
      //cancelProductSubscription(productUrl, feeUrl, value);
      break;
    case 'cancel_onetime':
      moveAlong(null, cancelOnetime)
      //cancelProductSubscription(productUrl, feeUrl, value);
      break;
    case 'add_onetime':
      moveAlong(null, addOnetime)
      //cancelProductSubscription(productUrl, feeUrl, value);
      break;
    case 'activate':
      moveAlong(null, activateSubscription)
      //cancelProductSubscription(productUrl, feeUrl, value);
      break;
    case 'address_change':
      moveAlong(null, updateSubscriptionAddress)
      //cancelProductSubscription(productUrl, feeUrl, value);
      break;
    case 'swap':
      swap(options)
      //cancelProductSubscription(productUrl, feeUrl, value);
      break;
    case 'new':
      getnewProductQue(options)
      break;
    default:
      alert('error: no values updated.');
  }
}

// 4. Run on input or select change
function handleUpdates(options) {
  const id = options.id;
  const key = options.key || options.id;

  const select = $("." + options.input + "-select-" + key);
  const submit = $("." + options.input + "-submit-" + key);
  const modal = $("." + options.input + "-modal-" + key);


  const properties = select.data('properties') || submit.data('properties');

  let feeId;
  if (properties) {
    for (let i = 0; i < properties.length; i++) {
      if (properties[i].name == "fee_id") {
        feeId = properties[i].value;
      }
    }
  }

  //Add new address to modal if subscription address changes
  if (options.input === 'address_change') {
    var selectedAddress = options.selection.value;
    var selectedAddressText = options.selection.selectedOptions[0].label;
    $('.js-new-address').text(selectedAddressText)
    options.address_id = selectedAddress;
  }


  //construct options object
  options.newValue = select.val() || options.date || options.initialValue;
  options.feeId = feeId;

  var newValue = select.val() || options.date || options.initialValue;

  //Additional settings
  if (options.input == 'next-shipment') {
    const today = new Date();
    const selectedDate = new Date(newValue);
    modal.css('display', 'flex');
    // Format date to match next shippment date
    if (newValue != options.initialValue && selectedDate > today){
      newValue = formatDate(newValue)
      $('.modal-updated-value').css('color', '#002554');
      $('.modal-updated-value').text(newValue);
      $('.modal-cta').show();

      // ON SUBMIT
      $('.modal-cta').off('click');
      $('.modal-cta').on('click', function (e) {
        e.preventDefault();
        bindProductWithFee(feeId, newValue, options);
      });
    } else {
      $('.modal-updated-value').text('Date must be scheduled at least one day in the future.');
      $('.modal-updated-value').css('color', 'red');
      $('.modal-cta').hide();
    }
  } else {
    modal.css('display', 'flex');
    $('.modal-updated-value').text(newValue);
    // ON SUBMIT
    $('.modal-cta').on('click', function (e) {
      e.preventDefault();

      // Update QTY on submit for add onetime modal
      if (options.input == 'add_onetime') {
        options.qty = $("." + options.input + "-qty-" + key).val();
      }

      bindProductWithFee(feeId, newValue, options);
    });
  }

  // ON CLOSE
  $('.modal__overlay').on('click', function (e) {
    e.preventDefault();
    closeModal();
    $("." + options.input + "-select-" + key + " option").attr('selected', false);
    $("." + options.input + "-select-" + key + "  option[value=" + options.initialQuantity + "]").attr('selected', true);
  });
}

function closeOneTimeModal(){

  var itemsAdded =  $('.onetime-modal').attr('data-onetime')

  if(itemsAdded.includes('added')){ 
    location.reload();
  } else {  
    $('.js-close-onetime-modal').html('<span class="recharge-loading">Refreshing</span><div class="dot-pulse"></div>');
    $('.js-close-onetime-modal').css('background-color', 'lightgrey');
    $('.onetime-modal').css('display', 'none');
  }
}

function openOneTimeModal() {
  $('.onetime-modal').css('display', 'flex');

  $('.modal__overlay--onetime').on('click', function(e) {
     e.preventDefault();
     closeOneTimeModal()
  });
}
  

function handleOneTimeUpdates(options) {
  const id = options.id;
  const key = options.key || options.id;

  let feeId;
  let newValue;

  bindProductWithFee(feeId, newValue, options);

  // ON CLOSE
  $('.modal__overlay--onetime').on('click', function (e) {
    e.preventDefault();
    closeOneTimeModal()
  });

  $('.js-close-onetime-modal').on('click', function (e) {
    e.preventDefault();
    $(this).html('<span class="recharge-loading">Refreshing</span><div class="dot-pulse"></div>');
    $(this).addClass('onetime-loading');
    location.reload();
  });
}

 
// Add Onetime products
function addOnetime(item) {
  var address = $('.js-modal-title').attr('data-addressId');
  var onetimeDate = $('.js-modal-title').attr('data-nextChargeDate')

  $('.js-add-onetime--' + item.options.id).html('<span>adding</span><div class="dot-pulse"></div>');
  $('.js-add-onetime--' + item.options.id).addClass('onetime-loading');
  $('.js-add-onetime--' + item.options.id).attr('disabled', true);
  
  $.ajax({
    url: item.url,
    type: 'post',
    dataType: 'json',
    data: {
      shopify_variant_id: item.options.variantID,
      address_id: address,
      quantity: item.options.qty,
      next_charge_scheduled_at: onetimeDate
    }
  }).done(function (response) {
    // Successful request made
    $('.js-add-onetime--' + item.options.id).html('Product Added!');
    $('.js-add-onetime--' + item.options.id).addClass('onetime-loading'); 
    // update status for closeing modal
    $('.onetime-modal').attr('data-onetime','added')
    setTimeout(function(){
      $('.js-add-onetime--' + item.options.id).html('Add to order');
      $('.js-add-onetime--' + item.options.id).removeClass('onetime-loading'); 
      $('.js-add-onetime--' + item.options.id).attr('disabled', false);
    },1000)
    $('.modal-controls').show();
  }).fail(function (response) {
    // Request failed
    console.log(response);
    if (response.status === 409) {
      console.log('retrying . . ')
      addOnetime(item);
    } else {  
    $('.error-modal').css('display','flex');
    $('.error-modal .modal-title').text("We've encountered an error.");
    $('.error-modal .modal-body').text('Please contact support or try again later.');
    $('.error-modal .modal-cta').hide();
      setTimeout(function () {
        location.reload()
      }, 2000)
    }
  });
}

// Cancel Onetime products
function cancelOnetime(item) {

  $('.modal-cta').html(proccessing);
  $('.modal-cta').attr('disabled', true);
  $.ajax({
    url: item.url,
    type: 'post',
    dataType: 'json',
  }).done(function (response) {
    // Successful request made 
    // $('.modal-cta').hide();
    // $('.modal-body').text('Redirecting. . . ');
    // $('.modal-title').text('Subscription successfully unskipped!');
    console.log('changed')
    moveAlong(null, cancelOnetime)
  }).fail(function (response) {
    // Request failed
    console.log(response);
  });
}
 
// 5. Closes the open confirmation modal
function closeModal() {
  $('.modal').css('display', 'none');
}

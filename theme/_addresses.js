let subs = [];
function getSubs() {
  $.ajax({
    url: "/tools/recurring/portal/" + customerId + "/request_objects",
    type: 'get',
    dataType: 'json',
    data: { schema: '{ "subscriptions": { "products": {} } }' }
  }).done(function(response) {
    const subsForAddress = response.subscriptions.filter((sub) => {
    	if (sub.address_id === addressId) {
          return sub;
        }
    });
    
    if (subsForAddress.length > 0) {
      subsForAddress.map((sub) => {
        if (sub.address_id === addressId && sub.status === "ACTIVE") { 
          var isFee = '';
          if(sub.product.shopify_details.product_type == 'Recycling Fee'){
            isFee = 'fee'
          }
          $(`.subs-list-${addressId}`).append(`
            <div class="shipment__product-row ${isFee}" style="grid-template-columns: 10fr 5fr;">
              <p>${sub.product_title}</p>
              <p>${sub.quantity}</p> 
            </div>
          `);
      	}
      });
    } else {
      $(`.subs-list-${addressId} .shipment__product-row--header > p + p`).css('display', 'none');
      $(`.subs-list-${addressId}`).append(`
         <div class="shipment__product-row" style="grid-template-columns: 10fr 5fr;">
          <p>No active subscriptions for this address.</p>
          <p></p> 
        </div>
      `);                     
	}
  });
}
getSubs();

var ReCharge = {};

ReCharge.Utils = {
    getParamValue: function(param) {
        var value = new RegExp("[?&]" + param + "=([^&#]*)", "i").exec(window.location.href);
        return value ? value[1] : null;
    },
    getUrlPart: function(part) {
        var list = window.location.pathname.split('/');
        return list[list.indexOf(part) + 1];
    },
    actionConfirmation: function () {
        var action = ReCharge.Utils.getParamValue('action'),
            message;
        switch (action) {
            case 'cancelled':
                message = 'Subscription cancelled';
                break;
            case 'discount':
                message = 'Discount applied';
                break;
            case 'skip_charge':
                message = 'Skipped next order';
                break;
            case 'delay_subscription':
                message = 'Subscription delayed';
                break;
            case 'swap_product':
                message = 'Product swapped';
                break;
            default:
                message = false;
        }
        if (message) {
            ReCharge.Toast.addToast('success', message);
        }
    },
    showMessage: function() {
        var message = ReCharge.Utils.getParamValue('message'),
          messageType = ReCharge.Utils.getParamValue('message_type');
        if (message && messageType) {
            ReCharge.Toast.addToast(messageType, message);
        }
    }
};

ReCharge.Toast = {
    addToastListener: function(toaster) {
        toaster.addEventListener('animationend', function(e) {
            if (e.animationName === 'hide') {
                return toaster.removeChild(e.target);
            }
        });
    },
    buildToaster: function() {
        var toaster = document.createElement('ul');
        toaster.className = 'rc_toaster';

        ReCharge.Toast.addToastListener(toaster);

        return toaster;
    },
    buildToast: function(type, message) {
        type = typeof(type) === 'undefined' ? 'error' : type;
        message = typeof(message) === 'undefined' ? 'Message failed' : message;

        // Build elements
        var notice = document.createElement('li'),
            category = document.createElement('span'),
            content = document.createElement('p');
            // button = document.createElement('span');

        // Add content
        category.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
        content.innerHTML = message;

        // Assemble notice
        notice.className = 'rc_toast rc_toast--' + type;
        notice.appendChild(category).className = 'rc_toast__type';
        notice.appendChild(content).className = 'rc_toast__message';
        // notice.appendChild(button).className = 'rc_toast__button';

        return notice;
    },
    addToast: function(type, message) {
        var notice = ReCharge.Toast.buildToast(type, message);
        try {
            document.querySelector('.rc_toaster').appendChild(notice);
        } catch (e) {
            document.querySelector('body').appendChild(ReCharge.Toast.buildToaster())
                .appendChild(notice);
        }
    }
};

ReCharge.Helpers = {
    toggle: function(id) {
        var element = document.getElementById(id);
        element.style.display = element.style.display === 'none' ? '' : 'none';
        return false;
    },
}

ReCharge.Forms = {
    prettyError: function(message) {
        message = message.split('_').join(' ');
        return message.charAt(0).toUpperCase() + message.slice(1);
    },
    printError: function(form, input, error) {
        var elementSelector = (input == 'general') ? 'button[type="submit"]' : 'input[name="' + input + '"]',
            inputElem = form.querySelector(elementSelector),
            errorMessage = document.createElement('p');
        errorMessage.className = 'error-message';
        errorMessage.innerText = ReCharge.Forms.prettyError(error);
        try {
            inputElem.className = inputElem.className += ' error';
            inputElem.parentNode.insertBefore(errorMessage, inputElem.nextSibling);
        } catch (e) {
            window.console.warn(form, input, error, e);
            ReCharge.Toast.addToast('warning', ReCharge.Forms.prettyError(error));
        }
    },
    printAllErrors: function(form, errors) {
        Object.keys(errors).forEach(function(input) {
            var input_errors = Array.isArray(errors[input]) ? errors[input] : [errors[input]];
            input_errors.forEach(function(error) {
                ReCharge.Forms.printError(form, input, error);
            });
        });
    },
    updatePropertyElements: function(name, value) {
        document.querySelectorAll('[data-property="' + name + '"]').forEach(function(elem) {
            elem.innerText = value;
        });
    },
    updateAllProperties: function(elements) {
        Object.keys(elements).forEach(function(key) {
            var elem = elements[key];
            ReCharge.Forms.updatePropertyElements(elem.name, elem.value);
        });
    },
    resetErrors: function() {
        document.querySelectorAll('input.error').forEach(function(elem) {
              elem.className = elem.className.replace('error', '');
        });
        document.querySelectorAll('p.error-message').forEach(function(elem) {
              elem.parentNode.removeChild(elem);
        });
    },
    buildCountries: function() {
        if (!window.Countries || !document.querySelector('#country')) { return; }
        var activeCountry = document.querySelector('#country').getAttribute('data-value'),
            options = '<option value="">Please select a country...</option>';
        options +=  window.Countries.map(function(country) {
            var selected = (country.name === activeCountry) ? ' selected' : '';
            return '<option value="' + country.name + '"' + selected + '>' + country.name + '</option>';
        }).join('\n');
        document.querySelector('#country').innerHTML = options;
    },
    showProvinceDropdown: function() {
        if (!document.querySelector('#province') || !document.querySelector('#province_selector')) { return; }
        document.querySelector('#province').setAttribute('style', 'display: none;');
        document.querySelector('#province_selector').setAttribute('style', 'display: inline-block;');
    },
    hideProvinceDropdown: function() {
        if (!document.querySelector('#province') || !document.querySelector('#province_selector')) { return; }
        document.querySelector('#province').setAttribute('style', 'display: inline-block;');
        document.querySelector('#province_selector').setAttribute('style', 'display: none;');
    },
    updateProvinceInput: function(elem) {
        if (!document.querySelector('#province')) { return; }
        document.querySelector('#province').value = elem.value;
    },
    updateProvinces: function(elem) {
        if (!window.Countries || !document.querySelector('#province')) { return; }
        var country = window.Countries.find(function(country) {
            return country.name === elem.value;
        });
        if (!country || !country.provinces.length) {
            window.ReCharge.Forms.hideProvinceDropdown();
            return;
        }
        var provinces = country.provinces,
            activeProvince = document.querySelector('#province').value,
            options = '<option value="">Select province...</option>';
        options +=  provinces.map(function(province) {
            var selected = (province.name === activeProvince) ? ' selected' : '';
            return '<option value="' + province.name + '"' + selected + '>' + province.name + '</option>';
        }).join('\n');
        document.querySelector('#province_selector').innerHTML = options;
        ReCharge.Forms.showProvinceDropdown();
    },
    toggleSubmitButton: function(elem) {
        elem.disabled = !elem.disabled;
        var newText = elem.getAttribute('data-text') || 'Processing...',
            oldText = elem.innerText;
        elem.innerText = newText;
        elem.setAttribute('data-text', oldText);
    },
    decodeResponse: function(response) {
        if (typeof(response) === 'string') {
            return response;
        }

        return response['error'] || response['errors'];
    }
};

ReCharge.Endpoints = {
    base: '/tools/recurring/portal/{{ customer.hash }}/',
    request_objects: function() {
        return this.base + 'request_objects';
    },
    // Customer endpoints
    show_customer_url: function() {
        return this.base;
    },
    update_customer_url: function() {
        return this.base;
    },
    update_card_url: function() {
        return this.base + 'card';
    },
    update_customer_card_form: function() {
        return this.base + 'card';
    },
    // Delivery schedule endpoints
    delivery_schedule_url: function() {
        return this.base + 'delivery_schedule';
    },
    // Addresses endpoints
    list_addresses_url: function() {
        return this.base + 'addresses';
    },
    create_address_url: function() {
        return this.base + 'addresses/new';
    },
    show_address_url: function(id) {
        return this.base + 'addresses/' + id;
    },
    update_address_url: function(id) {
        return this.base + 'addresses/' + id + '/edit';
    },
    delete_address_url: function(id) {
        return this.base + 'addresses/' + id + '/delete';
    },
    // Subscriptions endpoints
    list_subscriptions_url: function() {
        return this.base + 'subscriptions';
    },
    create_subscription_url: function() {
        return this.base + 'subscriptions/new';
    },
    show_subscription_url: function(id) {
        return this.base + 'subscriptions/' + id;
    },
    update_subscription_url: function(id) {
        return this.base + 'subscriptions/' + id + '/edit';
    },
    // Subscription action endpoints
    activate_subscription_url: function(id) {
        return this.base + 'subscriptions/' + id + '/activate';
    },
    skip_subscription_url: function(id) {
        return this.base + 'subscriptions/' + id + '/skip';
    },
    unskip_subscription_url: function (id) {
        return this.base + 'subscriptions/' + id + '/unskip';
    },
    swap_subscription_url: function(id) {
        return this.base + 'products_search/swap?swap_product_id' + id;
    },
    subscription_charge_date_url: function(id) {
        return this.base + 'subscriptions/' + id + '/set_next_charge_date';
    },
    delay_subscription_url: function(id) {
        return this.base + 'subscriptions/' + id + '/delay';
    },
    // Subscription cancel endpoints
    cancel_subscription_url: function(id) {
        return this.base + 'subscriptions/' + id + '/cancel';
    },
    retention_strategy_url: function(data) {
        return this.base + 'subscriptions/' + data['id'] + '/cancel/' + data['strategy'];
    },
    // Product search endpoints
    product_search_url: function() {
        return this.base + 'products/search';
    },
    subscription_swap_search_url: function (id) {
        return this.base + 'products/search?swap_subscription_id=' + id;
    },
    // Discount endpoints
    apply_discount_url: function(id) {
        return this.base + 'subscriptions/' + id + '/apply_discount';
    },
    apply_discount_to_address_url: function(id) {
        return this.base + 'addresses/' + id + '/apply_discount';
    },
    remove_discount_from_address_url: function(id) {
        return this.base + 'addresses/' + id + '/remove_discount';
    },
    // Order endpoints
    list_orders_url: function() {
        return this.base + 'orders';
    },
    show_order_url: function(id) {
        return this.base + 'orders/' + id;
    },
    // One-time endpoints
    cancel_onetime_product: function(id) {
        return this.base + 'onetimes/' + id + '/cancel';
    }
};

ReCharge.Actions = {
    get: function(endpoint, id, schema) {
        if (window.locked) { return false; } else { window.locked = true; }
        if (typeof(endpoint) === 'undefined' || typeof(id) === 'undefined' || typeof(schema) === 'undefined') { return false; }

        var url = ReCharge.Endpoints[endpoint](id);

        window.console.log('get', url);

        ReCharge.jQuery.ajax({
            type: 'get',
            url: url,
            dataType: 'json',
            data: schema
        }).done(function(response) {
            // Successful request made
            window.console.log(response);
            return response;
        }).fail(function(response) {
            // Request failed
            window.console.error(response);
            return response;
        }).always(function() {
            delete window.locked;
        });
    },
    post: function(endpoint, data) {
        if (window.locked) { return false; } else { window.locked = true; }
        if (typeof(endpoint) === 'undefined') { return false; }

        var url = ReCharge.Endpoints[endpoint](data);

        window.console.log('post', url);

        ReCharge.jQuery.ajax({
            type: 'post',
            url: url,
            dataType: 'json',
            data: data
        }).done(function(response) {
            // Successful request made
            ReCharge.Toast.addToast('success', 'Created successfully');
            console.console.log(response);
            window.location.reload();
        }).fail(function(response) {
            // Request failed
            window.console.error(response);
            ReCharge.Toast.addToast('error', 'Create failed');
        }).always(function() {
            delete window.locked;
        });
    },
    put: function(endpoint, id, data) {
        if (window.locked) { return false; } else { window.locked = true; }
        if (typeof(endpoint) === 'undefined' || typeof(id) === 'undefined') { return false; }

        var url = ReCharge.Endpoints[endpoint](id, data);

        window.console.log('put', url);

        ReCharge.jQuery.ajax({
            type: 'post',
            url: url,
            dataType: 'json',
            data: data
        }).done(function(response) {
            // Successful request made
            ReCharge.Toast.addToast('success', 'Updated successfully');
            window.console.log(response);
            if (data && data.redirect_url) {
                window.location.href = data.redirect_url;
            } else {
                window.location.reload();
            }
        }).fail(function(response) {
            // Request failed
            ReCharge.Toast.addToast('error', 'Update failed');
            window.console.error(response);
        }).always(function() {
            delete window.locked;
        });
    },
    delete: function(endpoint, id) {
        if (window.locked) { return false; } else { window.locked = true; }
        if (typeof(endpoint) === 'undefined' || typeof(id) === 'undefined') { return false; }

        var url = ReCharge.Endpoints[endpoint](id);

        window.console.log('delete', url);

        ReCharge.jQuery.ajax({
            type: 'delete',
            url: url,
            dataType: 'json'
        }).done(function(response) {
            // Successful request made
            ReCharge.Toast.addToast('success', 'Removed successfully');
            window.console.log(response);
            window.location.reload();
        }).fail(function(response) {
            // Request failed
            window.console.error(response);
            ReCharge.Toast.addToast('error', 'Removal failed');
        }).always(function() {
            delete window.locked;
        });
    }
}

ReCharge.Schemas = {
    customers: function() {
        return { schema: '{ "customers": [] }' };
    },
    payment_sources: function(id) {
        if (id) {
            return { schema: '{ "payment_source": { "id": ' + id + ' } }' };
        }
        return { schema: '{ "payment_sources": [] }' };
    },
    addresses: function(id) {
        if (id) {
            return { schema: '{ "address": { "id": ' + id + ' } }' };
        }
        return { schema: '{ "addresses": [] }' };
    },
    subscriptions: function(id) {
        if (id) {
            return { schema: '{ "subscription": { "id": ' + id + ' } }' };
        }
        return { schema: '{ "subscriptions": [] }' };
    },
    orders: function(id) {
        if (id) {
            return { schema: '{ "order": { "id": ' + id + ' } }' };
        }
        return { schema: '{ "orders": [] }' };
    },
    // Customer endpoints
    show_customer_url: function() {
        return { schema: '{ "customers": [], "payment_sources": [] }' };
    },
    update_customer_url: function() {
        return { schema: '{ "customers": [] }' };
    },
    update_card_url: function() {
        return { schema: '{ "customers": [] }' };
    },
    update_customer_card_form: function() {
        return { schema: '{ "customers": [] }' };
    },
    // Delivery schedule endpoints
    delivery_schedule_url: function() {
        return { schema: '{ "customers": [], "delivery_schedule": [] }' };
    },
    // Addresses endpoints
    list_addresses_url: function() {
        return { schema: '{ "customers": [] }, "addresses": [] }' };
    },
    create_address_url: function() {
        return { schema: '{ "customers": [] }' };
    },
    show_address_url: function(id) {
        return { schema: '{ "customers": [], "address": { "id": ' + id + ' } }' };
    },
    update_address_url: function(id) {
        return { schema: '{ "customers": [], "address": { "id": ' + id + ' } }' };
    },
    // Subscriptions endpoints
    list_subscriptions_url: function() {
        return { schema: '{ "customers": [], "addresses": [], "subscriptions": [] }' };
    },
    create_subscription_url: function() {
        return { schema: '{ "customers": [], "addresses": [] }' };
    },
    show_subscription_url: function(id) {
        return { schema: '{ "customers": [], "subscription": { "id": ' + id + ' } }' };
    },
    update_subscription_url: function(id) {
        return { schema: '{ "customers": [], "subscription": { "id": ' + id + ' } }' };
    },
    // Subscription action endpoints
    activate_subscription_url: function(id) {
        return { schema: '{ "customers": [], "subscription": { "id": ' + id + ' } }' };
    },
    skip_subscription_url: function(id) {
        return { schema: '{ "customers": [], "subscription": { "id": ' + id + ' } }' };
    },
    unskip_subscription_url: function(id) {
        return { schema: '{ "customers": [], "subscription": { "id": ' + id + ' } }' };
    },
    swap_subscription_url: function(id) {
        return { schema: '{ "customers": [], "subscription": { "id": ' + id + ' } }' };
    },
    subscription_charge_date_url: function(id) {
        return { schema: '{ "customers": [], "subscription": { "id": ' + id + ' } }' };
    },
    delay_subscription_url: function(id) {
        return { schema: '{ "customers": [], "subscription": { "id": ' + id + ' } }' };
    },
    // Subscription cancel endpoints
    retention_strategy_url: function(id) {
        return { schema: '{ "customers": [], "subscription": { "id": ' + id + ' }, "retention_strategies": [] }' };
    },
    cancel_subscription_url: function(id) {
        return { schema: '{ "customers": [], "subscription": { "id": ' + id + ' } }' };
    },
    // Product search endpoints
    product_search_url: function() {
        return { schema: '{ "customers": [], "products": [] }' };
    },
    subscription_swap_search_url: function (id) {
        return { schema: '{ "customers": [], "subscription": { "id": ' + id + ' } }' };
    },
    // Discount endpoints
    apply_discount_url: function() {
        return { schema: '{ "customers": [], "address": { "id": ' + id + ' } }' };
    },
    apply_discount_to_address_url: function(id) {
        return { schema: '{ "customers": [], "address": { "id": ' + id + ' } }' };
    },
    remove_discount_from_address_url: function(id) {
        return { schema: '{ "customers": [], "address": { "id": ' + id + ' } }' };
    },
    // Order endpoints
    list_orders_url: function() {
        return { schema: '{ "customers": [], "orders": [] }' };
    },
    show_order_url: function(id) {
        return { schema: '{ "customers": [], "order": { "id": ' + id + ' } }' };
    },
    // One-time endpoints
    delete_one_time_product_url: function(id) {
        return { schema: '{ "customers": [], "onetime": { "id": ' + id + ' } }' };
    }
};

ReCharge.Customer = {
    get: function() {
        return ReCharge.Actions.get('request_objects', null, ReCharge.Schemas.show_customer_url());
    },
    update: function(data) {
        ReCharge.Actions.put('update_customer_url', null, data);
    }
};

ReCharge.Payment = {
    list: function() {
        return ReCharge.Actions.get('request_objects', null, ReCharge.Schemas.payment_sources());
    },
    get: function(id) {
        return ReCharge.Actions.get('request_objects', null, ReCharge.Schemas.payment_sources(id));
    }
};

ReCharge.Address = {
    list: function() {
        return ReCharge.Actions.get('request_objects', null, ReCharge.Schemas.addresses());
    },
    get: function(id) {
        return ReCharge.Actions.get('request_objects', null, ReCharge.Schemas.addresses(id));
    },
    create: function(data) {
        ReCharge.Actions.post('create_address_url', data);
    },
    update: function(id, data) {
        ReCharge.Actions.put('update_address_url', id, data);
    },
    delete: function(id) {
        ReCharge.Actions.delete('delete_address_url', id);
    }
};

ReCharge.Onetime = {
    cancel: function(id, data) {
        var _data = data || {};
        ReCharge.Actions.put('cancel_onetime_product', id, _data);
    }
};

ReCharge.Subscription = {
    list: function() {
        return ReCharge.Actions.get('request_objects', null, ReCharge.Schemas.subscriptions());
    },
    get: function(id) {
        return ReCharge.Actions.get('request_objects', null, ReCharge.Schemas.subscriptions(id));
    },
    create: function(data) {
        return ReCharge.Actions.post('create_subscription_url', data);
    },
    update: function(id, data) {
        return ReCharge.Actions.put('update_subscription_url', id, data);
    },
    activate: function(id) {
        return ReCharge.Actions.put('activate_subscription_url', id, {});
    },
    skip: function(id, charge_id, date) {
        return ReCharge.Actions.put('skip_subscription_url', id, { charge_id: charge_id, date: date });
    },
    unskip: function(id, charge_id) {
        return ReCharge.Actions.put('unskip_subscription_url', id, { charge_id: charge_id });
    },
    setChargeDate: function(id, date) {
        return ReCharge.Actions.put('subscription_charge_date_url', id, { next_charge_date: date });
    },
    delay: function(id, delay) {
        return ReCharge.Actions.put('delay_subscription_url', id, { days: delay });
    },
    swap: function(id, variant_id) {
        return ReCharge.Actions.put('swap_subscription_url', id, { shopify_variant_id: variant_id });
    },
    cancel: function(id, strategy, data) {
        if (typeof(data) === 'undefined') { data = {}; }
        return ReCharge.Actions.put('retention_strategy_url', { id: id, strategy: strategy }, data);
    },
};

ReCharge.Discount = {
    apply: function(id, discount_code) {
        return ReCharge.Actions.put('apply_discount_to_address_url', id, { 'discount_code': discount_code });
    },
    remove: function(id, discount_code) {
        return ReCharge.Actions.put('remove_discount_from_address_url', id, { 'discount_code': discount_code });
    }
};

ReCharge.Order = {
    list: function() {
        return ReCharge.Actions.get('request_objects', null, ReCharge.Schemas.orders());
    },
    get: function(id) {
        return ReCharge.Actions.get('request_objects', null, ReCharge.Schemas.orders(id));
    }
}

ReCharge.onLoad = function($) {
    if (window.location.pathname.indexOf('/tools/recurring/') == -1) {
        ReCharge.Endpoints.base = '/portal/{{ customer.hash }}/';
    }

    $(document).on('submit', 'form[id^="ReChargeForm_"]', function(evt) {
        evt.preventDefault();
        if (window.locked) { return false; } else { window.locked = true; }
        ReCharge.Forms.resetErrors();
        var $form = $(evt.target);
        ReCharge.Forms.toggleSubmitButton(evt.target.querySelector('[type="submit"]'));
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            dataType: 'json',
            data: $form.serialize(),
        }).done(function() {
            ReCharge.Toast.addToast('success', 'Updates saved successfully!');
            if ($form.find('[name="redirect_url"]').length) {
                window.location.href = $form.find('[name="redirect_url"]').val();
            } else {
                window.location.reload();
            }
        }).fail(function(response) {
            ReCharge.Forms.toggleSubmitButton(evt.target.querySelector('[type="submit"]'));
            if (!response.responseJSON) {
                ReCharge.Toast.addToast('error', 'Something went wrong.');
                delete window.locked;
                return;
            }

            var errors = ReCharge.Forms.decodeResponse(response.responseJSON);

            if (typeof(errors) === 'object') {
                ReCharge.Forms.printAllErrors($form[0], errors);
                ReCharge.Toast.addToast('error', 'Fix form errors to save updates.');
            } else {
                ReCharge.Toast.addToast('error', ReCharge.Forms.prettyError(errors));
            }

            delete window.locked;
        });
    });
};

ReCharge.Utils.actionConfirmation();
ReCharge.Utils.showMessage();

var loadScript = function(url, callback){
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (script.readyState){
        script.onreadystatechange = function(){
            if (script.readyState === "loaded" || script.readyState === "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {
        script.onload = function(){
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
};

if (typeof(jQuery) === "undefined") {
    loadScript("//ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js", function() {
        var jQuery331 = jQuery.noConflict(true);
        ReCharge.jQuery = jQuery331;
        ReCharge.onLoad(ReCharge.jQuery);
    });
} else {
    ReCharge.jQuery = jQuery;
    ReCharge.onLoad(jQuery);
}

(function syncOptimizely() {
    var getParam = function (name, optSearch) {
        optSearch = optSearch || window.location.search;
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(optSearch);
        return results && decodeURIComponent(results[1].replace(/\+/g, ' '));
    };
    var setCookie = function (name, value, optDays, domain) {
        var cookie = name + '=' + value;
        if (optDays) {
            var date = new Date();
            date.setTime(date.getTime() + (optDays * 24 * 60 * 60 * 1000));
            cookie += '; expires=' + date.toGMTString();
        }
        if (domain) {
            cookie += '; domain=' + domain;
        }
        document.cookie = cookie + '; path=/';
    };
    var param = getParam('optly');
    if (param && param.length) {
        console.log('Syncing Optimizely Visitor Ids');
        setCookie('optimizelyEndUserId', param, 180, '.rechargeapps.com');
        window.optimizely = window.optimizely || [];
        window.optimizely.push({
            "type": "waitForOriginSync",
            "canonicalOrigins": ["www.drinkhint.com", "checkout.rechargeapps.com"]
        });
    }
})();

window.onload = function () {

    function debounce(func, wait, immediate) {
        var timeout;

        return function executedFunction() {
            var context = this;
            var args = arguments;

            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };

            var callNow = immediate && !timeout;

            clearTimeout(timeout);

            timeout = setTimeout(later, wait);

            if (callNow) func.apply(context, args);
        };
    };


    $('.order-summary__section--product-list .product').each(function (e) {
        var productTitle = $(this).find('.product__info__name').find('strong').text()
        if (productTitle.includes("Bottle Deposit")) {
            $(this).hide()
        }
    })

    function addFees(data) {

        var cartPrice = data && data.hasOwnProperty('cartPrice') ? data.cartPrice : null;

        $('.total-line--fee').remove()

        if (cartPrice && cartPrice.total_fees > 0) {
            var markup =
                '<div class="total-line total-line--fee" data-fee="' + cartPrice.total_fees + '>' +
                '<span class="total-line__name">' +
                'Bottle Deposit Fee(s)' +
                '</span>' +
                '<strong class="total-line__price">$' + cartPrice.total_fees + '</strong>' +
                '</div>';

            // Update Totals     
            $('.order-summary__section[aria-label="order-summary"]').prepend(markup);
            $('#total_cost_amount').html('$' + cartPrice.total_price);
            $('#payment_due_amount').html('$' + cartPrice.total_price);
        }
    }

    var $dom = {}

    var cacheDom = function () {
        $dom.document = $(document);
    };

    var updateCart = function (state, token) {
        $.ajax({
                url: 'https://recharge-hint.herokuapp.com/api/v1/checkouts/order',
                method: 'POST',
                data: {
                    state: state,
                    token: token
                },
                dataType: 'json'
            })
            .done(function (data) {
                console.log(data)
                addFees(data)
            })
            .fail(function () {});
    }

    var updateOnStart = function () {
        var updateProvince = $('#checkout_shipping_address_province').val();
        updateCart(updateProvince, window.cart_json.token)
    }

    var onChangeProvince = debounce(function () {
        var updateProvince = $('#checkout_shipping_address_province').val();
        updateCart(updateProvince, window.cart_json.token)
    }, 250);

    var bindUIActions = function () {
        $dom.document.on('change', '#checkout_shipping_address_province', onChangeProvince);
        $dom.document.on('change', '#checkout_shipping_address_zip', onChangeProvince);
    };

    cacheDom()
    updateOnStart()
    bindUIActions()

}

document.onreadystatechange = function () {
    if (document.readyState == "interactive") {
        "use strict";
        var $input1 = document.getElementById("checkout_shipping_address_address1");
        var $input2 = document.getElementById("checkout_shipping_address_address2");
        var patternPostOffice = new RegExp('\\b[p]*(ost)*\\.*\\s*[o|0]', 'i');
        var patternBox = new RegExp('\\s*b[o|0]x\\b', 'i');

        var errorMessage = function (validate, field) {
            var $message = document.querySelector("#error-for-" + field);
            var $field = document.querySelector('.field.' + field);
            var $input = document.getElementById("checkout_shipping_address_" + field)

            if (validate) {
                $field.classList.add("field--error");
                $input.setAttribute("placeholder", "Please provide a valid address");

                var d = document.createElement('p');
                d.classList.add("field__error-message");
                d.setAttribute("id", "error-for-" + field);
                d.innerText = "No PO Boxes, APO/FPO, and AK/HI";

                if (!$message) {
                    $field.appendChild(d);
                }
            } else {
                if ($message) {
                    $field.classList.remove("field--error");
                    $field.removeChild($message);
                }
            }
        }

        var validateInput = function (input, field) {
            var validatePO = input.value && input.value.length ? input.value.match(patternPostOffice) : null;
            var validateBox = input.value && input.value.length ? input.value.match(patternBox) : null;
            if (validatePO && validateBox) {
                errorMessage(true, field);
            } else {
                errorMessage(false, field);
            }
        }

        $input1.addEventListener("change", function () {
            validateInput($input1, "address1");
        });

        $input2.addEventListener("change", function () {
            validateInput($input2, "address2");
        });

    }
}

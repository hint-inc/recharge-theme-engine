// Used to pull the next shipment's frequency through to
// the 'add subscription' page when adding a new product

(function() {
  const subscriptions = window.location.href.indexOf('/subscriptions');
  const subscriptionsNew = window.location.href.indexOf('/new');

  if (subscriptions !== -1 && subscriptionsNew === -1) {
    const firstProductFreq = document.querySelectorAll('.js-frequency-value')[0].value;
    if (firstProductFreq) {
      document.cookie = `defaultFrequency=${firstProductFreq}`;
    }
  } else if (subscriptions !== -1 && subscriptionsNew !== -1) {
    const frequencySelect = document.querySelector('.js-frequency-value');
    const frequencySelectOrder = document.querySelector('.js-frequency-value--order');
    const defaultFrequency = document.cookie.replace(/(?:(?:^|.*;\s*)defaultFrequency\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (defaultFrequency) {
      frequencySelect.value = defaultFrequency;
      frequencySelectOrder.value = defaultFrequency;
    }
  }
})();

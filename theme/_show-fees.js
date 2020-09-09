// Gather all fee UI
const fees = document.querySelectorAll('.fee');

if (window.location.href.indexOf('hint-water-annex') != -1) {
  // Shows fees if on the annex store
  const fees = document.querySelectorAll('.fee');
  fees.forEach((fee) => {
    fee.style.display = 'flex';
  });
} else {
  // Otherwise, do not show fees unless proper query params are provided
  const params = new URLSearchParams(window.location.search);
  const showFees = params.get('show_fees');

  if (showFees) {
    fees.forEach((fee) => {
      fee.style.display = 'flex';
    });
  }
}

// Custom file
// Initializes event listener for custom select dropdowns
(function () {
  const subElements = $('.styled-select__content');
  subElements.each(function(index, element) {
    const el = $(this);
    el.on('click', function(event) {
      el.parent().next().toggle();
    });
  });
})();

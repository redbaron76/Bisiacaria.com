/*!
 * jQuery Textarea AutoSize plugin
 * Author: Javier Julio
 * Licensed under the MIT license
 */
;(function ($, window, document, undefined) {

  var pluginName = "textareaAutoSize";
  var pluginDataName = "plugin_" + pluginName;

  var containsText = function (value) {
    return (value.replace(/\s/g, '').length > 0);
  };

  function Plugin(element, options) {
    this.element = element;
    this.$element = $(element);

    if (options) {
      this.wrapper = options.wrapper || window;
    } else {
      this.wrapper = window;
    }

    this.$wrapper = $(this.wrapper);

    this.init();
  }

  Plugin.prototype = {
    init: function() {
      var parent = this;
      var height = this.$element.outerHeight();
      var diff = parseInt(this.$element.css('paddingBottom')) +
                  parseInt(this.$element.css('paddingTop'));

      if (containsText(this.element.value)) {
        this.$element.height(this.element.scrollHeight - diff);
      }

      // keyup is required for IE to properly reset height when deleting text
      this.$element.on('input keyup', function(event) {
        var $wrapper = $(parent.wrapper);
        var currentScrollPosition = $wrapper.scrollTop();

        $(this)
          .height(0)
          .height(this.scrollHeight - diff);

        $wrapper.scrollTop(currentScrollPosition);
      });
    }
  };

  $.fn[pluginName] = function (options) {
    this.each(function() {
      if (!$.data(this, pluginDataName)) {
        $.data(this, pluginDataName, new Plugin(this, options));
      }
    });
    return this;
  };

})(jQuery, window, document);
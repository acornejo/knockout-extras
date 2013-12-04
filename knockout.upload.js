(function() {
  function factory(ko, koext) {
    ko.bindingHandlers.chooseFile = {
      init: function (element, valueAccessor, allBindingsAccesor) {
        var form = document.createElement('form');
        var input = document.createElement('input');
        input.type = 'file';
        input.name = 'file';
        form.appendChild(input);
        element.onclick = function () {
          input.click();
        };
        input.onchange = function () {
          var value = valueAccessor();
          value(input.files);
        };
      }
    };

    ko.bindingHandlers.chooseFileAsDataURL = {
      init: function (element, valueAccessor, allBindingsAccesor) {
        var form = document.createElement('form');
        var input = document.createElement('input');
        input.type = 'file';
        input.name = 'file';
        form.appendChild(input);
        element.onclick = function () {
          input.click();
        };
        input.onchange = function () {
          var value = valueAccessor();
          if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
              value(e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
          } else {
            value(undefined);
          }
        };
      }
    };
  }

  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") 
    factory(require("knockout"), exports);
  else if (typeof define === "function" && define.amd) 
    define(["knockout", "exports"], factory);
  else
    factory(ko, ko);
})();

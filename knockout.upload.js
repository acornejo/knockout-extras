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
      },

      update: function (element, valueAccessor, allBindingsAccesor) {
        var files = ko.utils.unwrapObservable(valueAccessor());
        var bindings = allBindingsAccesor();
        var reader;

        if (bindings.fileDataURL && ko.isObservable(bindings.fileDataURL)) {
          if (files && files[0]) {
            reader = new FileReader();
            reader.onload = function (e) {
              bindings.fileDataURL(e.target.result);
            };
            reader.readAsDataURL(files[0]);
          } else 
            bindings.fileDataURL(undefined);
        }

        if (bindings.fileArrayBuffer && ko.isObservable(bindings.fileArrayBuffer)) {
          if (files && files[0]) {
            reader = new FileReader();
            reader.onload = function (e) {
              bindings.fileArrayBuffer(e.target.result);
            };
            reader.readAsArrayBuffer(files[0]);
          } else 
            bindings.fileArrayBuffer(undefined);
        }

        if (bindings.fileBinaryString && ko.isObservable(bindings.fileBinaryString)) {
          if (files && files[0]) {
            reader = new FileReader();
            reader.onload = function (e) {
              bindings.fileBinaryString(e.target.result);
            };
            reader.readAsBinaryString(files[0]);
          } else 
            bindings.fileBinaryString(undefined);
        }

        if (bindings.fileText && ko.isObservable(bindings.fileText)) {
          if (files && files[0]) {
            reader = new FileReader();
            reader.onload = function (e) {
              bindings.fileText(e.target.result);
            };
            reader.readAsText(files[0]);
          } else 
            bindings.fileText(undefined);
        }
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

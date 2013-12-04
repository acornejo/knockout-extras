(function() {
  function factory(ko, koext) {
    koext.dirtyFlag = function(root, isInitiallyDirty) {
      var _result = function () {},
          _initialState = ko.observable(ko.toJSON(root)),
          _isInitiallyDirty = ko.observable(isInitiallyDirty);

      _result.isDirty = ko.computed(function () {
        return _isInitiallyDirty() || _initialState() !== ko.toJSON(root);
      });

      _result.forceDirty =  function () {
        _isInitiallyDirty(true);
      };

      _result.reset = function () {
        _initialState(ko.toJSON(root));
        _isInitiallyDirty(false);
      };

      return _result;
    };

    koext.observableDate = function (initialValue) {
      var _actual = ko.observable(initialValue);

      var _day = ko.observable(),
          _month = ko.observable(),
          _year = ko.observable();

      function updateDate() {
        var day = _day(), month = _month(), year = _year();
        if (day !== undefined && month !== undefined && year !== undefined) 
          _actual(new Date(year, month, day));
        else if (day === undefined && month === undefined && year === undefined)
          _actual(undefined);
      }

      _day.subscribe(updateDate);
      _month.subscribe(updateDate);
      _year.subscribe(updateDate);

      var result = ko.dependentObservable({
        read: function () {
          return _actual();
        },
        write: function (newValue) {
          var parsedValue = new Date(Date.parse(newValue));
          if (isNaN(parsedValue.valueOf())) {
            _actual(newValue);
            _day(undefined);
            _month(undefined);
            _year(undefined);
          }
          else {
            _day(parsedValue.getDate());
            _month(parsedValue.getMonth());
            _year(parsedValue.getFullYear());
            _actual(parsedValue);
          }
        }
      });

      result.day = _day;
      result.month = _month;
      result.year = _year;

      return result;
    };

    koext.observableInteger = function(initialValue) {
      var _actual = ko.observable(initialValue);

      var result = ko.dependentObservable({
        read: function() {
          return _actual();
        },
        write: function(newValue) {
          var parsedValue = parseInt(newValue);
          _actual(isNaN(parsedValue) ? newValue : parsedValue);
        }
      });

      return result;
    };

    koext.observableNumber = function(initialValue) {
      var _actual = ko.observable(initialValue);

      var result = ko.dependentObservable({
        read: function() {
          return _actual();
        },
        write: function(newValue) {
          var parsedValue = parseFloat(newValue);
          _actual(isNaN(parsedValue) ? newValue : parsedValue);
        }
      });

      return result;
    };

    koext.observableModel = function (model, initialValue) {
      var _value = initialValue || {};
      var _fields = {};

      function hasError(l) {
        return function (e) {
          return l.indexOf(e) !== -1;
        };
      }

      function cleanError(e) {
        return function () {
          e.removeAll();
        };
      }

      function errorParser(model, fields) {
        return function parseErrors(errors) {
          errors = errors || {};
          for (var p in model) {
            if (model.hasOwnProperty(p)) {
              fields[p].errors.removeAll();
              if (errors.hasOwnProperty(p)) {
                for (var e in errors[p]) {
                  if (errors[p].hasOwnProperty(e)) {
                    fields[p].errors.push(e);
                  }
                }
              }
            }
          }
        };
      }

      for (var p in model) {
        if (model.hasOwnProperty(p)) {
          if (typeof model[p] === 'object')
            _fields[p] = koext.observableModel(model[p], _value[p]);
          else if (model[p] === 'date')
            _fields[p] = koext.observableDate(_value[p]);
          else if (model[p] === 'number')
            _fields[p] = koext.observableNumber(_value[p]);
          else if (model[p] === 'integer')
            _fields[p] = koext.observableInteger(_value[p]);
          else
            _fields[p] = ko.observable(_value[p]);
          _fields[p].errors = ko.observableArray();
          _fields[p].errors.has = hasError(_fields[p].errors);
          _fields[p].subscribe(cleanError(_fields[p].errors));
        }
      }

      var result = ko.computed({
        read: function() {
          var obj = {}, empty = true;
          for (var p in model) {
            if (model.hasOwnProperty(p) && _fields.hasOwnProperty(p)) {
              obj[p] = _fields[p]();
              if (obj[p] !== undefined)
                empty = false;
            }
          }
          if (!empty)
            return obj;
        },
        write: function (newValue) {
          for (var p in model) {
            if (model.hasOwnProperty(p)) {
              if (newValue && newValue.hasOwnProperty(p))
                _fields[p](newValue[p]);
              else
                _fields[p](undefined);
            }
          }
        }
      });

      for (p in model) 
        if (model.hasOwnProperty(p))
          result[p] = _fields[p];

      result.parseErrors = errorParser(model, _fields);
      result.dirtyFlag = koext.dirtyFlag(_fields);
      result.resetDirty = function () {
        result.dirtyFlag.reset();
        for (var p in model)
          if (model.hasOwnProperty(p) && typeof model[p] == 'object')
            _fields[p].resetDirty();
      };

      return result;
    };

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

  } // factory

  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") 
    factory(require("knockout"), exports);
  else if (typeof define === "function" && define.amd) 
    define(["knockout", "exports"], factory);
  else
    factory(ko, ko);
})();

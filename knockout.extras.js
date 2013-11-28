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

    kext.observableDate = function (initialValue) {
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

      var result = ko.computed({
        read: function() {
          return ko.toJS(_fields);
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
          result.dirtyFlag.reset();
        }
      });

      function has(l) {
        return function (e) {
          return l.indexOf(e) !== -1;
        };
      }

      function clean(l) {
        l.subscribe(function () {
          l.errors.removeAll();
        });
      }

      function parseErrors(errors) {
        errors = errors || {};
        for (var p in model) {
          if (model.hasOwnProperty(p)) {
            _fields[p].errors.removeAll();
            if (errors.hasOwnProperty(p)) {
              for (var e in errors[p]) {
                if (errors[p].hasOwnProperty(e)) {
                  _fields[p].errors.push(e);
                }
              }
            }
          }
        }
      }

      for (var p in model) {
        if (model.hasOwnProperty(p)) {
          if (model[p] === 'date')
            _fields[p] = koext.observableDate(_value[p]);
          else if (model[p] === 'number')
            _fields[p] = koext.observableNumber(_value[p]);
          else if (model[p] === 'integer')
            _fields[p] = koext.observableInteger(_value[p]);
          else
            _fields[p] = koext.observable(_value[p]);
          _fields[p].errors = ko.observableArray();
          _fields[p].errors.has = has(_fields[p].errors);
          clean(_fields[p]);
          result[p] = _fields[p];
        }
      }

      result.parseErrors = parseErrors;
      result.dirtyFlag = koext.dirtyFlag(_fields);

      return result;
    };
  } // factory

  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") 
      factory(require("knockout"), exports);
  else if (typeof define === "function" && define.amd) 
      define(["knockout", "exports"], factory);
  else
      factory(ko, ko);
})();

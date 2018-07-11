"use strict";
/// <reference path="./jquery.d.ts" />
/// <reference path="./jquery.dirty.d.ts" />
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
/** The Dirty class */
var Dirty = /** @class */ (function () {
    /**
     *
     */
    function Dirty(form, options) {
        var _this = this;
        this.dirty = "dirty";
        this.clean = "clean";
        this.dataInitialValue = "dirtyInitialValue";
        this.dataIsDirty = "isDirty";
        this.init = function () {
            _this.saveInitialValues();
            _this.setEvents();
        };
        this.getElementsInForm = function () {
            var elements = [];
            var inputs = _this.form[0].querySelectorAll("input");
            var selects = _this.form[0].querySelectorAll("select");
            var textareas = _this.form[0].querySelectorAll("textarea");
            for (var index = 0; index < inputs.length; index++) {
                elements.push(inputs[index]);
            }
            for (var index = 0; index < selects.length; index++) {
                elements.push(selects[index]);
            }
            for (var index = 0; index < textareas.length; index++) {
                elements.push(textareas[index]);
            }
            return elements;
        };
        this.isRadioOrCheckbox = function (el) {
            return ["radio", "checkbox"].some(function (e) { return e === el.type; });
        };
        this.isFileInput = function (el) { return el.type === "file"; };
        this.setSubmitEvents = function () {
            _this.form.on("submit", function () { return _this.submitting = true; });
            if (_this.options.preventLeaving) {
                $(window).on("beforeunload", function () {
                    if (_this.isDirty && !_this.submitting) {
                        return _this.options.leavingMessage;
                    }
                });
            }
        };
        this.setNamespacedEventTriggers = function () {
            _this.form.find("input, select, textarea").on("change click keyup keydown blur", function (e) {
                $(_this).trigger(e.type + ".dirty");
            });
        };
        this.setNamespacedEvents = function () {
            _this.form.find("input, select, textarea").on("change.dirty click.dirty keyup.dirty keydown.dirty blur.dirty", function (e) {
                _this.checkValues(e);
            });
            _this.form.on("dirty", function () { return _this.options.onDirty(); });
            _this.form.on("clean", function () { return _this.options.onClean(); });
        };
        this.clearNamespacedEvents = function () {
            _this.form.find("input, select, textarea").off("change.dirty click.dirty keyup.dirty keydown.dirty blur.dirty");
            _this.form.off("dirty");
            _this.form.off("clean");
        };
        this.saveInitialValues = function () {
            _this.getElementsInForm().forEach(function (e) {
                var isRadioOrCheckbox = _this.isRadioOrCheckbox(e);
                var isFile = _this.isFileInput(e);
                if (isRadioOrCheckbox) {
                    var isChecked = $(e).is(":checked") ? "checked" : "unchecked";
                    $(e).data(_this.dataInitialValue, isChecked);
                }
                else if (isFile) {
                    $(e).data(_this.dataInitialValue, JSON.stringify(e.files));
                }
                else {
                    $(e).data(_this.dataInitialValue, $(e).val() || "");
                }
            });
        };
        this.refreshEvents = function () {
            _this.clearNamespacedEvents();
            _this.setNamespacedEvents();
        };
        this.showDirtyFields = function () {
            return _this.getElementsInForm().filter(function (e) {
                return $(e).data("isDirty");
            });
        };
        this.setEvents = function () {
            _this.setSubmitEvents();
            _this.setNamespacedEvents();
            _this.setNamespacedEventTriggers();
        };
        this.isFieldDirty = function (field) {
            var $field = $(field);
            // explicitly check for null/undefined here as value may be `false`, so ($field.data(dataInitialValue) || '') would not work
            var initialValue = $field.data(_this.dataInitialValue);
            if (initialValue == null) {
                initialValue = "";
            }
            var currentValue = $field.val();
            if (currentValue == null) {
                currentValue = "";
            }
            // boolean values can be encoded as "true/false" or "True/False" depending on underlying frameworks
            // we need a case insensitive comparison
            var boolRegex = /^(true|false)$/i;
            var isBoolValue = boolRegex.test(initialValue) && boolRegex.test(currentValue);
            if (isBoolValue) {
                var regex = new RegExp("^" + initialValue + "$", "i");
                return !regex.test(currentValue);
            }
            return currentValue !== initialValue;
        };
        this.isFileInputDirty = function (field) {
            var initialValue = $(field).data(_this.dataInitialValue);
            var currentValue = JSON.stringify(field.files);
            return currentValue !== initialValue;
        };
        this.isCheckboxDirty = function (field) {
            var initialValue = $(field).data(_this.dataInitialValue);
            var currentValue = field.checked ? "checked" : "unchecked";
            return initialValue !== currentValue;
        };
        this.isElementDirty = function (e) {
            var thisIsDirty = false;
            var isInput = e instanceof HTMLInputElement;
            if (isInput) {
                var el = e;
                var isRadioOrCheckbox = _this.isRadioOrCheckbox(el);
                var isFile = _this.isFileInput(el);
                if (isRadioOrCheckbox) {
                    thisIsDirty = _this.isCheckboxDirty(el);
                }
                else if (isFile) {
                    thisIsDirty = _this.isFileInputDirty(el);
                }
                else {
                    thisIsDirty = _this.isFieldDirty(e);
                }
            }
            return thisIsDirty;
        };
        this.checkValues = function (e) {
            var elements = _this.getElementsInForm();
            elements.forEach(function (el) {
                var thisIsDirty = _this.isElementDirty(el);
                $(el).data(_this.dataIsDirty, thisIsDirty);
                if (thisIsDirty) {
                    _this.setDirty();
                }
                else {
                    _this.setClean();
                }
            });
            if (e) {
                e.stopImmediatePropagation();
            }
        };
        this.setDirty = function () {
            _this.isDirty = true;
            _this.history[0] = _this.history[1];
            _this.history[1] = _this.dirty;
            if (_this.options.fireEventsOnEachChange || _this.wasJustClean()) {
                _this.form.trigger("dirty");
            }
        };
        this.setClean = function () {
            _this.isDirty = false;
            _this.history[0] = _this.history[1];
            _this.history[1] = _this.clean;
            if (_this.options.fireEventsOnEachChange || _this.wasJustDirty()) {
                _this.form.trigger("clean");
            }
        };
        this.wasJustDirty = function () { return (_this.history[0] === _this.dirty); };
        this.wasJustClean = function () { return (_this.history[0] === _this.clean); };
        this.setAsClean = function () {
            _this.saveInitialValues();
            _this.setClean();
        };
        this.setAsDirty = function () {
            _this.saveInitialValues();
            _this.setDirty();
        };
        this.resetForm = function () {
            _this.getElementsInForm().forEach(function (e) {
                var $e = $(e);
                var isRadioOrCheckbox = _this.isRadioOrCheckbox(e);
                var isFileInput = _this.isFileInput(e);
                if (isRadioOrCheckbox) {
                    var initialCheckedState = $e.data(_this.dataInitialValue);
                    var isChecked = initialCheckedState === "checked";
                    $e.prop("checked", isChecked);
                }
                else if (isFileInput) {
                    var e1 = e;
                    e1.files = new FileList();
                }
                else {
                    var value = $e.data(_this.dataInitialValue);
                    $e.val(value);
                }
            });
            _this.checkValues();
        };
        this.form = form;
        this.isDirty = false;
        this.options = options;
        this.history = [this.clean, this.clean]; // keep track of last statuses
        this.id = $(form).attr("id");
        this.submitting = false;
        Dirty.singleDs.push(this);
    }
    Dirty.singleDs = [];
    Dirty.DefaultOptions = {
        preventLeaving: false,
        leavingMessage: "There are unsaved changes on this page which will be discarded if you continue.",
        onDirty: $.noop,
        onClean: $.noop,
        fireEventsOnEachChange: false,
    };
    Dirty.getSingleton = function (id) {
        Dirty.singleDs.forEach(function (e) {
            if (e.id === id) {
                return e;
            }
        });
        return null;
    };
    return Dirty;
}());
exports.Dirty = Dirty;
/*
 * Dirty
 * jquery plugin to detect when a form is modified
 * (c) 2016 Simon Taite - https://github.com/simontaite/jquery.dirty
 * originally based on jquery.dirrty by Ruben Torres - https://github.com/rubentd/dirrty
 * Released under the MIT license
 */
$.fn.dirty = function (options) {
    _this.defaults = {
        preventLeaving: false,
        leavingMessage: "There are unsaved changes on this page which will be discarded if you continue.",
        onDirty: $.noop,
        onClean: $.noop,
        fireEventsOnEachChange: false,
    };
    if ((options instanceof string) && /^(isDirty|isClean|refreshEvents|resetForm|setAsClean|setAsDirty|showDirtyFields)$/i.test(options)) {
        // check if we have an instance of dirty for this form
        // todo: check if this is DOM or jQuery object
        var d = Dirty.getSingleton($(_this).attr("id"));
        if (!d) {
            d = new Dirty($(_this), options);
            d.init();
        }
        var optionsLowerCase = options.toLowerCase();
        switch (optionsLowerCase) {
            case "isclean":
                return !d.isDirty;
            case "isdirty":
                return d.isDirty;
            case "refreshevents":
                d.refreshEvents();
            case "resetform":
                d.resetForm();
            case "setasclean":
                return d.setAsClean();
            case "setasdirty":
                return d.setAsDirty();
            case "showdirtyfields":
                return d.showDirtyFields();
        }
    }
    else if (typeof options === "object" || !options) {
        return _this.each(function (_, e) {
            options = $.extend({}, $.fn.dirty.defaults, options);
            var dirty = new Dirty($(e), options);
            dirty.init();
        });
    }
};

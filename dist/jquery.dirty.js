/*
 * Dirty 
 * jquery plugin to detect when a form is modified
 * (c) 2016 Simon Taite - https://github.com/simontaite/jquery.dirty
 * originally based on jquery.dirrty by Ruben Torres - https://github.com/rubentd/dirrty
 * Released under the MIT license
 */

//Save dirty instances
var singleDs = [];
var dirty = "dirty";
var clean = "clean";
var dataInitialValue = "dirtyInitialValue";
var dataIsDirty = "isDirty";

(function($) {

    var getSingleton = function(id) {
        var result;
        $(singleDs).each(function() {
            if ($(this)[0].id === id) {
                result = $(this)[0];
            }
        });
        return result;
    };

    var setSubmitEvents = function(d) {
        d.form.on("submit", function() {
            d.submitting = true;
        });

        if (d.options.preventLeaving) {
            $(window).on("beforeunload", function() {
                if (d.isDirty && !d.submitting) {
                    return d.options.leavingMessage;
                }
            });
        }
    };

    var setNamespacedEventTriggers = function(d) {
        d.form.find("input, select").on("change", function (e) {
            $(this).trigger(e.type + ".dirty");
        });

        d.form.find("input, textarea").on("keyup keydown blur", function(e) {
            $(this).trigger(e.type + ".dirty");
        });

        d.form.find("input[type=radio], input[type=checkbox]").on("click change blur", function(e) {
            $(this).trigger(e.type + ".dirty");
        });
    };

    var setNamespacedEvents = function(d) {
        d.form.find("input, select").on("change.dirty", function () {
            d.checkValues();
        });

        d.form.find("input, textarea").on("keyup.dirty keydown.dirty blur.dirty", function() {
            d.checkValues();
        });

        d.form.find("input[type=radio], input[type=checkbox]").on("click.dirty change.dirty blur.dirty", function() {
            d.checkValues();
        });

        d.form.on("dirty", function() {
            d.options.onDirty();
        });

        d.form.on("clean", function() {
            d.options.onClean();
        });
    };

    var clearNamespacedEvents = function(d) {
        d.form.find("input, select").off("change.dirty");

        d.form.find("input, textarea").off("keyup.dirty keydown.dirty blur.dirty");

        //fronteend's icheck support
        d.form.find("input[type=radio], input[type=checkbox]").off("click.dirty change.dirty blur.dirty");

        d.form.off("dirty");

        d.form.off("clean");
    };

    var Dirty = function(form, options) {
        this.form = form;
        this.isDirty = false;
        this.options = options;
        this.history = [clean, clean]; //Keep track of last statuses
        this.id = $(form).attr("id");
        singleDs.push(this);
    };

    Dirty.prototype = {
        init: function() {
            this.saveInitialValues();
            this.setEvents();
        },

        saveInitialValues: function() {
            this.form.find("input, select, textarea").each(function() {
                $(this).data(dataInitialValue, $(this).val());
            });

            this.form.find("input[type=checkbox], input[type=radio]").each(function() {
                var isChecked = $(this).is(":checked") ? "checked" : "unchecked";
                $(this).data(dataInitialValue, isChecked);
            });
        },

        refreshEvents: function () {
            var d = this;
            clearNamespacedEvents(d);
            setNamespacedEvents(d);
        },

        showDirtyFields: function() {
            var d = this;
            return d.form.find(":data('isDirty')");
        },

        setEvents: function() {
            var d = this;

            $(document).ready(function() {
                setSubmitEvents(d);
                setNamespacedEvents(d);
                setNamespacedEventTriggers(d);
            });
        },

        isFieldDirty: function($field) {
            var initialValue = $field.data(dataInitialValue);
            var currentValue = $field.val();

            // Boolean values can be encoded as "true/false" or "True/False" depending on underlying frameworks so we need a case insensitive comparison
            var boolRegex = /^(true|false)$/i;
            var isBoolValue = boolRegex.test(initialValue) && boolRegex.test(currentValue);
            if (isBoolValue) {
                var regex = new RegExp("^" + initialValue + "$", "i");
                return !regex.test(currentValue);
            }

            return currentValue !== initialValue;
        },

        isCheckboxDirty: function($field) {
            var initialValue = $field.data(dataInitialValue);
            var currentValue = $field.is(":checked") ? "checked" : "unchecked";

            return initialValue !== currentValue;
        },

        checkValues: function() {
            var d = this;

            this.form.find("input, select, textarea").each(function() {
                var thisIsDirty = d.isFieldDirty($(this));
                $(this).data(dataIsDirty, thisIsDirty);
            });
            this.form.find("input[type=checkbox], input[type=radio]").each(function() {
                var thisIsDirty = d.isCheckboxDirty($(this));
                $(this).data(dataIsDirty, thisIsDirty);
            });
            var isDirty = (this.form.find(":data('isDirty')").length > 0);

            if (isDirty) {
                d.setDirty();
            } else {
                d.setClean();
            }

            d.fireEvents();
        },

        fireEvents: function() {

            if (this.isDirty && this.wasJustClean()) {
                this.form.trigger("dirty");
            }

            if (!this.isDirty && this.wasJustDirty()) {
                this.form.trigger("clean");
            }
        },

        setDirty: function() {
            this.isDirty = true;
            this.history[0] = this.history[1];
            this.history[1] = dirty;
        },

        setClean: function() {
            this.isDirty = false;
            this.history[0] = this.history[1];
            this.history[1] = clean;
        },

        //Lets me know if the previous status of the form was dirty
        wasJustDirty: function() {
            return (this.history[0] === dirty);
        },

        //Lets me know if the previous status of the form was clean
        wasJustClean: function() {
            return (this.history[0] === clean);
        },

        setAsClean: function(){
            this.saveInitialValues();
            this.setClean();
        },

        resetForm: function(){
            this.form.find("input, select, textarea").each(function() {
                var value = $(this).data(dataInitialValue);
                $(this).val(value);
            });

            this.form.find("input[type=checkbox], input[type=radio]").each(function() {
                var initialCheckedState = $(this).data(dataInitialValue);
                var isChecked = initialCheckedState === "checked";

                $(this).prop("checked", isChecked);
            });

            this.checkValues();
        }
    };

    $.fn.dirty = function(options) {

        if (/^(isDirty|isClean|refreshEvents|resetForm|setAsClean|showDirtyFields)$/i.test(options)) {
            //Check if we have an instance of dirty for this form
            var d = getSingleton($(this).attr("id"));

            if (!d) {
                d = new Dirty($(this), options);
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
            case "showdirtyfields":
                return d.showDirtyFields();            
            }

        } else if (typeof options === "object" || !options) {

            return this.each(function() {
                options = $.extend({}, $.fn.dirty.defaults, options);
                var dirty = new Dirty($(this), options);
                dirty.init();
            });

        }
    };

    $.fn.dirty.defaults = {
        preventLeaving: false,
        leavingMessage: "There are unsaved changes on this page which will be discarded if you continue.",
        onDirty: function() {}, //This function is fired when the form gets dirty
        onClean: function () { } //This funciton is fired when the form gets clean again
    };

})(jQuery);
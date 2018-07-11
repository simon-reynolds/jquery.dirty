/// <reference path="./jquery.d.ts" />
/// <reference path="./jquery.dirty.d.ts" />

/** The Dirty class */
export class Dirty {

    private static singleDs : Dirty[] = [];

    private dirty = "dirty";
    private clean = "clean";
    private dataInitialValue = "dirtyInitialValue";
    private dataIsDirty = "isDirty";

    form: JQuery<HTMLFormElement>;
    isDirty: boolean;
    options: JqueryDirtyOptions;
    history: string[];
    id: string;
    submitting: boolean;
    /**
     *
     */
    constructor(form:JQuery<HTMLFormElement>, options:JqueryDirtyOptions) {
        this.form = form;
        this.isDirty = false;
        this.options = options;
        this.history = [this.clean, this.clean]; // keep track of last statuses
        this.id = $(form).attr("id");
        this.submitting = false;
        Dirty.singleDs.push(this);
    }

    public static DefaultOptions:JqueryDirtyOptions = {
            preventLeaving: false,
            leavingMessage: "There are unsaved changes on this page which will be discarded if you continue.",
            onDirty: $.noop, // this function is fired when the form gets dirty
            onClean: $.noop, // this funciton is fired when the form gets clean again
            fireEventsOnEachChange: false, // fire onDirty/onClean on each modification of the form
    };

    public static getSingleton = (id:string):Dirty => {
        Dirty.singleDs.forEach(e => {
            if (e.id === id) {
                return e;
            }
        });
        return null;
    }

    public init = () => {
        this.saveInitialValues();
        this.setEvents();
    }

    public getElementsInForm = ():(HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[] => {
        let elements:(HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[] = [];

        let inputs:NodeListOf<HTMLInputElement> = this.form[0].querySelectorAll("input");
        let selects:NodeListOf<HTMLSelectElement> = this.form[0].querySelectorAll("select");
        let textareas:NodeListOf<HTMLTextAreaElement> = this.form[0].querySelectorAll("textarea");

        for (let index:number = 0; index < inputs.length; index++) {
            elements.push(inputs[index]);
        }

        for (let index:number = 0; index < selects.length; index++) {
            elements.push(selects[index]);
        }

        for (let index:number = 0; index < textareas.length; index++) {
            elements.push(textareas[index]);
        }

        return elements;
    }

    public isRadioOrCheckbox = (el:HTMLInputElement) => {
        return ["radio", "checkbox"].some(e => e === el.type);
    }

    public isFileInput = (el:HTMLInputElement) => el.type === "file";

    public setSubmitEvents = () => {
        this.form.on("submit", () => this.submitting = true);

        if (this.options.preventLeaving) {
            $(window).on("beforeunload", () => {
                if (this.isDirty && !this.submitting) {
                    return this.options.leavingMessage;
                }
            });
        }
    }

    public setNamespacedEventTriggers = () => {
        this.form.find("input, select, textarea").on("change click keyup keydown blur", (e) => {
            $(this).trigger(e.type + ".dirty");
        });
    }

    public setNamespacedEvents = () => {
        this.form.find("input, select, textarea").on("change.dirty click.dirty keyup.dirty keydown.dirty blur.dirty", (e) => {
            this.checkValues(e);
        });

        this.form.on("dirty", () => this.options.onDirty());
        this.form.on("clean", () => this.options.onClean());
    }

    public clearNamespacedEvents = () => {
        this.form.find("input, select, textarea").off("change.dirty click.dirty keyup.dirty keydown.dirty blur.dirty");
        this.form.off("dirty");
        this.form.off("clean");
    }

    public saveInitialValues  = () => {
        this.getElementsInForm().forEach((e:HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {

            let isRadioOrCheckbox:boolean = this.isRadioOrCheckbox(<HTMLInputElement>e);
            let isFile:boolean = this.isFileInput(<HTMLInputElement>e);

            if (isRadioOrCheckbox) {
                let isChecked:string = $(e).is(":checked") ? "checked" : "unchecked";
                $(e).data(this.dataInitialValue, isChecked);
            } else if(isFile) {
                $(e).data(this.dataInitialValue, JSON.stringify((<HTMLInputElement>e).files));
            } else {
                $(e).data(this.dataInitialValue, $(e).val() || "");
            }
        });
    }

    public refreshEvents= () => {
        this.clearNamespacedEvents();
        this.setNamespacedEvents();
    }

    public showDirtyFields = (): (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[] => {
        return this.getElementsInForm().filter((e:HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
            return $(e).data("isDirty") as boolean;
        });
    }

    public setEvents = () => {
        this.setSubmitEvents();
        this.setNamespacedEvents();
        this.setNamespacedEventTriggers();
    }

    public isFieldDirty = (field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {

        let $field:JQuery = $(field);

        // explicitly check for null/undefined here as value may be `false`, so ($field.data(dataInitialValue) || '') would not work
        let initialValue:string = $field.data(this.dataInitialValue) as string;
        if (initialValue == null) { initialValue = ""; }

        let currentValue:string = $field.val() as string;
        if (currentValue == null) { currentValue = ""; }

        // boolean values can be encoded as "true/false" or "True/False" depending on underlying frameworks
        // we need a case insensitive comparison
        let boolRegex:RegExp = /^(true|false)$/i;
        let isBoolValue:boolean = boolRegex.test(initialValue) && boolRegex.test(currentValue);
        if (isBoolValue) {
            let regex:RegExp = new RegExp("^" + initialValue + "$", "i");
            return !regex.test(currentValue);
        }

        return currentValue !== initialValue;
    }

    public isFileInputDirty= (field: HTMLInputElement) => {
        let initialValue:string = $(field).data(this.dataInitialValue) as string;
        let currentValue:string = JSON.stringify(field.files);

        return currentValue !== initialValue;
    }

    public isCheckboxDirty= (field: HTMLInputElement) => {
        let initialValue:string = $(field).data(this.dataInitialValue) as string;
        let currentValue:string = field.checked ? "checked" : "unchecked";

        return initialValue !== currentValue;
    }

    public isElementDirty = (e: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {

        let thisIsDirty:boolean = false;

        let isInput:boolean = e instanceof HTMLInputElement;
        if (isInput) {
            let el:HTMLInputElement = <HTMLInputElement>e;
            let isRadioOrCheckbox:boolean = this.isRadioOrCheckbox(el);
            let isFile:boolean = this.isFileInput(el);


            if (isRadioOrCheckbox) {
                thisIsDirty = this.isCheckboxDirty(el);
            } else if (isFile) {
                thisIsDirty = this.isFileInputDirty(el);
            } else {
                thisIsDirty = this.isFieldDirty(e);
            }
        }

        return thisIsDirty;

    }

    public checkValues = (e?:JQuery.Event<HTMLElement, null>) => {

        let elements:(HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[] = this.getElementsInForm();

        elements.forEach((el) => {
            let thisIsDirty:boolean = this.isElementDirty(el);

            $(el).data(this.dataIsDirty, thisIsDirty);

            if (thisIsDirty) {
                this.setDirty();
            } else {
                this.setClean();
            }
        });

        if (e) {
            e.stopImmediatePropagation();
        }
    }

    setDirty = () => {
        this.isDirty = true;
        this.history[0] = this.history[1];
        this.history[1] = this.dirty;

        if (this.options.fireEventsOnEachChange || this.wasJustClean()) {
            this.form.trigger("dirty");
        }
    }

    setClean = () => {
        this.isDirty = false;
        this.history[0] = this.history[1];
        this.history[1] = this.clean;

        if (this.options.fireEventsOnEachChange || this.wasJustDirty()) {
            this.form.trigger("clean");
        }
    }

    public wasJustDirty = () => (this.history[0] === this.dirty);

    public wasJustClean = () => (this.history[0] === this.clean);

    public setAsClean = () => {
        this.saveInitialValues();
        this.setClean();
    }

    public setAsDirty = () => {
        this.saveInitialValues();
        this.setDirty();
    }

    public resetForm = () => {
        this.getElementsInForm().forEach((e:HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {

            let $e:JQuery<HTMLElement> = $(e);
            let isRadioOrCheckbox:boolean = this.isRadioOrCheckbox(<HTMLInputElement>e);
            let isFileInput:boolean = this.isFileInput(<HTMLInputElement>e);

            if (isRadioOrCheckbox) {
                let initialCheckedState:string = $e.data(this.dataInitialValue) as string;
                let isChecked:boolean = initialCheckedState === "checked";

                $e.prop("checked", isChecked);
            } else if(isFileInput) {
                let e1:HTMLInputElement = e as HTMLInputElement;
                e1.files = new FileList();
            } else {
                let value:string = $e.data(this.dataInitialValue) as string;
                $e.val(value);
            }
        });

        this.checkValues();
    }
}

/*
 * Dirty
 * jquery plugin to detect when a form is modified
 * (c) 2016 Simon Taite - https://github.com/simontaite/jquery.dirty
 * originally based on jquery.dirrty by Ruben Torres - https://github.com/rubentd/dirrty
 * Released under the MIT license
 */

$.fn.dirty = (options: string|JqueryDirtyOptions):any => {

    this.defaults = {
        preventLeaving: false,
        leavingMessage: "There are unsaved changes on this page which will be discarded if you continue.",
        onDirty: $.noop, //This function is fired when the form gets dirty
        onClean: $.noop, //This funciton is fired when the form gets clean again
        fireEventsOnEachChange: false, // Fire onDirty/onClean on each modification of the form
    };

    if ((options instanceof string) && /^(isDirty|isClean|refreshEvents|resetForm|setAsClean|setAsDirty|showDirtyFields)$/i.test(options)) {
        // check if we have an instance of dirty for this form
        // todo: check if this is DOM or jQuery object
        var d = Dirty.getSingleton($(this).attr("id"));

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
        case "setasdirty":
            return d.setAsDirty();
        case "showdirtyfields":
            return d.showDirtyFields();
        }

    } else if (typeof options === "object" || !options) {

        return this.each(function(_, e) {
            options = $.extend({}, $.fn.dirty.defaults, options);
            var dirty = new Dirty($(e), options);
            dirty.init();
        });

    }
};

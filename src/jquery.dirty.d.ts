interface JqueryDirtyOptions {
    preventLeaving?: boolean,
    leavingMessage?: string,
    onDirty?: (() => void),
    onClean?: (() => void),
    fireEventsOnEachChange?: boolean
}

// interface JqueryDirtyGlobalOptions {
//     /**
//      * Global options of the plugin.
//      */
//     DefaultOptions: JqueryDirtyOptions;
//   }

interface JqueryDirtyFunction {
    options : JqueryDirtyOptions
}

interface JQuery {
    dirty():JQuery;
    dirty(options:JqueryDirtyOptions):JQuery;
    dirty(arg:string):any;
}


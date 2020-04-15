interface JqueryDirtyOptions {
    preventLeaving?: boolean,
    leavingMessage?: string,
    onDirty?: (() => void),
    onClean?: (() => void),
    fireEventsOnEachChange?: boolean
}

interface JqueryDirtyFunction {
    options : JqueryDirtyOptions
}

interface JQuery {
    dirty():JQuery;
    dirty(options:JqueryDirtyOptions):JQuery;
    dirty(arg:string):any;
}


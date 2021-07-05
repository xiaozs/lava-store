import Vue from "vue";

export interface State<T> {
    value: T;
}

export interface ComputedOptions<T> {
    get: () => T;
    set: (val: T) => void;
}

export interface ReadonlyComputedOptions<T> {
    get: () => T;
}

export interface Computed<T> {
    value: T;
}

export interface ReadonlyComputed<T> {
    readonly value: T;
}

export interface AsyncComputedOption<T> {
    watch?: () => void;
    default: T | (() => T);
    get: () => Promise<T>;
}

export interface AsyncComputed<T> {
    readonly error: any | null;
    readonly loading: boolean;
    readonly value: Readonly<T>;
    reload(): Promise<T>;
}

export interface WatchOptions {
    immediate?: boolean;
    watch: () => void;
    handler: () => void;
}

export function getState<T>(value: T): State<T> {
    return Vue.observable({ value });
}

export function getComputed<T>(options: ComputedOptions<T>): Computed<T>;
export function getComputed<T>(options: ReadonlyComputedOptions<T>): ReadonlyComputed<T>;
export function getComputed<T>(options: ComputedOptions<T> | ReadonlyComputedOptions<T>): Computed<T> | ReadonlyComputed<T> {
    return new Vue({
        computed: {
            value: options
        }
    })
}

export function getAsyncComputed<T>(options: AsyncComputedOption<T>): AsyncComputed<T> {
    function getDefault() {
        return typeof options.default === "function"
            ? (options.default as () => T)()
            : options.default;
    }

    let res = new Vue({
        data() {
            return {
                error: null,
                loading: false,
                innerValue: getDefault(),
            }
        },
        computed: {
            value(): T {
                this.promise;
                return this.innerValue;
            },
            promise(): Promise<T> {
                return this.reload();
            }
        },
        methods: {
            async reload() {
                try {
                    this.innerValue = getDefault();
                    this.error = null;
                    this.loading = true;
                    options.watch?.();
                    return this.innerValue = await options.get();
                } catch (e) {
                    this.error = e;
                    throw e;
                } finally {
                    this.loading = false;
                }
            }
        }
    })
    return res;
}

export function watch(options: WatchOptions) {
    new Vue({
        watch: {
            changeFlag: {
                immediate: options.immediate,
                handler: options.handler
            }
        },
        computed: {
            changeFlag() {
                options.watch();
                return {};
            }
        }
    })
}
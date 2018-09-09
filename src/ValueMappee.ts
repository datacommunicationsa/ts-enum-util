import { createUnhandledEntryError } from "./createUnhandledEntryError";
import {
    ValueMapperCore,
    ValueMapper,
    ValueMapperWithNull,
    ValueMapperWithUndefined,
    ValueMapperWithNullAndUndefined
} from "./ValueMapper";
import { Symbols } from "./Symbols";

/**
 * A wrapper around an enum or string/number literal value to be mapped.
 * Do not use this class directly. Use the {@link $enum.mapValue} function to
 * get an instance of this class.
 *
 * @template E - An enum or string/number literal type.
 */
export class ValueMappee<E extends string | number> {
    /**
     * Do not use this constructor directly. Use the {@link $enum.mapValue}
     * function to get an instance of this class.
     * @param value - The value to be wrapped by this "mappee".
     */
    public constructor(private readonly value: E) {}

    /**
     * Maps the wrapped value using the supplied mapper.
     * Returns the value of the mapper's property whose name matches the wrapped
     * value.
     *
     * @template T - The data type that the enum or string/number literal value
     *           will be mapped to.
     *
     * @param mapper - A mapper implementation for type E that returns type T.
     * @returns The mapped value from the mapper.
     */
    public with<T>(mapper: ValueMapper<E, T>): T {
        if (mapper.hasOwnProperty(this.value)) {
            return processEntry<T>(
                (mapper as ValueMapperCore<E, T>)[this.value],
                this.value
            );
        } else if (mapper.hasOwnProperty(Symbols.handleUnexpected)) {
            return processEntry(mapper[Symbols.handleUnexpected]!, this.value);
        } else {
            throw new Error(`Unexpected value: ${this.value}`);
        }
    }
}

/**
 * A wrapper around an enum or string/number literal value to be mapped.
 * For values that may be null.
 * Do not use this class directly. Use the {@link $enum.mapValue} function to
 * get an instance of this class.
 *
 * NOTE: At run time, this class is used by {@link $enum.mapValue} ONLY for
 *       handling null values.
 *       {@link ValueMappee} contains the core run time implementation that is
 *       applicable to all "ValueMappee" classes.
 *
 * @template E - An enum or string/number literal type.
 */
export class ValueMappeeWithNull<E extends string | number> {
    /**
     * Maps the wrapped value using the supplied mapper.
     * If the wrapped value is null, returns the mapper's
     * {@link Symbols.handleNull} value.
     * Otherwise, returns the value of the mapper's property whose name matches
     * the wrapped value.
     *
     * @template T - The data type that the enum or string/number literal value
     *           will be mapped to.
     *
     * @param mapper - A mapper implementation for type E that returns type T.
     * @returns The mapped value from the mapper.
     */
    public with<T>(mapper: ValueMapperWithNull<E, T>): T {
        // This class is used at run time for mapping null values regardless of
        // the compile time type being visited, so we actually have to check if
        // handleNull exists.
        if (mapper.hasOwnProperty(Symbols.handleNull)) {
            return processEntry(mapper[Symbols.handleNull], null);
        } else if (mapper.hasOwnProperty(Symbols.handleUnexpected)) {
            return processEntry(mapper[Symbols.handleUnexpected]!, null);
        } else {
            throw new Error(`Unexpected value: null`);
        }
    }
}

/**
 * A wrapper around an enum or string/number literal value to be mapped.
 * For values that may be undefined.
 * Do not use this class directly. Use the {@link $enum.mapValue} function to
 * get an instance of this class.
 *
 * NOTE: At run time, this class is used by {@link $enum.mapValue} ONLY for
 *       handling undefined values.
 *       {@link ValueMappee} contains the core run time implementation that is
 *       applicable to all "ValueMappee" classes.
 *
 * @template E - An enum or string/number literal type.
 */
export class ValueMappeeWithUndefined<E extends string | number> {
    /**
     * Maps the wrapped value using the supplied mapper.
     * If the wrapped value is undefined, returns the mapper's
     * {@link Symbols.handleUndefined} value.
     * Otherwise, returns the value of the mapper's property whose name matches
     * the wrapped value.
     *
     * @template T - The data type that the enum or string/number literal value
     *           will be mapped to.
     *
     * @param mapper - A mapper implementation for type E that returns type T.
     * @returns The mapped value from the mapper.
     */
    public with<T>(mapper: ValueMapperWithUndefined<E, T>): T {
        // This class is used at run time for mapping undefined values
        // regardless of the compile time type being visited, so we actually
        // have to check if handleUndefined exists.
        if (mapper.hasOwnProperty(Symbols.handleUndefined)) {
            return processEntry(mapper[Symbols.handleUndefined], undefined);
        } else if (mapper.hasOwnProperty(Symbols.handleUnexpected)) {
            return processEntry(mapper[Symbols.handleUnexpected]!, undefined);
        } else {
            throw new Error(`Unexpected value: undefined`);
        }
    }
}

/**
 * A wrapper around an enum or string/number literal value to be mapped.
 * For values that may be null and undefined.
 * Do not use this class directly. Use the {@link $enum.mapValue} function to
 * get an instance of this class.
 *
 * NOTE: No run time implementation of this class actually exists. This is only
 *       used for compile-time typing.
 *       {@link ValueMappee} contains the core run time implementation that is
 *       applicable to all "ValueMappee" classes, while
 *       {@link ValueMappeeWithNull} and {@link ValueMappeeWithUndefined}
 *       are used at run time to handle null and undefined values.
 *
 * @template E - An enum or string/number literal type.
 */
export declare class ValueMappeeWithNullAndUndefined<
    E extends string | number
> {
    /**
     * Maps the wrapped value using the supplied mapper.
     * If the wrapped value is null, returns the mapper's
     * {@link Symbols.handleNull} value.
     * If the wrapped value is undefined, returns the mapper's
     * {@link Symbols.handleUndefined} value.
     * Otherwise, returns the value of the mapper's property whose name matches
     * the wrapped value.
     *
     * @template T - The data type that the enum or string/number literal value
     *           will be mapped to.
     *
     * @param mapper - A mapper implementation for type E that returns type T.
     * @returns The mapped value from the mapper.
     */
    public with<T>(mapper: ValueMapperWithNullAndUndefined<E, T>): T;
}

/**
 * Common implementation for processing an entry of a value mapper.
 * @param entry - Either the mapped value entry, or {@link Symbols.unhandledEntry}.
 * @param value - The value being mapped.
 * @return The provided entry, if it is not an unhandledEntry.
 * @throws {Error} If the provided entry is an unhandledEntry.
 */
function processEntry<T>(
    entry: T | typeof Symbols.unhandledEntry,
    value: string | number | null | undefined
): T {
    if (entry === Symbols.unhandledEntry) {
        throw createUnhandledEntryError(value);
    } else {
        return entry;
    }
}

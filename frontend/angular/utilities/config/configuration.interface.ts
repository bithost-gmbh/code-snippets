/**
 * Interface that defines app configuration options.
 * Can be extended in the client app as follows:
 *  @see https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 *
 * // custom-configuration.interface.ts
 * import { Configuration } from 'lsg-ext/features/helper-services/config/configuration.interface';
 * export { Configuration };
 *
 * // extend the base configuration with our app configuration
 * declare module 'lsg-ext/features/helper-services/config/configuration.interface' {
 *  export interface Configuration {
 *    // whether the mega mode is enabled
 *    mega: boolean;
 *    // cheese configuration
 *    cheese: {
 *     // taste of the cheese
 *     taste: string;
 *     // color of the cheese. in RGB
 *     color: string;
 *    }
 *  }
 * }
 *
 * // custom-configuration.ts
 *
 * // make sure to import from your custom-configuration file in order to make the compiler aware
 * // of your module augmentation and prevent loss by tree-shaking
 * // this is particularly important for unit-tests
 * import { Configuration } from './custom-configuration.interface';
 *
 * export const APP_CONFIGURATION: Configuration = {
 *   environment: 'dev',
 *   mega: false,
 *   cheese: {
 *     taste: 'strong',
 *     color: '#e3e1b7',
 *   }
 * };
 *
 *
 * // custom-override-configuration.ts
 * import { OverrideConfiguration } from 'lsg-ext';
 *
 *  export const APP_CONFIGURATION_INT: OverrideConfiguration = {
 *   environment: 'int',
 *   cheese: {
 *     taste: 'herb',
 *   }
 * };
 *
 */
export interface Configuration {
  /** Current environment */
  environment: string;
}


/**
 * Recursively make all properties in T optional
 * @see https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

/**
 * Same as Configuration but with all attributes optional (recursively).
 * Can be used for environment-specific configuration overrides
 */
export type OverrideConfiguration = RecursivePartial<Configuration>;


import { Injectable } from '@angular/core';
import { Configuration, OverrideConfiguration } from './configuration.interface';

/**
 * Config service for managing the application configuration.
 * The configuration is stored statically.
 *
 * Usage:
 *
 * ConfigService.initializeConfiguration(APP_CONFIGURATION);
 * if(environment.environment === 'prod') {
 *    ConfigService.extendConfiguration(APP_CONFIGURATION_PROD);
 * }
 *
 * The Configuration interface can be extended by the application.
 * @see configuration.interface.ts
 */
@Injectable()
export class ConfigService {

  /** Application configuration */
  private static config: Configuration = null;

  /**
   * Initializes the application configuration
   * @param configuration
   */
  public static initializeConfiguration(configuration: Configuration) {
    ConfigService.config = configuration;
  }

  /**
   * Extends the application configuration
   * @param configuration
   */
  public static extendConfiguration(configuration: OverrideConfiguration) {
    this.recursivelyCopyObject(configuration, ConfigService.config, true);
  }

  /**
   * Returns the application configuration
   */
  public static getConfiguration(): Configuration {
    return ConfigService.config;
  }

  /**
   * Recursively copies properties of an source object to a target object
   * @param source object
   * @param target object
   * @param overwrite whether a property should be overwritten if it exists on the target
   */
  public static recursivelyCopyObject(source: any, target: any, overwrite = false): void {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        // if we want to overwrite an already existing key or the key does not exist yet
        if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target.hasOwnProperty(key)) {
            target[key] = {};
          }
          this.recursivelyCopyObject(source[key], target[key], overwrite);
        } else if (overwrite || !target.hasOwnProperty(key)) {
          target[key] = source[key];
        }
      }
    }
  }

  constructor() {

  }


  /**
   * Initializes the application configuration
   * @param configuration
   */
  public initializeConfiguration(configuration: Configuration) {
    ConfigService.initializeConfiguration(configuration);
  }

  /**
   * Extends the application configuration
   * @param configuration
   */
  public extendConfiguration(configuration: OverrideConfiguration) {
    ConfigService.extendConfiguration(configuration);
  }

  /**
   * Returns the application configuration
   */
  public getConfiguration(): Configuration {
    return ConfigService.getConfiguration();
  }

}

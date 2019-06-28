import { TestBed, inject } from '@angular/core/testing';

import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let config;
  let configService: ConfigService;
  let staticSpies;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfigService]
    });
    configService = TestBed.get(ConfigService);
    staticSpies = {
      'initializeConfiguration': spyOn(ConfigService, 'initializeConfiguration').and.callThrough(),
      'extendConfiguration': spyOn(ConfigService, 'extendConfiguration').and.callThrough()
    };

    config = {
      environment: 'dev',
      mega: true,
      cheese: {
        tasty: true,
        color: 'red',
        shapes: ['circle', 'donut']
      }
    };

    configService.initializeConfiguration(null);
    expect(configService.getConfiguration()).toBeNull();

    staticSpies.initializeConfiguration.calls.reset();
    staticSpies.extendConfiguration.calls.reset();
  });

  it('should be created', inject([ConfigService], (service: ConfigService) => {
    expect(service).toBeTruthy();
  }));

  it('should initialize the configuration', () => {

    // get the configuration and compare it to the expected value
    configService.initializeConfiguration(config);
    expect(configService.getConfiguration()).toEqual(config);
    expect(ConfigService.getConfiguration()).toEqual(config);

    // check static wiring
    expect(staticSpies.initializeConfiguration).toHaveBeenCalledTimes(1);
    expect(staticSpies.initializeConfiguration).toHaveBeenCalledWith(config);

  });

  it('should extend the configuration', () => {

    // initialize the configuration
    configService.initializeConfiguration(config);

    // check the initial configuration
    let finalConfig: any = configService.getConfiguration();
    expect(configService.getConfiguration()).toEqual(config);
    expect(finalConfig.environment).toBe('dev');
    expect(finalConfig.mega).toBe(true);
    expect(finalConfig.cheese.tasty).toBe(true);
    expect(finalConfig.cheese.color).toBe('red');
    expect(finalConfig.cheese.origin).not.toBeDefined();

    // extend the configuration
    const extendedConfig: any = {
      mega: false,
      cheese: {
        color: 'blue',
        origin: 'FR'
      }
    };
    configService.extendConfiguration(extendedConfig);

    // check the final configuration
    finalConfig = configService.getConfiguration();
    expect(finalConfig.environment).toBe('dev');
    expect(finalConfig.mega).toBe(false);
    expect(finalConfig.cheese.tasty).toBe(true);
    expect(finalConfig.cheese.color).toBe('blue');
    expect(finalConfig.cheese.origin).toBe('FR');

    // check static wiring
    expect(staticSpies.extendConfiguration).toHaveBeenCalledTimes(1);
    expect(staticSpies.extendConfiguration).toHaveBeenCalledWith(extendedConfig);

  });

  it('should extend the configuration with array values', () => {

    // initialize the configuration
    configService.initializeConfiguration(config);

    // check the initial configuration
    let finalConfig: any = configService.getConfiguration();
    expect(configService.getConfiguration()).toEqual(config);
    expect(finalConfig.environment).toBe('dev');
    expect(finalConfig.cheese.color).toEqual('red');
    expect(finalConfig.cheese.shapes).toEqual(['circle', 'donut']);

    // extend the configuration with an array value
    const extendedConfig: any = {
      cheese: {
        shapes: ['square', 'cube']
      }
    };
    configService.extendConfiguration(extendedConfig);

    // check the extended configuration
    finalConfig = configService.getConfiguration();
    expect(finalConfig.environment).toBe('dev');
    expect(finalConfig.cheese.color).toEqual('red');
    expect(finalConfig.cheese.shapes).toEqual(['square', 'cube']);

  });


});

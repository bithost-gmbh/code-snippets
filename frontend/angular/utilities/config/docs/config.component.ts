import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lsg-ext-config-doc',
  templateUrl: './config.component.html',
})
export class ConfigComponent implements OnInit {

  docConfigurationInterface =
`// config/configuration.interface.ts

import { Configuration } from 'lsg-ext/features/helper-services/config/configuration.interface';
export { Configuration };

// extend the base configuration interface with our app configuration interface
// see https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
declare module 'lsg-ext/features/helper-services/config/configuration.interface' {
  export interface Configuration {
    mega: boolean;
    cheese: {
      apiUrl: string;
      bla: boolean;
    };
  }
}`;

  docConfig =
`// config/config.ts

// make sure to import from your custom-configuration file in order to make the compiler aware
// of your module augmentation and prevent loss by tree-shaking.
// this is particularly important for unit-tests
import { Configuration } from './configuration.interface';

export const APP_CONFIGURATION: Configuration = {
  environment: 'dev',
  mega: false,
  cheese: {
    apiUrl: 'my.dev.host/api/cheese',
    bla: true,
  }
};`;

  docConfigProd =
`// config-prod.ts

import { OverrideConfiguration } from 'lsg-ext';

export const APP_CONFIGURATION_PROD: OverrideConfiguration = {
  environment: 'prod',
  cheese: {
    apiUrl: 'my.prod.host/api/cheese',
  }
};`;

  docMain =
`// src/main.ts

import { ConfigService } from 'lsg-ext';
// import the environment.ts file set by angular-cli
import { environment } from './environments/environment';

import { APP_CONFIGURATION } from './config/config';
import { APP_CONFIGURATION_PROD } from './app/config/config-prod';
import { APP_CONFIGURATION_TEST } from './app/config/config-test';
import { APP_CONFIGURATION_LOCAL } from './app/config/config-local';

...

ConfigService.initializeConfiguration(APP_CONFIGURATION);

if (environment.environment === 'prod') {
  ConfigService.extendConfiguration(APP_CONFIGURATION_PROD);
} else if (environment.environment === 'test') {
  ConfigService.extendConfiguration(APP_CONFIGURATION_TEST);
} else if (environment.environment === 'local') {
  ConfigService.extendConfiguration(APP_CONFIGURATION_LOCAL);
}

platformBrowserDynamic().bootstrapModule(AppModule)
.catch(err => console.log(err));`;

  docExample =
`import { ConfigService } from 'lsg-ext';
...
class MyComponent {
  constructor(private configService: ConfigService) {
    console.log(
      this.configService.getConfiguration().environment,
      this.configService.getConfiguration().mega,
      this.configService.getConfiguration().cheese.bli
    )
  }
}`;

  docEnvironmentsUnitTesting =
`{
  ...
  "apps": [
    {
      ...
      "environments": {
        ...
        "unit-test": "environments/environment.unit-test.ts"
      }
    }
  ],
  ...
}`;

  docTestTs =
`// src/test.ts

...
import { environment } from "./environments/environment";
import { ConfigService } from "lsg-ext";
import { APP_CONFIGURATION } from "./app/core/configuration/config";
import { APP_CONFIGURATION_LOCAL } from "./app/core/configuration/config-local";
import { APP_CONFIGURATION_TEST } from "./app/core/configuration/config-test";
import { APP_CONFIGURATION_PROD } from "./app/core/configuration/config-prod";
import { APP_CONFIGURATION_UNIT_TEST } from './app/core/configuration/config-unit-test';

...
// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

ConfigService.initializeConfiguration(APP_CONFIGURATION);
// apply environment "unit-test" if environment not explicitly set to 'prod', 'test' or 'local'
if (['prod', 'test', 'local'].indexOf(environment.environment) === -1) {
  ConfigService.extendConfiguration(APP_CONFIGURATION_UNIT_TEST);
}

if (environment.environment === 'prod') {
  ConfigService.extendConfiguration(APP_CONFIGURATION_PROD);
} else if (environment.environment === 'test') {
  ConfigService.extendConfiguration(APP_CONFIGURATION_TEST);
} else if (environment.environment === 'local') {
  ConfigService.extendConfiguration(APP_CONFIGURATION_LOCAL);
}

// Then we find all the tests.
const context = require.context('./', true, /\\.spec\\.ts$/);
...`;

  doc_4_1_0_importOld = `import { Configuration } from 'lsg-ext/lib/features/helper-services/config/configuration.interface';`;
  doc_4_1_0_importNew = `import { Configuration } from 'lsg-ext/features/helper-services/config/configuration.interface';`;


  docMethodsInitializeConfiguration = 'public initializeConfiguration(configuration: Configuration)';
  docMethodsExtendConfiguration = 'public extendConfiguration(configuration: OverrideConfiguration)';
  docMethodsGetConfiguration = 'public getConfiguration(): Configuration';

  constructor() {
  }

  ngOnInit() {
  }

}

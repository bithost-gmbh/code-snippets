import { Component, OnInit } from '@angular/core';

/* tslint:disable:no-trailing-whitespace max-line-length */

@Component({
  selector: 'lsg-ext-swagger',
  templateUrl: './swagger.component.html',
})
export class SwaggerComponent implements OnInit {

  docExampleYaml =
`swagger: '2.0'

# Path API Definitions
paths:
  /bank:
    get:
      tags:
        - alm-kalkulation
      summary: 'List all banks available'
      parameters:
        - $ref: '#/parameters/searchKeyword'
      responses:
        200:
          description: 'Successful operation'
          schema:
            type: array
            items:
              $ref: '#/definitions/Bank'

# Data models
definitions:
  Bank:
    type: object
    description: 'Bank information'
    properties: 
      sitzCode:
        type: string
        description: 'related bank sitz code'
      name:
        type: string
        description: 'Name of the bank'

# Reusable Parameters
parameters:
  searchKeyword:
    name: searchKeyword
    in: query
    description: 'search keyword'
    required: false
    type: string
  `;

  docExampleGeneratedCodeFrontend =
`@Injectable()
export class AlmKalkulationService {
    ...
    /**
     * List all banks available
     * 
     * @param searchKeyword search keyword
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public bankGet(searchKeyword?: string, observe?: 'body', reportProgress?: boolean): Observable<Array<Bank>>;
    {
      ...
    }
}

/**
 * Bank information
 */
export interface Bank {
    /**
     * related bank sitz code
     */
    sitzCode?: string;
    /**
     * Name of the bank
     */
    name?: string;
}
`;

  docExampleGeneratedCodeBackend =
`public interface BankApi {

    @ApiOperation(value = "List all banks available", nickname = "bankGet", notes = "", response = Bank.class, responseContainer = "List", tags={ "alm-kalkulation", })
    @ApiResponses(value = { 
        @ApiResponse(code = 200, message = "Successful operation", response = Bank.class, responseContainer = "List") })
    @RequestMapping(value = "/bank",
        produces = { "application/json" }, 
        method = RequestMethod.GET)
    ResponseEntity<List<Bank>> bankGet(@ApiParam(value = "search keyword") @Valid @RequestParam(value = "searchKeyword", required = false) String searchKeyword);

}


public class Bank   {
  @JsonProperty("sitzCode")
  private String sitzCode = null;

  @JsonProperty("name")
  private String name = null;
  ...
}
`;

  docExampleYamlInfo =
`swagger: '2.0'

# General Configuration
info:
  description: >-
    This is the REST API for the Tool.
  version: 1.0.0
  title: Tool API
host: localhost:8080 # for testing the api with swagger editor
basePath: /v1
tags:
  - name: alm-kalkulation
    description: 'Analysis set for a specific balance sheet date'
  - name: management-summary
    description: 'Management Summary Data'
schemes:
  - http

# Path API Definitions
paths:
  ...`;

  docExampleReference =
`# Data models
definitions:
  Bank:
    $ref: './models/Bank.yml'`;

  docExampleBankModel =
`# Bank
type: object
description: 'Bank information'
properties: 
  sitzCode:
    type: string
    description: 'related bank sitz code'
  name:
    type: string
    description: 'Name of the bank'`;

  docExamplePackageJson =
`{
  "scripts": {
    "api-bundle": "node node_modules/lsg-ext/utils/swagger/run.js bundle -f src/main/resources/api/api-definition.yml",
    "api-bundle-watch": "watch-run -p \\"src/main/resources/api/src/**/*.yml\\" \\"npm run api-bundle\\" ",
    "api-server": "node node_modules/lsg-ext/utils/swagger/run.js server -f src/main/resources/api/src/api-definition.yml",
    "api-generate": "npm run api-bundle && mvn clean install -Popenapi-generator -DskipTests"
  }
}`;

  docExamplePom =
`<project>
  ...
  <dependencies>
    ...
    <dependency>
      <groupId>io.springfox</groupId>
      <artifactId>springfox-swagger2</artifactId>
      <version>2.7.0</version>
    </dependency>
    
  </dependencies>

  <profiles>
    <profile>
      <id>openapi-generator</id>
      <build>
        <plugins>
          <plugin>
            <groupId>org.openapitools</groupId>
            <artifactId>openapi-generator-maven-plugin</artifactId>
            <version>3.0.0</version>
            <executions>
              <execution>
                <id>V1-Backend</id>
                <goals>
                  <goal>generate</goal>
                </goals>
                <configuration>
                  <inputSpec>\${basedir}/src/main/resources/api/dist/api-definition.bundle.yml</inputSpec>
                  <language>spring</language>
                  <output>\${basedir}</output>
                  <modelPackage>ch.dummy.alm.model.generated</modelPackage>
                  <apiPackage>ch.dummy.alm.resource.generated</apiPackage>
                  <addCompileSourceRoot>false</addCompileSourceRoot>
                  <configHelp>false</configHelp>
                  <configOptions>
                    <generateSupportingFiles>false</generateSupportingFiles>
                    <generateApiTests>false</generateApiTests>
                    <!-- used to group into classes -->
                    <useTags>true</useTags>
                    <generateApiDocumentation>false</generateApiDocumentation>
                    <generateModelDocumentation>false</generateModelDocumentation>
                    <hideGenerationTimestamp>true</hideGenerationTimestamp>
                    <sourceFolder>src/main/java</sourceFolder>
                    <dateLibrary>java8-localdatetime</dateLibrary>
                    <!-- Set this to true if you want to generate the controllers, too-->
                    <interfaceOnly>true</interfaceOnly>
                  </configOptions>
                </configuration>
              </execution>
              <execution>
                <id>V1-Frontend</id>
                <goals>
                  <goal>generate</goal>
                </goals>
                <configuration>
                  <inputSpec>\${basedir}/src/main/resources/api/dist/api-definition.bundle.yml</inputSpec>
                  <language>typescript-angular</language>
                  <!--Set the path to the frontend repository -->
                  <output>\${basedir}/../my-app/src/app/core/services/backend-api/generated</output>
                  <configOptions>

                  </configOptions>
                </configuration>
              </execution>
            </executions>
          </plugin>
        </plugins>
      </build>
    </profile>
  </profiles>
</project>
`;

  docExampleRestController =
`package ch.dummy.alm.resource;

@RestController
public class AlmKalkulationApiCtrl implements AlmKalkulationApi {

    @Inject
    private AlmKalkulationService almKalkulationService;

    /**
     * List all Banks
     * @return
     */
    @Override
    public ResponseEntity<List<Bank>> bankGet(@ApiParam(value = "search keyword") @Valid @RequestParam(value = "searchKeyword", required = false) String searchKeyword) {
      return ResponseEntity.ok(almKalkulationService.getAllBanks(searchKeyword));
    }

}`;

  docExampleImportModule =
`import { ApiModule, Configuration } from './services/backend-api/generated';

export function apiConfigurationFactory(configService: ConfigService): Configuration {
  return new Configuration({
    basePath: configService.getConfiguration().apiBaseUrl
  });
}

@NgModule({
  imports: [
    ...
    ApiModule,
    HttpClientModule
  ],
  providers: [
    ...
    { provide: Configuration, useFactory: apiConfigurationFactory, deps: [ConfigService] }
  ]
  ...
})
export class CoreModule {}`;

  docExampleFrontendService =
`export class MyComponent {
  constructor(almKalkulationService: AlmKalkulationService) {
    almKalkulationService.bankGet('Basel').subscribe((banks: Bank[]) => {
      console.log(banks);
    });
  }
}`;

  docExampleEnumParameter =
`
parameters:
  hedgingType:
    name: hedgingType
    in: query
    description: 'the hedging type'
    required: true
    type: string
    enum:
      - Hedged
      - Unhedged
      - HedgedAndSimulated`;

  docExampleBundleScriptWithDistFolder =
    `node node_modules/lsg-ext/utils/swagger/run.js bundle -f src/main/resources/api/api-definition.yml -d ../dist/admin`;

  constructor() { }

  ngOnInit() {
  }

}

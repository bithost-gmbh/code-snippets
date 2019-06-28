package ch.dummy.test.utils;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.web.client.RestTemplate;

import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

public class AllApiTests {

    @LocalServerPort
    private int port;
    private Logger logger = LoggerFactory.getLogger(this.getClass());
    private RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private TestDataService testDataService;

    @Autowired
    private String mockData;
    private Map<String, Object> mockDataMap;

    @Before
    public void init() throws Exception {
        mockDataMap = new ObjectMapper().readValue(mockData, new TypeReference<HashMap<String, Object>>(){});
        mockDataDynamicMap = new ObjectMapper().readValue(mockDataDynamic, new TypeReference<HashMap<String, Object>>(){});
        mockDataPlanningAssumptionsMap = new ObjectMapper().readValue(mockDataPlanningAssumptions, new TypeReference<HashMap<String, Object>>(){});
    }

    @Test
    public void runAllApiTests() throws Exception {
        runApiTests(mockDataMap);
        runApiTests(mockDataDynamicMap);
        runApiTests(mockDataPlanningAssumptionsMap);
    }

    private void runApiTests(Map<String, Object> mockDataMap) throws Exception {
        testDataService.clearTestMaps();
        String baseUrl = String.format("http://localhost:%d/v1", port);
        for (String path : mockDataMap.keySet()) {
            if (path.equals("__dummy__")) {
                continue;
            }
            String url = baseUrl + path;
            logger.info("testing: " + url);
            String actualResult = restTemplate.getForEntity(URLDecoder.decode(baseUrl + path, "UTF-8"), String.class).getBody();
            testDataService.compareWithExpectedResult(actualResult, path);
        }
        printSummary();
        Assert.assertEquals(0, testDataService.getFailedTests().size());
    }

    private void printSummary() {
        StringBuilder sb = new StringBuilder();
        if (testDataService.getSuccessfullTests().size() > 0) {
            sb.append("\nSUCCESSFUL\n");
            testDataService.getSuccessfullTests().keySet().forEach(key -> sb.append(key).append("\n"));
        }
        if (testDataService.getFailedTests().size() > 0) {
            sb.append("\n\nFAILED\n");
            testDataService.getFailedTests().keySet().forEach(key -> sb.append(key).append("\n"));
        }
        logger.info(sb.toString());
    }

}

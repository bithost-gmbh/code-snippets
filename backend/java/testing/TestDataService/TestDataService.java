package ch.dummy.test.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.*;

import static junit.framework.TestCase.fail;
import static junit.framework.TestCase.format;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

@Component
public class TestDataService {

    @Autowired
    private String mockData;

    @Autowired
    private String mockData2;

    private Map<Object, Object> mockDataMap;
    private Map<String, Object> successfullTests = new HashMap<>();
    private Map<String, Object> failedTests = new HashMap<>();

    private Logger logger = LoggerFactory.getLogger(TestDataService.class.getName());

    private ObjectMapper mapper = new ObjectMapper()
            .enable(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS);

    private BigDecimal epsilon = new BigDecimal(1e-6);

    @PostConstruct
    private void init() throws Exception {
        HashMap<String, Object> tmpMockDataMap = mapper.readValue(mockData, new TypeReference<HashMap<String, Object>>() {});
        HashMap<String, Object> tmpmockData2Map = mapper.readValue(mockData2, new TypeReference<HashMap<String, Object>>() {});
        HashMap<Object, Object> combinedMockDataMap = new HashMap<>();
        combinedMockDataMap.putAll(tmpMockDataMap);
        combinedMockDataMap.putAll(tmpmockData2Map);
        mockDataMap = combinedMockDataMap;
    }

    public void compareWithExpectedResult(String actualResult, String path) throws Exception {
        try {
            if (actualResult.startsWith("[")) {
                List<Object> expectedResult = (List<Object>) mockDataMap.get(path);
                Map<Object, Object>[] actualResultO = mapper.readValue(actualResult, new TypeReference<HashMap<Object, Object>[]>() {
                });
                List<Object> actualList = Arrays.asList(actualResultO);

                assertEqualsListEpsilon("FAILED: " + path, expectedResult, actualList, epsilon);

            } else if (actualResult.startsWith("{")) {
                Map<Object, Object> expectedResult = (Map<Object, Object>) mockDataMap.get(path);
                assertEqualsMapEpsilon("FAILED: " + path,
                        expectedResult,
                        (Map<Object, Object>) mapper.readValue(actualResult, new TypeReference<HashMap<Object, Object>>() {}),
                        epsilon
                );
            // For primitive types, where neither an array or an object is returned
            } else {
                Object obj = mockDataMap.get(path);

                if (obj instanceof Number) {
                    assertEqualsObjectEpsilon("FAILED: " + path,
                            obj,
                            mapper.readValue(actualResult, new TypeReference<Number>() {}),
                            epsilon
                    );
                } else {
                    assertEqualsObjectEpsilon("FAILED: " + path,
                            obj,
                            mapper.readValue(actualResult, new TypeReference<String>() {}),
                            epsilon
                    );
                }
            }
            successfullTests.put(path, actualResult);
        }
        catch(Throwable e){
            logger.error("FAILED: " + path, e);
            logger.error("Got " + actualResult);
            failedTests.put(path, e);
        }
    }

    /**
     * Asserts two maps are equal. big decimal values are compared with a relative epsilon
     * @param message failure message
     * @param expected expected value
     * @param actual actual value
     * @param epsilon relative epsilon.
     *                the difference between the actual value
     *                and the expected value divided by the expected value
     *                needs to be smaller than the relative epsilon
     */
    public static void assertEqualsMapEpsilon(String message, Map<Object,Object> expected, Map<Object,Object> actual, BigDecimal epsilon) {
        assertEquals(expected.size(), actual.size());
        for(Map.Entry<Object,Object> expectedValue:expected.entrySet()){
            Object actualValue = actual.get(expectedValue.getKey());
            assertEqualsObjectEpsilon(
                message.concat(" map value differs for key \"").concat((String)expectedValue.getKey()).concat("\"")
                        .concat(", expected ").concat(expected.toString()).concat(" but got ").concat(actual.toString()),
                expectedValue.getValue(),
                actualValue,
                epsilon
            );
        }
    }

    /**
     * Asserts two lists are equal. big decimal values are compared with a relative epsilon
     * @param message failure message
     * @param expected expected value
     * @param actual actual value
     * @param epsilon relative epsilon.
     *                the difference between the actual value
     *                and the expected value divided by the expected value
     *                needs to be smaller than the relative epsilon
     */
    public static void assertEqualsListEpsilon(String message, List<Object> expected, List<Object> actual, BigDecimal epsilon) {
        assertEquals(expected.size(), actual.size());
        int i = 0;
        for(Object expectedValue:expected){
            Object actualValue = actual.get(i);
            assertEqualsObjectEpsilon(
                message.concat(" List differs "),
                expectedValue,
                actualValue,
                epsilon
            );
            ++i;
        }
    }


    /**
     * Asserts two objects are equal. big decimal values are compared with a relative epsilon
     * @param message failure message
     * @param expected expected value
     * @param actual actual value
     * @param epsilon relative epsilon.
     *                the difference between the actual value
     *                and the expected value divided by the expected value
     *                needs to be smaller than the relative epsilon
     */
    public static void assertEqualsObjectEpsilon(String message, Object expected, Object actual, BigDecimal epsilon) {
        if (expected != null) {
            assertNotNull(message, actual);
        }

        if (expected instanceof BigDecimal) {
            assertEqualsBigDecimalEpsilon(
                    message,
                    (BigDecimal)expected,
                    (BigDecimal)actual,
                    epsilon
            );
        } else if (expected instanceof Map) {
            assertEqualsMapEpsilon(message, (Map<Object, Object>) expected, (Map<Object, Object>) actual, epsilon);
        } else if (expected instanceof List) {
            assertEqualsListEpsilon(message, (List<Object>)expected, (List<Object>)actual, epsilon);
        } else {
            assertEquals(message, expected, actual);
        }
    }

    /**
     * Asserts two decimal values are equal. big decimal values are compared with a relative epsilon
     * @param message failure message
     * @param expected expected value
     * @param actual actual value
     * @param epsilon relative epsilon.
     *                the difference between the actual value
     *                and the expected value divided by the expected value
     *                needs to be smaller than the relative epsilon
     */
    public static void assertEqualsBigDecimalEpsilon(String message, BigDecimal expected, BigDecimal actual, BigDecimal epsilon) {
        BigDecimal difference = expected.subtract(actual).abs();

        // calculate relative difference
        BigDecimal relativeDifference;
        if (expected.compareTo(BigDecimal.ZERO) == 0) {
            relativeDifference = difference.abs();
        } else {
            relativeDifference = difference.divide(expected, epsilon.scale() + 2, BigDecimal.ROUND_UP).abs();
        }

        // compare relative difference to epsilon
        if (relativeDifference.compareTo(epsilon) > 0) {
            fail(format(message.concat(" BigDecimal relative difference: ").concat(relativeDifference.toString()),
                    expected, actual));
        }
    }

    public Map<String, Object> getSuccessfullTests(){
        return successfullTests;
    }

    public Map<String, Object> getFailedTests(){
        return failedTests;
    }

    public void clearTestMaps() {
        successfullTests.clear();
        failedTests.clear();
    }
}

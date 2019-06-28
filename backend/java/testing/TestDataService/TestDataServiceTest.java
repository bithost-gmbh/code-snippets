package ch.dummy.test.utils;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;

public class TestDataServiceTest {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    TestDataService testDataService;

    private BigDecimal epsilon = new BigDecimal(1e-3);

    @Test
    public void compareDecimalValuesEpsilonAssertDifference1() {
        boolean differenceAsserted1 = false;
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal(0.000004),
                    new BigDecimal(0.000005),
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted1 = true;
        }
        assertEquals(true, differenceAsserted1);

        boolean differenceAsserted11 = false;
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal(0.000004),
                    new BigDecimal(0.000003),
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted11 = true;
        }
        assertEquals(true, differenceAsserted11);
    }

    @Test
    public void compareDecimalValuesEpsilonAssertDifference2() {
        boolean differenceAsserted2 = false;
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal(-0.000004),
                    new BigDecimal(0.000005),
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted2 = true;
        }
        assertEquals(true, differenceAsserted2);
    }

    @Test
    public void compareDecimalValuesEpsilonAssertDifference3() {
        boolean differenceAsserted3 = false;
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal(-0.000004),
                    new BigDecimal(-0.000005),
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted3 = true;
        }
        assertEquals(true, differenceAsserted3);
    }

    @Test
    public void compareDecimalValuesEpsilonAssertDifference4() {
        boolean differenceAsserted4 = false;
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal(0.000004),
                    new BigDecimal(-0.000005),
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted4 = true;
        }
        assertEquals(true, differenceAsserted4);
    }

    @Test
    public void compareDecimalValuesEpsilonAssertDifference5() {
        boolean differenceAsserted5 = false;
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal(-0.000004),
                    new BigDecimal(0.0000040005),
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted5 = true;
        }
        assertEquals(true, differenceAsserted5);
    }

    @Test
    public void compareDecimalValuesEpsilonAssertDifference6() {
        boolean differenceAsserted5 = false;
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal(0.000004),
                    new BigDecimal(0.0000040005),
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted5 = true;
        }
        assertEquals(false, differenceAsserted5);

        boolean differenceAsserted6 = false;
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal(0.000004),
                    new BigDecimal(0.0000040005),
                    new BigDecimal(1e-10)
            );
        } catch (AssertionError e) {
            differenceAsserted6 = true;
        }
        assertEquals(true, differenceAsserted6);
    }
    
    @Test
    public void compareDecimalValuesEpsilonAssertEquality1() {
        boolean differenceAsserted1 = false;
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal(0.000004),
                    new BigDecimal(0.0000040005),
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted1 = true;
        }
        assertEquals(false, differenceAsserted1);
    }

    @Test
    public void compareDecimalValuesEpsilonAssertEquality2() {
        boolean differenceAsserted2 = false;
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal(0.000004),
                    new BigDecimal(0.0000039995),
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted2 = true;
        }
        assertEquals(false, differenceAsserted2);
    }

    @Test
    public void compareDecimalValuesEpsilonAssertEquality3() {
        boolean differenceAsserted3 = false;
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal(-0.000004),
                    new BigDecimal(-0.0000040005),
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted3 = true;
        }
        assertEquals(false, differenceAsserted3);
    }

    @Test
    public void compareDecimalValuesEpsilonAssertEquality4() {
        boolean differenceAsserted4 = false;
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal(-0.000004),
                    new BigDecimal(-0.0000039995),
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted4 = true;
        }
        assertEquals(false, differenceAsserted4);
    }

    @Test
    public void compareDecimalValuesEpsilonAssertEquality5() {
        boolean differenceAsserted5 = false;
        BigDecimal epsilon = new BigDecimal(1e-6);
        try {
            TestDataService.assertEqualsBigDecimalEpsilon(
                    "some message",
                    new BigDecimal("38207766771.85445"), // scale is 5, hence less than the epsilon precision
                    new BigDecimal("38207766771.85444"),
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted5 = true;
        }
        assertEquals(false, differenceAsserted5);
    }

    @Test
    public void compareObjectEpsilonAssertDifference1() {
        boolean differenceAsserted5 = false;
        try {
            TestDataService.assertEqualsObjectEpsilon(
                    "some message",
                    "String A",
                    "String B",
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted5 = true;
        }
        assertEquals(true, differenceAsserted5);
    }

    @Test
    public void compareObjectEpsilonAssertEquality1() {
        boolean differenceAsserted5 = false;
        try {
            TestDataService.assertEqualsObjectEpsilon(
                    "some message",
                    "String A",
                    "String A",
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted5 = true;
        }
        assertEquals(false, differenceAsserted5);
    }

    @Test
    public void compareListEpsilonAssertDifference1() {
        List<Object> list1 = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );
        List<Object> list1actual = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.0000052),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );

        boolean differenceAsserted1 = false;
        try {
            TestDataService.assertEqualsListEpsilon(
                    "some message",
                    list1,
                    list1actual,
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted1 = true;
        }
        assertEquals(true, differenceAsserted1);
    }

    @Test
    public void compareListEpsilonAssertDifference2() {
        List<Object> list2 = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );
        List<Object> list2actual = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007),
                new BigDecimal(0.000008)
        );

        boolean differenceAsserted2 = false;
        try {
            TestDataService.assertEqualsListEpsilon(
                    "some message",
                    list2,
                    list2actual,
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted2 = true;
        }
        assertEquals(true, differenceAsserted2);
    }

    @Test
    public void compareListEpsilonAssertEquality1() {
        List<Object> list1 = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );
        List<Object> list1actual = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );

        boolean differenceAsserted1 = false;
        try {
            TestDataService.assertEqualsListEpsilon(
                    "some message",
                    list1,
                    list1actual,
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted1 = true;
        }
        assertEquals(false, differenceAsserted1);
    }

    @Test
    public void compareListEpsilonAssertEquality2() {
        List<Object> list1 = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );
        List<Object> list1actual = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.00000500002),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );

        boolean differenceAsserted1 = false;
        try {
            TestDataService.assertEqualsListEpsilon(
                    "some message",
                    list1,
                    list1actual,
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted1 = true;
        }
        assertEquals(false, differenceAsserted1);
    }

    @Test
    public void compareMapEpsilonAssertDifference1() {
        Map<Object, Object> map1 = new HashMap<>();
        map1.put("A", new BigDecimal(0.000004));
        map1.put("B", new BigDecimal(0.000005));
        map1.put("C", new BigDecimal(0.000006));
        map1.put("D", new BigDecimal(0.000007));

        Map<Object, Object> map1actual = new HashMap<>();
        map1actual.put("A", new BigDecimal(0.000004));
        map1actual.put("B", new BigDecimal(0.0000052));
        map1actual.put("C", new BigDecimal(0.000006));
        map1actual.put("D", new BigDecimal(0.000007));


        boolean differenceAsserted1 = false;
        try {
            TestDataService.assertEqualsMapEpsilon(
                    "some message",
                    map1,
                    map1actual,
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted1 = true;
        }
        assertEquals(true, differenceAsserted1);
    }

    @Test
    public void compareMapEpsilonAssertDifference2() {
        Map<Object, Object> map2 = new HashMap<>();
        map2.put("A", new BigDecimal(0.000004));
        map2.put("B", new BigDecimal(0.000005));
        map2.put("C", new BigDecimal(0.000006));
        map2.put("D", new BigDecimal(0.000007));

        Map<Object, Object> map2actual = new HashMap<>();
        map2actual.put("A", new BigDecimal(0.000004));
        map2actual.put("B1", new BigDecimal(0.000005));
        map2actual.put("C", new BigDecimal(0.000006));
        map2actual.put("D", new BigDecimal(0.000007));


        boolean differenceAsserted2 = false;
        try {
            TestDataService.assertEqualsMapEpsilon(
                    "some message",
                    map2,
                    map2actual,
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted2 = true;
        }
        assertEquals(true, differenceAsserted2);

    }


    @Test
    public void compareMapEpsilonAssertDifference3() {
        Map<Object, Object> map2 = new HashMap<>();
        map2.put("A", new BigDecimal(0.000004));
        map2.put("B", new BigDecimal(0.000005));
        map2.put("C", new BigDecimal(0.000006));
        map2.put("D", new BigDecimal(0.000007));

        Map<Object, Object> map2actual = new HashMap<>();
        map2actual.put("A", new BigDecimal(0.000004));
        map2actual.put("B", new BigDecimal(0.000005));
        map2actual.put("C", new BigDecimal(0.000006));
        map2actual.put("D", new BigDecimal(0.000007));
        map2actual.put("E", new BigDecimal(0.000008));


        boolean differenceAsserted2 = false;
        try {
            TestDataService.assertEqualsMapEpsilon(
                    "some message",
                    map2,
                    map2actual,
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted2 = true;
        }
        assertEquals(true, differenceAsserted2);

    }

    @Test
    public void compareMapEpsilonAssertEquality1() {
        Map<Object, Object> map1 = new HashMap<>();
        map1.put("A", new BigDecimal(0.000004));
        map1.put("B", new BigDecimal(0.000005));
        map1.put("C", new BigDecimal(0.000006));
        map1.put("D", new BigDecimal(0.000007));

        Map<Object, Object> map1actual = new HashMap<>();
        map1actual.put("A", new BigDecimal(0.000004));
        map1actual.put("B", new BigDecimal(0.000005));
        map1actual.put("C", new BigDecimal(0.000006));
        map1actual.put("D", new BigDecimal(0.000007));


        boolean differenceAsserted1 = false;
        try {
            TestDataService.assertEqualsMapEpsilon(
                    "some message",
                    map1,
                    map1actual,
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted1 = true;
        }
        assertEquals(false, differenceAsserted1);
    }

    @Test
    public void compareMapEpsilonAssertEquality2() {
        Map<Object, Object> map1 = new HashMap<>();
        map1.put("A", new BigDecimal(0.000004));
        map1.put("B", new BigDecimal(0.000005));
        map1.put("C", new BigDecimal(0.000006));
        map1.put("D", new BigDecimal(0.000007));

        Map<Object, Object> map1actual = new HashMap<>();
        map1actual.put("A", new BigDecimal(0.000004));
        map1actual.put("B", new BigDecimal(0.0000050005));
        map1actual.put("C", new BigDecimal(0.000006));
        map1actual.put("D", new BigDecimal(0.000007));


        boolean differenceAsserted1 = false;
        try {
            TestDataService.assertEqualsMapEpsilon(
                    "some message",
                    map1,
                    map1actual,
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted1 = true;
        }
        assertEquals(false, differenceAsserted1);
    }


    @Test
    public void compareMapEpsilonAssertEqualityTotalTest1() {
        Map<Object, Object> map1 = new HashMap<>();
        Map<Object, Object> submap1 = new HashMap<>();
        Map<Object, Object> subsubmap1 = new HashMap<>();
        List<Object> list1 = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );
        List<Object> sublist1 = Arrays.asList(
                new BigDecimal(1.000004),
                new BigDecimal(2.00000500002),
                new BigDecimal(3.000006),
                new BigDecimal(4.000007)
        );
        map1.put("A", new BigDecimal(0.000004));
        map1.put("B", submap1);
        map1.put("C", new BigDecimal(0.000006));
        map1.put("D", list1);
        map1.put("E", new BigDecimal(0.000008));

        submap1.put("subA", new BigDecimal(1.000004));
        submap1.put("subB", subsubmap1);
        submap1.put("subC", "String subC");
        submap1.put("subD", sublist1);
        submap1.put("subE", new BigDecimal(1.000007));
        submap1.put("subF", subsubmap1);

        subsubmap1.put("subsubA", new BigDecimal(2.000004));
        subsubmap1.put("subsubB", "String subsubB");
        subsubmap1.put("subsubC", new BigDecimal(2.000007));


        Map<Object, Object> map1actual = new HashMap<>();
        Map<Object, Object> submap1actual = new HashMap<>();
        Map<Object, Object> subsubmap1actual = new HashMap<>();
        List<Object> list1actual = Arrays.asList(
                new BigDecimal(0.00000400005),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );
        List<Object> sublist1actual = Arrays.asList(
                new BigDecimal(1.000004),
                new BigDecimal(2.0000050000200005),
                new BigDecimal(3.000006),
                new BigDecimal(4.000007)
        );
        map1actual.put("A", new BigDecimal(0.000004));
        map1actual.put("B", submap1actual);
        map1actual.put("C", new BigDecimal(0.00000600005));
        map1actual.put("D", list1actual);
        map1actual.put("E", new BigDecimal(0.000008));

        submap1actual.put("subA", new BigDecimal(1.000004));
        submap1actual.put("subB", subsubmap1actual);
        submap1actual.put("subC", "String subC");
        submap1actual.put("subD", sublist1actual);
        submap1actual.put("subE", new BigDecimal(1.00000700005));
        submap1actual.put("subF", subsubmap1actual);

        subsubmap1actual.put("subsubA", new BigDecimal(2.000004));
        subsubmap1actual.put("subsubB", "String subsubB");
        subsubmap1actual.put("subsubC", new BigDecimal(2.00000700005));


        boolean differenceAsserted1 = false;
        try {
            TestDataService.assertEqualsMapEpsilon(
                    "some message",
                    map1,
                    map1actual,
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted1 = true;
        }
        assertEquals(false, differenceAsserted1);
    }

    @Test
    public void compareMapEpsilonAssertEqualityTotalTest2() {
        Map<Object, Object> map1 = new HashMap<>();
        Map<Object, Object> submap1 = new HashMap<>();
        Map<Object, Object> subsubmap1 = new HashMap<>();
        List<Object> list1 = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );
        List<Object> sublist1 = Arrays.asList(
                new BigDecimal(1.000004),
                new BigDecimal(2.00000500002),
                new BigDecimal(3.000006),
                new BigDecimal(4.000007)
        );
        map1.put("A", new BigDecimal(0.000004));
        map1.put("B", submap1);
        map1.put("C", new BigDecimal(0.000006));
        map1.put("D", list1);
        map1.put("E", new BigDecimal(0.000008));

        submap1.put("subA", new BigDecimal(1.000004));
        submap1.put("subB", subsubmap1);
        submap1.put("subC", "String subC");
        submap1.put("subD", sublist1);
        submap1.put("subE", new BigDecimal(1.000007));
        submap1.put("subF", subsubmap1);

        subsubmap1.put("subsubA", new BigDecimal(2.000004));
        subsubmap1.put("subsubB", "String subsubB");
        subsubmap1.put("subsubC", new BigDecimal(2.000007));


        Map<Object, Object> map1actual = new HashMap<>();
        Map<Object, Object> submap1actual = new HashMap<>();
        Map<Object, Object> subsubmap1actual = new HashMap<>();
        List<Object> list1actual = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );
        List<Object> sublist1actual = Arrays.asList(
                new BigDecimal(1.000004),
                new BigDecimal(2.00000500002),
                new BigDecimal(3.000006),
                new BigDecimal(4.000007)
        );
        map1actual.put("A", new BigDecimal(0.000004));
        map1actual.put("B", submap1actual);
        map1actual.put("C", new BigDecimal(0.000006));
        map1actual.put("D", list1actual);
        map1actual.put("E", new BigDecimal(0.000008));

        submap1actual.put("subA", new BigDecimal(1.000004));
        submap1actual.put("subB", subsubmap1actual);
        submap1actual.put("subC", "String subC");
        submap1actual.put("subD", sublist1actual);
        submap1actual.put("subE", new BigDecimal(1.000007));
        submap1actual.put("subF", subsubmap1actual);

        subsubmap1actual.put("subsubA", new BigDecimal(2.000004));
        subsubmap1actual.put("subsubB", "String subsubB");
        subsubmap1actual.put("subsubC", new BigDecimal(2.000007));


        boolean differenceAsserted1 = false;
        try {
            TestDataService.assertEqualsMapEpsilon(
                    "some message",
                    map1,
                    map1actual,
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted1 = true;
        }
        assertEquals(false, differenceAsserted1);
    }

    @Test
    public void compareMapEpsilonAssertDifferenceTotalTest1() {
        Map<Object, Object> map1 = new HashMap<>();
        Map<Object, Object> submap1 = new HashMap<>();
        Map<Object, Object> subsubmap1 = new HashMap<>();
        List<Object> list1 = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );
        List<Object> sublist1 = Arrays.asList(
                new BigDecimal(1.000004),
                new BigDecimal(2.00000500002),
                new BigDecimal(3.000006),
                new BigDecimal(4.000007)
        );
        map1.put("A", new BigDecimal(0.000004));
        map1.put("B", submap1);
        map1.put("C", new BigDecimal(0.000006));
        map1.put("D", list1);
        map1.put("E", new BigDecimal(0.000008));

        submap1.put("subA", new BigDecimal(1.000004));
        submap1.put("subB", subsubmap1);
        submap1.put("subC", "String subC");
        submap1.put("subD", sublist1);
        submap1.put("subE", new BigDecimal(1.000007));
        submap1.put("subF", subsubmap1);

        subsubmap1.put("subsubA", new BigDecimal(2.000004));
        subsubmap1.put("subsubB", "String subsubB");
        subsubmap1.put("subsubC", new BigDecimal(2.000007));


        Map<Object, Object> map1actual = new HashMap<>();
        Map<Object, Object> submap1actual = new HashMap<>();
        Map<Object, Object> subsubmap1actual = new HashMap<>();
        List<Object> list1actual = Arrays.asList(
                new BigDecimal(0.00000400005),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );
        List<Object> sublist1actual = Arrays.asList(
                new BigDecimal(1.000004),
                new BigDecimal(2.00300500002), // <- difference is here
                new BigDecimal(3.000006),
                new BigDecimal(4.000007)
        );
        map1actual.put("A", new BigDecimal(0.000004));
        map1actual.put("B", submap1actual);
        map1actual.put("C", new BigDecimal(0.00000600005));
        map1actual.put("D", list1actual);
        map1actual.put("E", new BigDecimal(0.000008));

        submap1actual.put("subA", new BigDecimal(1.000004));
        submap1actual.put("subB", subsubmap1actual);
        submap1actual.put("subC", "String subC");
        submap1actual.put("subD", sublist1actual);
        submap1actual.put("subE", new BigDecimal(1.00000700005));
        submap1actual.put("subF", subsubmap1actual);

        subsubmap1actual.put("subsubA", new BigDecimal(2.000004));
        subsubmap1actual.put("subsubB", "String subsubB");
        subsubmap1actual.put("subsubC", new BigDecimal(2.00000700005));


        boolean differenceAsserted1 = false;
        try {
            TestDataService.assertEqualsMapEpsilon(
                    "some message",
                    map1,
                    map1actual,
                    epsilon
            );
        } catch (AssertionError e) {

            differenceAsserted1 = true;
            logger.error(e.getMessage());
        }
        assertEquals(true, differenceAsserted1);
    }

    @Test
    public void compareMapEpsilonAssertDifferenceTotalTest2() {
        Map<Object, Object> map1 = new HashMap<>();
        Map<Object, Object> submap1 = new HashMap<>();
        Map<Object, Object> subsubmap1 = new HashMap<>();
        List<Object> list1 = Arrays.asList(
                new BigDecimal(0.000004),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );
        List<Object> sublist1 = Arrays.asList(
                new BigDecimal(1.000004),
                new BigDecimal(2.00000500002),
                new BigDecimal(3.000006),
                new BigDecimal(4.000007)
        );
        map1.put("A", new BigDecimal(0.000004));
        map1.put("B", submap1);
        map1.put("C", new BigDecimal(0.000006));
        map1.put("D", list1);
        map1.put("E", new BigDecimal(0.000008));

        submap1.put("subA", new BigDecimal(1.000004));
        submap1.put("subB", subsubmap1);
        submap1.put("subC", "String subC");
        submap1.put("subD", sublist1);
        submap1.put("subE", new BigDecimal(1.000007));
        submap1.put("subF", subsubmap1);

        subsubmap1.put("subsubA", new BigDecimal(2.000004));
        subsubmap1.put("subsubB", "String subsubB");
        subsubmap1.put("subsubC", new BigDecimal(2.000007));


        Map<Object, Object> map1actual = new HashMap<>();
        Map<Object, Object> submap1actual = new HashMap<>();
        Map<Object, Object> subsubmap1actual = new HashMap<>();
        List<Object> list1actual = Arrays.asList(
                new BigDecimal(0.00000400005),
                new BigDecimal(0.000005),
                new BigDecimal(0.000006),
                new BigDecimal(0.000007)
        );
        List<Object> sublist1actual = Arrays.asList(
                new BigDecimal(1.000004),
                new BigDecimal(2.00000500002),
                new BigDecimal(3.000006),
                new BigDecimal(4.000007)
        );
        map1actual.put("A", new BigDecimal(0.000004));
        map1actual.put("B", submap1actual);
        map1actual.put("C", new BigDecimal(0.00000600005));
        map1actual.put("D", list1actual);
        map1actual.put("E", new BigDecimal(0.000008));

        submap1actual.put("subA", new BigDecimal(1.000004));
        submap1actual.put("subB", subsubmap1actual);
        submap1actual.put("subC", "String subC");
        submap1actual.put("subD", sublist1actual);
        submap1actual.put("subE", new BigDecimal(1.00000700005));
        submap1actual.put("subF", subsubmap1actual);

        subsubmap1actual.put("subsubA", new BigDecimal(2.004004)); // <- difference is here
        subsubmap1actual.put("subsubB", "String subsubB");
        subsubmap1actual.put("subsubC", new BigDecimal(2.00000700005));


        boolean differenceAsserted1 = false;
        try {
            TestDataService.assertEqualsMapEpsilon(
                    "some message",
                    map1,
                    map1actual,
                    epsilon
            );
        } catch (AssertionError e) {
            differenceAsserted1 = true;
        }
        assertEquals(true, differenceAsserted1);
    }
}

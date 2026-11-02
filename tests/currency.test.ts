import { assertEquals } from "@std/assert";
import { currencyMinorUnits, OrderCurrency, ZERO_DECIMAL_CURRENCIES } from "../models/ticketing.ts";

Deno.test("currencyMinorUnits", () => {
    assertEquals(currencyMinorUnits(OrderCurrency.USD), 100);
    assertEquals(currencyMinorUnits(OrderCurrency.EUR), 100);
    assertEquals(currencyMinorUnits(OrderCurrency.PYG), 1);
    assertEquals(currencyMinorUnits("pyg"), 1);
    assertEquals(currencyMinorUnits("JPY"), 1);
    assertEquals(currencyMinorUnits(null), 100);
    assertEquals(currencyMinorUnits(undefined), 100);
});

Deno.test("ZERO_DECIMAL_CURRENCIES includes PYG", () => {
    assertEquals(ZERO_DECIMAL_CURRENCIES.includes(OrderCurrency.PYG), true);
    assertEquals(ZERO_DECIMAL_CURRENCIES.includes(OrderCurrency.USD), false);
});

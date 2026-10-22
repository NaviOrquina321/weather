import asyncio
from playwright.async_api import async_playwright

async def run_tests():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 900})

        print("Navigating to http://localhost:8080...")
        await page.goto("http://localhost:8080")
        await page.wait_for_selector("#weather-dashboard:not(.hidden)", timeout=10000)
        await page.wait_for_timeout(1000) # wait for Chart.js animation

        # 1. Test Unit Switch (°C to °F)
        print("Testing °C / °F unit switching...")
        initial_temp_text = await page.locator("#current-temp").text_content()
        initial_unit_text = await page.locator("#current-unit").text_content()
        assert initial_unit_text == "°C", f"Expected °C, got {initial_unit_text}"

        # Click °F toggle button
        await page.click("#toggle-f")
        await page.wait_for_timeout(500)
        f_temp_text = await page.locator("#current-temp").text_content()
        f_unit_text = await page.locator("#current-unit").text_content()
        assert f_unit_text == "°F", f"Expected °F, got {f_unit_text}"
        assert initial_temp_text != f_temp_text, f"Temperature did not convert: {initial_temp_text} vs {f_temp_text}"
        print(f"Unit switch successful: {initial_temp_text}°C -> {f_temp_text}°F")

        # Switch back to °C
        await page.click("#toggle-c")
        await page.wait_for_timeout(500)

        # 2. Test City Preset Selection (Tokyo)
        print("Testing City Preset selection (Tokyo, Japan)...")
        await page.select_option("#city-select", "35.6762,139.6503")
        await page.wait_for_timeout(2000) # Wait for network request and render

        city_label = await page.locator("#weather-city-label").text_content()
        assert "Tokyo" in city_label, f"Expected Tokyo in city label, got {city_label}"
        print(f"City preset updated city label: {city_label}")

        # 3. Test Manual Lat/Lon Input (New York: 40.7128, -74.006)
        print("Testing Manual Lat/Lon Input (New York)...")
        await page.fill("#lat-input", "40.7128")
        await page.fill("#lon-input", "-74.006")
        await page.click("#fetch-btn")
        await page.wait_for_timeout(2000)

        ny_city_label = await page.locator("#weather-city-label").text_content()
        assert "New York" in ny_city_label, f"Expected New York in city label, got {ny_city_label}"
        print(f"Manual input updated city label: {ny_city_label}")

        # 4. Test 7-Day Forecast Card Selection
        print("Testing 7-Day Forecast Card selection...")
        cards = page.locator("#daily-forecast-container > div")
        card_count = await cards.count()
        assert card_count == 7, f"Expected 7 forecast cards, got {card_count}"

        # Click on the 2nd card (Tomorrow)
        await cards.nth(1).click()
        await page.wait_for_timeout(500)
        chart_title = await page.locator("#hourly-chart-title").text_content()
        assert "Today" not in chart_title, f"Expected non-Today chart title, got {chart_title}"
        print(f"7-day card selection updated Chart title: {chart_title}")

        # Capture screenshot of state
        import os
        screenshot_dir = "/home/jules/verification/screenshots"
        os.makedirs(screenshot_dir, exist_ok=True)
        screenshot_path = os.path.join(screenshot_dir, "skycast_interactive_test.png")
        await page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        await browser.close()
        print("All tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(run_tests())

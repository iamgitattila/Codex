#!/usr/bin/env python3
"""
Custom Retrack Filter Tests
============================
Use this file to quickly test your own filter configurations.
Modify the examples below to match your actual Retrack setup.
"""

from retrack_filter_tester import (
    RetrackFilterSimulator,
    FilterGroup,
    Filter,
    FilterType,
    FilterField,
    TrafficEntry,
    print_results
)


def test_my_setup():
    """
    Customize this function to test YOUR specific Retrack setup.
    """

    print("\n" + "="*80)
    print("MY CUSTOM RETRACK FILTER TEST")
    print("="*80)

    # Create the simulator
    simulator = RetrackFilterSimulator()

    # ========================================================================
    # DEFINE YOUR PATHS (Filter Groups)
    # ========================================================================

    # Example: Path for Facebook traffic
    # Uncomment and modify:
    """
    path_facebook = FilterGroup(name="Facebook_Offers", weight=200)
    path_facebook.filters.append(Filter(
        field=FilterField.SUB_ID,
        filter_type=FilterType.CONTAINS,
        value="fb"
    ))
    simulator.add_filter_group(path_facebook)
    """

    # Example: Path for specific sub_id
    # Uncomment and modify:
    """
    path_specific = FilterGroup(name="VIP_Campaign", weight=300)
    path_specific.filters.append(Filter(
        field=FilterField.SUB_ID,
        filter_type=FilterType.INCLUDE,
        value="vip_campaign_2024"
    ))
    simulator.add_filter_group(path_specific)
    """

    # Example: Path for US mobile traffic
    # Uncomment and modify:
    """
    path_us_mobile = FilterGroup(name="US_Mobile_Only", weight=200)
    path_us_mobile.filters.append(Filter(
        field=FilterField.COUNTRY,
        filter_type=FilterType.INCLUDE,
        value="US"
    ))
    path_us_mobile.filters.append(Filter(
        field=FilterField.DEVICE,
        filter_type=FilterType.INCLUDE,
        value="mobile"
    ))
    simulator.add_filter_group(path_us_mobile)
    """

    # Example: Catch-all path (IMPORTANT!)
    # Uncomment and modify:
    """
    path_default = FilterGroup(name="Default_Offer", weight=100)
    # No filters = catches everything else
    simulator.add_filter_group(path_default)
    """

    # ========================================================================
    # TEMPORARY EXAMPLE (Delete this after you add your paths above)
    # ========================================================================
    # This is just to show how it works. Delete this section!

    print("\n⚠️  Using example paths. Modify this file to test YOUR setup!\n")

    # Example path 1: Contains "test"
    path1 = FilterGroup(name="Test_Path", weight=200)
    path1.filters.append(Filter(
        field=FilterField.SUB_ID,
        filter_type=FilterType.CONTAINS,
        value="test"
    ))
    simulator.add_filter_group(path1)

    # Example path 2: Catch-all
    path2 = FilterGroup(name="Default", weight=100)
    simulator.add_filter_group(path2)

    # ========================================================================
    # DEFINE YOUR TEST TRAFFIC
    # ========================================================================

    # Create traffic entries that represent actual visitors
    test_traffic = [
        # Format: TrafficEntry(sub_id="...", country="...", device="...", etc.)

        # Example entries (modify these!):
        TrafficEntry(sub_id="test123", country="US", device="mobile"),
        TrafficEntry(sub_id="test456", country="CA", device="desktop"),
        TrafficEntry(sub_id="fb_campaign_1", country="US", device="mobile"),
        TrafficEntry(sub_id="google_ads_2", country="UK", device="tablet"),
        TrafficEntry(sub_id="random_traffic", country="US", device="mobile"),
    ]

    # ========================================================================
    # RUN THE TEST
    # ========================================================================

    results = simulator.test_traffic_batch(test_traffic)
    print_results(results, "My Custom Setup")

    # Print detailed routing for each traffic entry
    print("\nDetailed Routing:")
    print("-" * 80)
    for detail in results['details']:
        traffic = detail['traffic']
        matched = detail['matched']
        print(f"sub_id: {traffic['sub_id']:20s} → {matched}")


def test_specific_scenario():
    """
    Add more test functions here to test different scenarios.
    """

    print("\n" + "="*80)
    print("TESTING SPECIFIC SCENARIO")
    print("="*80)

    # Example: What if I want to split traffic by source?

    simulator = RetrackFilterSimulator()

    # Facebook traffic
    fb_path = FilterGroup(name="Facebook", weight=200)
    fb_path.filters.append(Filter(
        field=FilterField.SUB_ID,
        filter_type=FilterType.CONTAINS,
        value="fb"
    ))
    simulator.add_filter_group(fb_path)

    # Google traffic
    google_path = FilterGroup(name="Google", weight=200)
    google_path.filters.append(Filter(
        field=FilterField.SUB_ID,
        filter_type=FilterType.CONTAINS,
        value="google"
    ))
    simulator.add_filter_group(google_path)

    # TikTok traffic
    tiktok_path = FilterGroup(name="TikTok", weight=200)
    tiktok_path.filters.append(Filter(
        field=FilterField.SUB_ID,
        filter_type=FilterType.CONTAINS,
        value="tiktok"
    ))
    simulator.add_filter_group(tiktok_path)

    # Everything else
    other_path = FilterGroup(name="Other_Sources", weight=100)
    simulator.add_filter_group(other_path)

    # Test traffic
    test_traffic = [
        TrafficEntry(sub_id="fb_summer_2024"),
        TrafficEntry(sub_id="google_search_campaign"),
        TrafficEntry(sub_id="tiktok_viral_video"),
        TrafficEntry(sub_id="reddit_post_123"),
        TrafficEntry(sub_id="organic_traffic"),
        TrafficEntry(sub_id="fb_winter_promo"),
    ]

    results = simulator.test_traffic_batch(test_traffic)
    print_results(results, "Traffic Source Split")


def quick_test():
    """
    Quick one-off test. Useful for debugging specific issues.
    """

    print("\n" + "="*80)
    print("QUICK TEST")
    print("="*80)

    simulator = RetrackFilterSimulator()

    # Add your paths here
    # ...

    # Add your test traffic here
    test_traffic = [
        # TrafficEntry(sub_id="..."),
    ]

    # Uncomment to run:
    # results = simulator.test_traffic_batch(test_traffic)
    # print_results(results, "Quick Test")

    print("Add your paths and traffic above, then uncomment to run!")


if __name__ == "__main__":
    print("\n")
    print("╔════════════════════════════════════════════════════════════════════════════╗")
    print("║                       MY CUSTOM RETRACK TESTS                              ║")
    print("╚════════════════════════════════════════════════════════════════════════════╝")

    # Run your custom tests
    test_my_setup()

    # Uncomment to run additional tests:
    # test_specific_scenario()
    # quick_test()

    print("\n" + "="*80)
    print("Done! Modify this file to add more tests.")
    print("="*80)

#!/usr/bin/env python3
"""
Retrack Filter Testing Tool
============================
A tool to test and understand Retrack's filter logic for redirect domains.

This helps decode the "Ukrainian logic" by allowing you to quickly test
different filter configurations and see how traffic gets divided.
"""

import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict


class FilterType(Enum):
    """Retrack filter types"""
    INCLUDE = "include"
    EXCLUDE = "exclude"
    CONTAINS = "contains"
    NO_CONTAINS = "no_contains"  # doesn't contain


class FilterField(Enum):
    """Fields that can be filtered"""
    SUB_ID = "sub_id"
    COUNTRY = "country"
    DEVICE = "device"
    OS = "os"
    BROWSER = "browser"
    IP = "ip"


@dataclass
class Filter:
    """Represents a single filter rule"""
    field: FilterField
    filter_type: FilterType
    value: Any

    def matches(self, traffic_data: Dict[str, Any]) -> bool:
        """Check if traffic data matches this filter"""
        field_value = str(traffic_data.get(self.field.value, ""))
        filter_value = str(self.value)

        if self.filter_type == FilterType.INCLUDE:
            # Exact match
            return field_value == filter_value
        elif self.filter_type == FilterType.EXCLUDE:
            # Does NOT match
            return field_value != filter_value
        elif self.filter_type == FilterType.CONTAINS:
            # Contains substring
            return filter_value in field_value
        elif self.filter_type == FilterType.NO_CONTAINS:
            # Does NOT contain substring
            return filter_value not in field_value

        return False


@dataclass
class FilterGroup:
    """A group of filters (represents one path/destination)"""
    name: str
    filters: List[Filter] = field(default_factory=list)
    weight: int = 100  # Weight/priority (default 100)

    def matches(self, traffic_data: Dict[str, Any]) -> bool:
        """Check if traffic data matches ALL filters in this group (AND logic)"""
        if not self.filters:
            # No filters = catch-all (matches everything)
            return True

        return all(f.matches(traffic_data) for f in self.filters)


@dataclass
class TrafficEntry:
    """Represents a single traffic request"""
    sub_id: str
    country: str = "US"
    device: str = "mobile"
    os: str = "android"
    browser: str = "chrome"
    ip: str = "1.2.3.4"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sub_id": self.sub_id,
            "country": self.country,
            "device": self.device,
            "os": self.os,
            "browser": self.browser,
            "ip": self.ip
        }


class RetrackFilterSimulator:
    """Simulates Retrack's filter logic"""

    def __init__(self):
        self.filter_groups: List[FilterGroup] = []
        self.default_split_behavior = True  # The weird 50-50 split behavior

    def add_filter_group(self, group: FilterGroup):
        """Add a filter group (path/destination)"""
        self.filter_groups.append(group)

    def route_traffic(self, traffic: TrafficEntry) -> Optional[str]:
        """
        Route a single traffic entry through the filters.
        Returns the name of the matching filter group or None.
        """
        matching_groups = []

        traffic_dict = traffic.to_dict()

        for group in self.filter_groups:
            if group.matches(traffic_dict):
                matching_groups.append(group)

        if not matching_groups:
            return None

        if len(matching_groups) == 1:
            return matching_groups[0].name

        # Multiple matches - use weight/priority
        # Sort by weight (higher weight = higher priority)
        matching_groups.sort(key=lambda g: g.weight, reverse=True)
        return matching_groups[0].name

    def test_traffic_batch(self, traffic_list: List[TrafficEntry]) -> Dict[str, Any]:
        """
        Test a batch of traffic and return statistics.
        """
        results = defaultdict(int)
        unmatched = 0
        details = []

        for traffic in traffic_list:
            matched_group = self.route_traffic(traffic)

            if matched_group:
                results[matched_group] += 1
            else:
                unmatched += 1

            details.append({
                "traffic": traffic.to_dict(),
                "matched": matched_group or "UNMATCHED"
            })

        total = len(traffic_list)

        return {
            "total_traffic": total,
            "matched_by_group": dict(results),
            "unmatched": unmatched,
            "percentages": {
                group: f"{(count/total)*100:.1f}%"
                for group, count in results.items()
            },
            "details": details
        }


def print_separator(char="=", length=80):
    """Print a separator line"""
    print(char * length)


def print_results(results: Dict[str, Any], scenario_name: str):
    """Pretty print test results"""
    print_separator()
    print(f"TEST SCENARIO: {scenario_name}")
    print_separator()
    print(f"\nTotal Traffic: {results['total_traffic']}")
    print(f"Unmatched: {results['unmatched']}\n")

    print("Distribution:")
    for group, count in results['matched_by_group'].items():
        percentage = results['percentages'][group]
        print(f"  {group}: {count} ({percentage})")

    print()


def run_example_tests():
    """Run example test scenarios to understand Retrack's logic"""

    print("\n🔍 RETRACK FILTER TESTING TOOL")
    print("=" * 80)
    print("Testing different filter configurations to understand the logic\n")

    # ========================================================================
    # SCENARIO 1: Single "contains" filter on sub_id
    # ========================================================================
    print("\n" + "="*80)
    print("SCENARIO 1: Single 'contains' filter for sub_id")
    print("="*80)
    print("Setup: Path A filters for sub_id CONTAINS 'abc'")
    print("       Path B has no filters (catch-all)")
    print("Expectation: Path A gets traffic with 'abc', Path B gets the rest")

    simulator1 = RetrackFilterSimulator()

    # Path A: Contains 'abc'
    path_a = FilterGroup(name="Path_A")
    path_a.filters.append(Filter(
        field=FilterField.SUB_ID,
        filter_type=FilterType.CONTAINS,
        value="abc"
    ))
    path_a.weight = 200  # Higher weight

    # Path B: Catch-all (no filters)
    path_b = FilterGroup(name="Path_B")
    path_b.weight = 100

    simulator1.add_filter_group(path_a)
    simulator1.add_filter_group(path_b)

    # Generate test traffic
    test_traffic_1 = [
        TrafficEntry(sub_id="abc123"),
        TrafficEntry(sub_id="abc456"),
        TrafficEntry(sub_id="xyzabc"),
        TrafficEntry(sub_id="xyz123"),
        TrafficEntry(sub_id="def456"),
        TrafficEntry(sub_id="abcdef"),
        TrafficEntry(sub_id="123456"),
        TrafficEntry(sub_id="noabc"),
        TrafficEntry(sub_id="random"),
        TrafficEntry(sub_id="test"),
    ]

    results1 = simulator1.test_traffic_batch(test_traffic_1)
    print_results(results1, "Single CONTAINS filter + Catch-all")

    # ========================================================================
    # SCENARIO 2: Only one path with "contains" filter (NO catch-all)
    # ========================================================================
    print("\n" + "="*80)
    print("SCENARIO 2: ONLY 'contains' filter, NO catch-all")
    print("="*80)
    print("Setup: ONLY Path A filters for sub_id CONTAINS 'abc'")
    print("       NO other paths")
    print("Expectation: This might be where the weird 50-50 split happens!")

    simulator2 = RetrackFilterSimulator()

    # Only Path A
    path_a2 = FilterGroup(name="Path_A")
    path_a2.filters.append(Filter(
        field=FilterField.SUB_ID,
        filter_type=FilterType.CONTAINS,
        value="abc"
    ))

    simulator2.add_filter_group(path_a2)

    results2 = simulator2.test_traffic_batch(test_traffic_1)
    print_results(results2, "ONLY CONTAINS filter (no catch-all)")
    print("⚠️  Note: Traffic without 'abc' goes UNMATCHED (0% to Path A)")

    # ========================================================================
    # SCENARIO 3: Include vs Contains
    # ========================================================================
    print("\n" + "="*80)
    print("SCENARIO 3: INCLUDE vs CONTAINS")
    print("="*80)
    print("Setup: Path A = INCLUDE 'abc' (exact match)")
    print("       Path B = CONTAINS 'abc' (substring)")
    print("       Path C = catch-all")

    simulator3 = RetrackFilterSimulator()

    path_a3 = FilterGroup(name="Path_A_INCLUDE", weight=300)
    path_a3.filters.append(Filter(
        field=FilterField.SUB_ID,
        filter_type=FilterType.INCLUDE,
        value="abc"
    ))

    path_b3 = FilterGroup(name="Path_B_CONTAINS", weight=200)
    path_b3.filters.append(Filter(
        field=FilterField.SUB_ID,
        filter_type=FilterType.CONTAINS,
        value="abc"
    ))

    path_c3 = FilterGroup(name="Path_C_CATCHALL", weight=100)

    simulator3.add_filter_group(path_a3)
    simulator3.add_filter_group(path_b3)
    simulator3.add_filter_group(path_c3)

    results3 = simulator3.test_traffic_batch(test_traffic_1)
    print_results(results3, "INCLUDE vs CONTAINS")

    # ========================================================================
    # SCENARIO 4: Multiple filters (AND logic)
    # ========================================================================
    print("\n" + "="*80)
    print("SCENARIO 4: Multiple filters on one path (AND logic)")
    print("="*80)
    print("Setup: Path A = sub_id CONTAINS 'abc' AND country = 'US'")
    print("       Path B = catch-all")

    simulator4 = RetrackFilterSimulator()

    path_a4 = FilterGroup(name="Path_A_MULTI", weight=200)
    path_a4.filters.append(Filter(
        field=FilterField.SUB_ID,
        filter_type=FilterType.CONTAINS,
        value="abc"
    ))
    path_a4.filters.append(Filter(
        field=FilterField.COUNTRY,
        filter_type=FilterType.INCLUDE,
        value="US"
    ))

    path_b4 = FilterGroup(name="Path_B_CATCHALL", weight=100)

    simulator4.add_filter_group(path_a4)
    simulator4.add_filter_group(path_b4)

    test_traffic_4 = [
        TrafficEntry(sub_id="abc123", country="US"),
        TrafficEntry(sub_id="abc456", country="CA"),
        TrafficEntry(sub_id="xyzabc", country="US"),
        TrafficEntry(sub_id="xyz123", country="US"),
        TrafficEntry(sub_id="abc789", country="UK"),
    ]

    results4 = simulator4.test_traffic_batch(test_traffic_4)
    print_results(results4, "Multiple filters (AND logic)")

    # ========================================================================
    # SCENARIO 5: EXCLUDE filter
    # ========================================================================
    print("\n" + "="*80)
    print("SCENARIO 5: EXCLUDE filter")
    print("="*80)
    print("Setup: Path A = sub_id EXCLUDE 'abc' (anything BUT 'abc')")
    print("       Path B = catch-all")

    simulator5 = RetrackFilterSimulator()

    path_a5 = FilterGroup(name="Path_A_EXCLUDE", weight=200)
    path_a5.filters.append(Filter(
        field=FilterField.SUB_ID,
        filter_type=FilterType.EXCLUDE,
        value="abc"
    ))

    path_b5 = FilterGroup(name="Path_B_CATCHALL", weight=100)

    simulator5.add_filter_group(path_a5)
    simulator5.add_filter_group(path_b5)

    test_traffic_5 = [
        TrafficEntry(sub_id="abc"),
        TrafficEntry(sub_id="abc123"),
        TrafficEntry(sub_id="xyz"),
        TrafficEntry(sub_id="def"),
        TrafficEntry(sub_id="abc"),
    ]

    results5 = simulator5.test_traffic_batch(test_traffic_5)
    print_results(results5, "EXCLUDE filter")


def interactive_mode():
    """Interactive mode for custom testing"""
    print("\n" + "="*80)
    print("INTERACTIVE MODE")
    print("="*80)
    print("Create your own filter configuration and test it!")
    print("\nExample custom test coming soon...")
    print("For now, modify the run_example_tests() function or create your own.")


if __name__ == "__main__":
    print("\n")
    print("╔════════════════════════════════════════════════════════════════════════════╗")
    print("║                    RETRACK FILTER TESTING TOOL                             ║")
    print("║                  Decode the Ukrainian Logic™                               ║")
    print("╚════════════════════════════════════════════════════════════════════════════╝")

    # Run all example tests
    run_example_tests()

    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print("""
Key Findings:
1. Filters without a catch-all path will leave unmatched traffic unrouted
2. Multiple matching paths use weight/priority (higher weight wins)
3. Multiple filters on one path use AND logic (all must match)
4. INCLUDE = exact match, CONTAINS = substring match
5. EXCLUDE = anything BUT this value
6. NO_CONTAINS = doesn't have this substring

The "50-50 split" behavior likely happens when:
- You have incomplete filter coverage
- Retrack applies some default routing for unmatched traffic
- Multiple paths have equal weights and match the same traffic

💡 TIP: Always add a catch-all path (no filters) with the lowest weight
    to handle unmatched traffic explicitly!
""")

    print("\n" + "="*80)
    print("To customize tests, edit the run_example_tests() function")
    print("or create new FilterGroup and TrafficEntry objects.")
    print("="*80)

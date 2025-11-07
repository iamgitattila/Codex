# Retrack Filter Testing Tool

A Python tool to test and understand Retrack's filter logic for redirect domains. This helps you decode their filtering system and avoid surprises with traffic routing.

## The Problem

Retrack uses a filtering system that can be confusing:
- **Include**: Exact match
- **Exclude**: Does NOT match (anything but this)
- **Contains**: Substring match
- **No Contains**: Does NOT contain substring

The behavior isn't always intuitive, especially when:
- You don't have a catch-all path
- Multiple paths match the same traffic
- You combine multiple filters on one path

## Quick Start

```bash
python3 retrack_filter_tester.py
```

This will run 5 example scenarios showing different filter configurations.

## How It Works

The tool simulates Retrack's filter logic:

1. **FilterGroup** = A path/destination in Retrack with filters
2. **Filter** = A single filter rule (field + type + value)
3. **TrafficEntry** = A simulated visitor with sub_id, country, device, etc.

## Example Scenarios Included

### Scenario 1: Single "contains" filter with catch-all
Tests what happens when you have one filtered path and one catch-all

### Scenario 2: Only "contains" filter, NO catch-all
This is where the weird behavior happens - unmatched traffic goes nowhere!

### Scenario 3: INCLUDE vs CONTAINS
Shows the difference between exact match and substring match

### Scenario 4: Multiple filters (AND logic)
Tests how multiple filters on one path work together

### Scenario 5: EXCLUDE filter
Tests the "anything but this" logic

## Creating Your Own Tests

### Example: Test your specific sub_id filter

```python
from retrack_filter_tester import *

# Create simulator
simulator = RetrackFilterSimulator()

# Path 1: sub_id CONTAINS "fb"
path_facebook = FilterGroup(name="Facebook_Traffic", weight=200)
path_facebook.filters.append(Filter(
    field=FilterField.SUB_ID,
    filter_type=FilterType.CONTAINS,
    value="fb"
))

# Path 2: sub_id CONTAINS "google"
path_google = FilterGroup(name="Google_Traffic", weight=200)
path_google.filters.append(Filter(
    field=FilterField.SUB_ID,
    filter_type=FilterType.CONTAINS,
    value="google"
))

# Path 3: Catch-all for everything else
path_other = FilterGroup(name="Other_Traffic", weight=100)

# Add all paths
simulator.add_filter_group(path_facebook)
simulator.add_filter_group(path_google)
simulator.add_filter_group(path_other)

# Create test traffic
test_traffic = [
    TrafficEntry(sub_id="fb_campaign_1"),
    TrafficEntry(sub_id="fb_campaign_2"),
    TrafficEntry(sub_id="google_ads_1"),
    TrafficEntry(sub_id="google_ads_2"),
    TrafficEntry(sub_id="tiktok_1"),
    TrafficEntry(sub_id="random_123"),
]

# Run test
results = simulator.test_traffic_batch(test_traffic)
print_results(results, "My Custom Test")
```

## Understanding Filter Types

### INCLUDE (Exact Match)
```python
Filter(field=FilterField.SUB_ID, filter_type=FilterType.INCLUDE, value="abc")
# Matches: "abc"
# Doesn't match: "abc123", "xyzabc", "ABC", "def"
```

### EXCLUDE (Not Equal)
```python
Filter(field=FilterField.SUB_ID, filter_type=FilterType.EXCLUDE, value="abc")
# Matches: "abc123", "xyz", "def", anything except "abc"
# Doesn't match: "abc" (exact match)
```

### CONTAINS (Substring)
```python
Filter(field=FilterField.SUB_ID, filter_type=FilterType.CONTAINS, value="abc")
# Matches: "abc", "abc123", "xyzabc", "abcdef"
# Doesn't match: "xyz", "def", "ABC" (case-sensitive)
```

### NO_CONTAINS (Doesn't Contain)
```python
Filter(field=FilterField.SUB_ID, filter_type=FilterType.NO_CONTAINS, value="abc")
# Matches: "xyz", "def", "123"
# Doesn't match: "abc", "abc123", "xyzabc"
```

## Multi-Filter Logic (AND)

When you add multiple filters to one path, ALL must match:

```python
path = FilterGroup(name="Specific_Traffic")
path.filters.append(Filter(
    field=FilterField.SUB_ID,
    filter_type=FilterType.CONTAINS,
    value="fb"
))
path.filters.append(Filter(
    field=FilterField.COUNTRY,
    filter_type=FilterType.INCLUDE,
    value="US"
))
# Only matches traffic with sub_id containing "fb" AND country = "US"
```

## Weight/Priority

When multiple paths match the same traffic, higher weight wins:

```python
path_a = FilterGroup(name="Path_A", weight=300)  # Highest priority
path_b = FilterGroup(name="Path_B", weight=200)
path_c = FilterGroup(name="Path_C", weight=100)  # Lowest priority
```

## Best Practices (Learned from Testing)

1. **Always add a catch-all path** (no filters, lowest weight) to handle unmatched traffic
2. **Use CONTAINS carefully** - it might match more traffic than you expect
3. **Test edge cases** - what happens with empty sub_ids, special characters, etc.
4. **Use weights strategically** - higher weight = higher priority when multiple paths match
5. **Document your filter logic** - it's easy to forget why you set something up a certain way

## Common Gotchas

### The 50-50 Split Mystery
If you set up a filter that "contains" a value but don't have a catch-all, unmatched traffic goes nowhere (or Retrack might have some default behavior that splits it).

**Solution**: Always add a catch-all path!

### Case Sensitivity
The filters appear to be case-sensitive. "abc" ≠ "ABC"

### Multiple Matches
If traffic matches multiple paths, the one with the highest weight wins. If weights are equal, behavior might be unpredictable.

## Advanced Testing

### Test with realistic traffic volumes

```python
# Generate 1000 random sub_ids
import random

test_traffic = []
sources = ["fb", "google", "tiktok", "twitter", "reddit"]
for i in range(1000):
    source = random.choice(sources)
    sub_id = f"{source}_campaign_{random.randint(1, 100)}"
    test_traffic.append(TrafficEntry(sub_id=sub_id))

results = simulator.test_traffic_batch(test_traffic)
print_results(results, "1000 Random Visitors")
```

### Test with different countries, devices, etc.

```python
test_traffic = [
    TrafficEntry(sub_id="fb_us", country="US", device="mobile"),
    TrafficEntry(sub_id="fb_uk", country="UK", device="desktop"),
    TrafficEntry(sub_id="fb_ca", country="CA", device="tablet"),
]
```

## Troubleshooting

**Q: My filter isn't matching anything**
- Check if the filter type is correct (INCLUDE vs CONTAINS)
- Check case sensitivity
- Add debug output to see the actual values being compared

**Q: Traffic is going to the wrong path**
- Check weights - higher weight wins
- Check if multiple filters are ANDed correctly
- Use the detailed results to see exactly what's matching

**Q: I want to simulate OR logic (match A OR B)**
- Create separate paths for each condition
- Give them equal weights
- Or use a catch-all with EXCLUDE filters

## Files

- `retrack_filter_tester.py` - Main testing tool with example scenarios
- `README_RETRACK_TESTER.md` - This file

## Next Steps

1. Run the example scenarios: `python3 retrack_filter_tester.py`
2. Understand the output and how each filter type works
3. Create your own test scenarios based on your actual Retrack setup
4. Test different configurations before implementing in production
5. Document what you learn!

## Contributing

Found a weird behavior? Add a new test scenario to document it!

---

**Remember**: The goal is to understand the logic BEFORE you set it up in production. Test, test, test!

import importlib.metadata

try:
    importlib.metadata.packages_distributions()
    print("Success")
except Exception as e:
    print(f"FAILED: {e}")
    # Try to find which one is broken
    print("Scanning distributions...")
    for dist in importlib.metadata.distributions():
        try:
            # Try to get the name
            name = dist.metadata['Name']
        except Exception as inner_e:
            # If name failed, identify it by its representation or internal path
            location = getattr(dist, "_path", "Unknown Location")
            print(f"Broken distribution found at: {location}")
            print(f"Error while reading metadata: {inner_e}")
            print(f"Raw object: {dist!r}")
            print("-" * 20)



# Museum 3D models

The GLB files in this folder are original, low-poly illustrations generated for
KaalChakra by [`frontend/scripts/build_museum_models.py`](../../../scripts/build_museum_models.py).
They are visual aids, not authenticated object scans or historically verified
portraits. The exhibit pages say so wherever a model is shown. They may be
regenerated with Python's standard library:

```powershell
python frontend/scripts/build_museum_models.py
```

The Jiretop exhibit continues to use the existing `/models/artifact-helmet.glb`.
All other starter exhibits have a matching model in this folder. Admins can
replace or remove an exhibit model URL from the Museum editor.

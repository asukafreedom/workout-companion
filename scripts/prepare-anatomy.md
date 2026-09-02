# Anatomy model pipeline

The GLBs in `public/models/` are decimated+meshopt-compressed builds of the
BodyExplorer assets (BodyParts3D + Z-Anatomy mesh data, CC-BY-SA):

```
curl -LO https://raw.githubusercontent.com/JohanBellander/BodyExplorer/main/public/anatomy.glb
curl -LO https://raw.githubusercontent.com/JohanBellander/BodyExplorer/main/public/skeleton.glb
npx gltf-transform optimize anatomy.glb  public/models/anatomy.glb  --compress meshopt --texture-compress false --simplify true --simplify-ratio 0.25 --simplify-error 0.001 --no-flatten --no-join
npx gltf-transform optimize skeleton.glb public/models/skeleton.glb --compress meshopt --texture-compress false --simplify true --simplify-ratio 0.15 --simplify-error 0.001 --no-flatten --no-join
```

`--no-join`/`--no-flatten` preserve the per-muscle node names that
`src/three/muscleMap.ts` matches against. Attribution lives on the Plan screen.

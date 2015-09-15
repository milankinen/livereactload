

export default function applyPatch($scope, patch) {
  console.log(
    "LiveReactload :: Patch\n",
    "  -- ", patch
  )
  patch.forEach(({src, file, hash}) => {
    // TODO how to handle new modules?
    const {require, module, exports} = $scope.moduleInfo[file]
    const __reload = new Function("require", "module", "exports", src)
    console.log(
      "LiveReactload :: Apply patch\n",
      "  -- ", file
    )
    $scope.hashes[file] = hash
    __reload(require, module, exports)
    console.log(
      "   -- done"
    )
  })
}

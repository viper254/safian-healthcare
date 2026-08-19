#!/usr/bin/env bash
# Safian customer client: deterministic local DEB packaging for a Flutter Linux release build.
# This script produces a staging artifact only and never publishes or deploys anything.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(awk '/^version:/{print $2}' "$ROOT_DIR/pubspec.yaml" | cut -d+ -f1)"
PACKAGE="safian-customer"
STAGE="$ROOT_DIR/build/deb-stage"
BUNDLE="$ROOT_DIR/build/linux/x64/release/bundle"
OUT="$ROOT_DIR/build/${PACKAGE}_${VERSION}_amd64.deb"

cd "$ROOT_DIR"
flutter build linux --release
rm -rf "$STAGE"
mkdir -p "$STAGE/DEBIAN" "$STAGE/usr/lib/$PACKAGE" "$STAGE/usr/bin" "$STAGE/usr/share/applications"
cp -a "$BUNDLE/." "$STAGE/usr/lib/$PACKAGE/"

cat > "$STAGE/DEBIAN/control" <<EOF
Package: $PACKAGE
Version: $VERSION
Section: misc
Priority: optional
Architecture: amd64
Maintainer: Safian Healthcare
Description: Safian Healthcare customer application
EOF

cat > "$STAGE/usr/bin/$PACKAGE" <<EOF
#!/usr/bin/env bash
exec /usr/lib/$PACKAGE/safian_customer "\$@"
EOF
chmod +x "$STAGE/usr/bin/$PACKAGE"

cat > "$STAGE/usr/share/applications/$PACKAGE.desktop" <<EOF
[Desktop Entry]
Name=Safian Healthcare
Exec=$PACKAGE
Type=Application
Categories=Office;MedicalSoftware;
EOF

dpkg-deb --build --root-owner-group "$STAGE" "$OUT"
echo "Created $OUT"

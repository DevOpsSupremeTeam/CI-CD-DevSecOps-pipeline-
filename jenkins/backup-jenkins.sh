#!/usr/bin/env bash
# Backup JENKINS_HOME - chi giu state that, bo thu Jenkins tu sinh lai.
#
#   ./backup-jenkins.sh                 -> ~/backups/jenkins/jenkins-<ts>.tar.gz
#   ./backup-jenkins.sh /mnt/d/backups  -> ghi vao thu muc khac
#   WITH_PLUGINS=1 ./backup-jenkins.sh  -> kem ca file .jpi (nang hon ~150MB)
#
# Khoi phuc: xem README.md cung thu muc.
set -euo pipefail

JENKINS_HOME="${JENKINS_HOME:-$HOME/jenkins_home}"
DEST="${1:-$HOME/backups/jenkins}"
KEEP="${KEEP:-5}"           # so ban backup giu lai
WITH_PLUGINS="${WITH_PLUGINS:-0}"

[ -d "$JENKINS_HOME" ] || { echo "Khong thay JENKINS_HOME: $JENKINS_HOME" >&2; exit 1; }
mkdir -p "$DEST"

TS=$(date +%Y%m%d-%H%M%S)
ARCHIVE="$DEST/jenkins-$TS.tar.gz"

# Thu muc Jenkins tu tao lai duoc -> khong can backup
EXCLUDES=(
  --exclude=war                 # Jenkins giai nen lai moi lan khoi dong
  --exclude=caches
  --exclude=workspace           # source code, git clone lai duoc
  --exclude=updates
  --exclude=logs
  --exclude=.cache
  --exclude=.java
  --exclude='*.log'
  --exclude='jobs/*/builds/*/archive'
)

if [ "$WITH_PLUGINS" != "1" ]; then
  # Khong tar binary plugin - chi luu danh sach de cai lai
  EXCLUDES+=(--exclude=plugins)
fi

# Danh sach plugin + version, luon luu kem
PLUGINS_TXT="$DEST/plugins-$TS.txt"
if [ -d "$JENKINS_HOME/plugins" ]; then
  for jpi in "$JENKINS_HOME"/plugins/*.jpi; do
    [ -e "$jpi" ] || continue
    name=$(basename "$jpi" .jpi)
    ver=$(unzip -p "$jpi" META-INF/MANIFEST.MF 2>/dev/null \
          | tr -d '\r' | awk -F': ' '/^Plugin-Version/{print $2; exit}')
    echo "${name}:${ver:-latest}"
  done | sort > "$PLUGINS_TXT"
  echo "Plugin list: $PLUGINS_TXT ($(wc -l < "$PLUGINS_TXT") plugin)"
fi

echo "Dang backup $JENKINS_HOME ..."
tar -czf "$ARCHIVE" "${EXCLUDES[@]}" -C "$(dirname "$JENKINS_HOME")" "$(basename "$JENKINS_HOME")"

# Chua secrets/ va credentials.xml -> khong cho user khac doc
chmod 600 "$ARCHIVE"

echo "Xong: $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"

# Kiem tra archive doc duoc, va co du thu quan trong khong
echo "Kiem tra archive..."
LIST=$(tar -tzf "$ARCHIVE") || { echo "ARCHIVE HONG" >&2; exit 1; }
for must in secrets/ config.xml jobs/ credentials.xml; do
  grep -q "/$must" <<<"$LIST" \
    || echo "  CANH BAO: khong thay $must trong archive" >&2
done
echo "Archive OK ($(grep -c . <<<"$LIST") entry)."

# Don ban cu
ls -1t "$DEST"/jenkins-*.tar.gz 2>/dev/null | tail -n +$((KEEP+1)) | while read -r old; do
  echo "Xoa ban cu: $(basename "$old")"
  rm -f "$old" "${old%.tar.gz}".txt
  rm -f "$DEST/plugins-$(basename "$old" .tar.gz | sed 's/^jenkins-//').txt"
done

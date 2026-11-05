#!/usr/bin/env bash
# ============================================================================
# retarget.sh — ganti domain "lukisan" ke topik UTS baru.
# Jalankan dari AKAR repo:  bash scripts/retarget.sh
#
# ISI HANYA YANG BERUBAH. Nilai yang dibiarkan "" TIDAK disentuh sama sekali.
# Contoh minimal — topik baru cuma mengganti nama resource dan field unik:
#   MAIN_NEW="buku"; SUP_NEW="penulis"; UNIK_NEW="kodeBuku"; FILTER_NEW="genre"
# Field "judul", "harga", embed "ukuran"/"kritik" tetap seperti aslinya.
#
# ATURAN EMAS: skrip hanya MENERJEMAHKAN LABEL. Jumlah data (3 pendukung,
# 6 utama), angka harga, dan struktur subdokumen tidak diubah — itu sebabnya
# assertion Postman tetap sahih tanpa diedit.
# ============================================================================
set -euo pipefail

# ------------------- ISIAN (kosong = tidak diubah) --------------------------
MAIN_NEW=""        # resource utama + sebutan Indonesia.  contoh: menu
SUP_NEW=""         # resource pendukung + sebutan Indonesia. contoh: kedai
UNIK_NEW=""        # [unik]                        contoh: kodeMenu
TEKS_NEW=""        # [teks] bila bukan "judul"     contoh: nama
ANGKA_NEW=""       # [angka] bila bukan "harga"    contoh: ukuranMb
FILTER_NEW=""      # [filter]                      contoh: kategori
EMBED1_NEW=""      # [embed] ke-1                  contoh: varian
EMBED2_NEW=""      # [embed] ke-2                  contoh: ulasan
EXTRA_NEW=""       # field angka opsional          contoh: tahunBuka
PREFIX_NEW=""      # awalan [unik] di seed         contoh: MNU-
VAL1_NEW=""        # nilai [filter] ke-1 di seed   contoh: makanan
VAL2_NEW=""        # nilai [filter] ke-2 di seed   contoh: minuman
VAL3_NEW=""        # nilai [filter] ke-3 di seed   contoh: dessert
MEDIA_NEW=""       # teks di subdokumen embed      contoh: Porsi
TOPIKNO_NEW=""     # nomor topik                   contoh: Topik 07
TOPIK_NEW=""       # nama topik tanpa nomor        contoh: Menu Kedai
# ---------------------------------------------------------------------------

# Turunan otomatis. Tidak perlu diisi.
cap() { printf '%s' "$(printf '%s' "$1" | cut -c1 | tr '[:lower:]' '[:upper:]')$(printf '%s' "$1" | cut -c2-)"; }
slug() { printf '%s' "$1" | tr ' ' '-'; }
MAIN_CLS=""; [ -n "$MAIN_NEW" ] && MAIN_CLS=$(cap "$MAIN_NEW")
SUP_CLS="";  [ -n "$SUP_NEW" ]  && SUP_CLS=$(cap "$SUP_NEW")

# 0. Cegah dijalankan dua kali pada pohon yang sudah di-retarget.
#    Run kedua merusak: token baru yang memuat token lama ikut tersubstitusi lagi.
#    Contoh nyata: "harga"->"ukuranMb" pada run pertama, lalu aturan "ukuran"
#    mencocokkan "ukuran" di dalam "ukuranMb" sehingga jadi "spesifikasiMb".
MARKER=".retarget-applied"
if [ -f "$MARKER" ] && [ "${1:-}" != "--force" ]; then
  echo "Pohon ini sudah pernah di-retarget (penanda: $MARKER)."
  echo "Menjalankan ulang akan merusak nama field. Pilihan:"
  echo "  git restore .                      # kembali ke kondisi Lukisan, lalu jalankan lagi"
  echo "  bash scripts/retarget.sh --force   # paksa jalan (paham risikonya)"
  exit 1
fi

# 1. Rename berkas. Stem memakai nama resource huruf kecil, sama seperti aslinya,
#    supaya require("./menuModel") tetap cocok di filesystem case-sensitive.
mv_if() {
  [ -f "$1" ] || return 0
  [ "$1" = "$2" ] && return 0
  mv "$1" "$2"
}
if [ -n "$MAIN_NEW" ]; then
  mv_if "routes/paintingsRoutes.js"          "routes/${MAIN_NEW}Routes.js"
  mv_if "controllers/paintingsController.js" "controllers/${MAIN_NEW}Controller.js"
  mv_if "models/paintingsModel.js"           "models/${MAIN_NEW}Model.js"
fi
if [ -n "$SUP_NEW" ]; then
  mv_if "routes/artistsRoutes.js"           "routes/${SUP_NEW}Routes.js"
  mv_if "controllers/artistsController.js"  "controllers/${SUP_NEW}Controller.js"
  mv_if "models/artistsModel.js"            "models/${SUP_NEW}Model.js"
fi
if [ -n "$TOPIK_NEW" ]; then
  mv_if "postman/Tugas3_Lukisan_MongoDB.postman_collection.json" \
        "postman/Tugas3_$(slug "$TOPIK_NEW").postman_collection.json"
  mv_if "postman/Tugas3_Lukisan_MongoDB.postman_environment.json" \
        "postman/Tugas3_$(slug "$TOPIK_NEW").postman_environment.json"
elif [ -n "$MAIN_CLS" ]; then
  # TOPIK_NEW kosong tapi resource berganti: tetap ganti nama berkas agar cocok isinya.
  mv_if "postman/Tugas3_Lukisan_MongoDB.postman_collection.json" \
        "postman/Tugas3_${MAIN_CLS}.postman_collection.json"
  mv_if "postman/Tugas3_Lukisan_MongoDB.postman_environment.json" \
        "postman/Tugas3_${MAIN_CLS}.postman_environment.json"
fi

# 2. Susun aturan substitusi DUA FASE.
#    Fase 1: token lama -> penanda unik (@r0@, @r1@, ...).
#    Fase 2: penanda -> token baru.
#    Ini mencegah substitusi berantai: tanpa fase, "harga"->"ukuranMb" lalu
#    "ukuran"->"spesifikasi" menghasilkan "spesifikasiMb" yang salah.
PH1=()
PH2=()
IDX=0
add() {
  if [ -z "$2" ]; then return 0; fi
  if [ "$1" = "$2" ]; then return 0; fi
  PH1+=(-e "s|$1|@r${IDX}@|g")
  PH2+=(-e "s|@r${IDX}@|$2|g")
  IDX=$((IDX + 1))
}
add "kodeLukisan"            "$UNIK_NEW"
if [ -n "$MAIN_NEW" ]; then add "jumlahLukisan" "jumlah${MAIN_CLS}"; fi
add "tahunDibuat"            "$EXTRA_NEW"
if [ -n "$TEKS_NEW" ]; then add "Judul" "$(cap "$TEKS_NEW")"; fi
add "judul"                  "$TEKS_NEW"
if [ -n "$ANGKA_NEW" ]; then add "Harga" "$(cap "$ANGKA_NEW")"; fi
add "harga"                  "$ANGKA_NEW"
add "paintings"              "$MAIN_NEW"
add "Painting"               "$MAIN_CLS"
add "painting"               "$MAIN_NEW"
add "artists"                "$SUP_NEW"
add "Artist"                 "$SUP_CLS"
add "artist"                 "$SUP_NEW"
add "Pelukis"                "$SUP_CLS"
add "pelukis"                "$SUP_NEW"
add "Lukisan"                "$MAIN_CLS"
add "lukisan"                "$MAIN_NEW"
add "aliran"                 "$FILTER_NEW"
add "ukuran"                 "$EMBED1_NEW"
if [ -n "$EMBED2_NEW" ]; then add "Kritik" "$(cap "$EMBED2_NEW")"; fi
add "kritik"                 "$EMBED2_NEW"
add "LKS-"                   "$PREFIX_NEW"
add "realisme"               "$VAL1_NEW"
add "impresionisme"          "$VAL2_NEW"
add "abstrak"                "$VAL3_NEW"
add "Kanvas"                 "$MEDIA_NEW"
add "Topik 14"               "$TOPIKNO_NEW"
add "Galeri Seni"            "$TOPIK_NEW"
if [ -n "$TOPIK_NEW" ]; then add "galeri seni" "$(printf '%s' "$TOPIK_NEW" | tr '[:upper:]' '[:lower:]')"; fi

if [ ${#PH1[@]} -eq 0 ]; then
  echo "Blok ISIAN masih kosong — tidak ada yang diubah."
  echo "Isi minimal satu variabel (mis. MAIN_NEW), lalu jalankan lagi."
  exit 0
fi

FILES=(
  app.js package.json models/*.js controllers/*.js routes/*.js
  middlewares/*.js utils/*.js config/*.js scripts/seed.js README.md .env.example
  postman/Tugas3_*.postman_collection.json postman/Tugas3_*.postman_environment.json
)
sed -E -i "${PH1[@]}" "${FILES[@]}"
sed -E -i "${PH2[@]}" "${FILES[@]}"

# 3. Verifikasi. Hanya token yang MEMANG diminta berganti yang diperiksa.
SISA=0
echo "== Sisa token domain lama =="
cek() {
  if [ -z "$2" ]; then return 0; fi
  if [ "$1" = "$2" ]; then return 0; fi
  local n
  # Cocokkan batas identifier untuk token alfanumerik, supaya "ukuran" tidak
  # ikut menangkap "ukuranMb" (hasil sah dari [angka]).
  if printf '%s' "$1" | grep -qE '^[A-Za-z][A-Za-z0-9_]*$'; then
    n=$( { grep -rIE --exclude-dir=node_modules \
          -e "(^|[^A-Za-z0-9_])$1([^A-Za-z0-9_]|$)" \
          app.js models controllers routes middlewares utils config \
          scripts/seed.js postman/Tugas3_*.postman_collection.json 2>/dev/null || true; } | wc -l )
  else
    n=$( { grep -rIF --exclude-dir=node_modules -e "$1" \
          app.js models controllers routes middlewares utils config \
          scripts/seed.js postman/Tugas3_*.postman_collection.json 2>/dev/null || true; } | wc -l )
  fi
  if [ "$n" -gt 0 ]; then
    echo "  $1 : $n baris tersisa — perbaiki manual"
    SISA=1
  fi
}
if [ -n "$UNIK_NEW" ] && [ "$UNIK_NEW" != "" ]; then cek "kodeLukisan" "$UNIK_NEW"; fi
if [ -n "$MAIN_NEW" ]; then cek "paintings" "$MAIN_NEW"; cek "Painting" "$MAIN_CLS"; fi
if [ -n "$SUP_NEW" ]; then cek "artists" "$SUP_NEW"; cek "Artist" "$SUP_CLS"; cek "pelukis" "$SUP_NEW"; fi
if [ -n "$FILTER_NEW" ]; then cek "aliran" "$FILTER_NEW"; fi
if [ -n "$TEKS_NEW" ]; then cek "judul" "$TEKS_NEW"; fi
if [ -n "$ANGKA_NEW" ]; then cek "harga" "$ANGKA_NEW"; fi
if [ -n "$EMBED1_NEW" ]; then cek "ukuran" "$EMBED1_NEW"; fi
if [ -n "$EMBED2_NEW" ]; then cek "kritik" "$EMBED2_NEW"; fi
if [ -n "$EXTRA_NEW" ]; then cek "tahunDibuat" "$EXTRA_NEW"; fi

# 4. Nama berkas vs require. Bedanya huruf besar-kecil menggigit di Linux/macOS.
echo
echo "== Nama berkas vs require =="
while read -r rel; do
  [ -n "$rel" ] || continue
  d=${rel%%/*}; n=${rel#*/}
  if ls "$d" 2>/dev/null | grep -qx "${n}.js"; then
    echo "  ok     $rel"
  else
    echo "  HILANG $rel -> tidak ada berkas ${n}.js (cek huruf besar-kecil)"
    SISA=1
  fi
done < <(grep -rhoE '\.\.?/[A-Za-z]+/[A-Za-z]+' app.js models controllers routes 2>/dev/null \
         | sed -E 's|^\.\.?/||' | sort -u)

if [ "$SISA" -eq 0 ]; then
  : > "$MARKER"
  echo "bersih"
  echo
  echo "Penanda $MARKER ditulis; jalankan ulang akan ditolak."
  echo "Lanjut: npm run seed && npm start, lalu newman (target 27 request / 59 assertion / 0 failed)."
else
  echo
  echo "Ada yang belum beres — perbaiki dulu sebelum seed/newman."
  exit 1
fi

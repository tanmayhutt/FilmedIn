for comp in 420 3 1 2 4 33 41077 174 5; do
  curl -s "https://api.themoviedb.org/3/company/${comp}?api_key=${TMDB_API_KEY}" | jq -r '(.name) + ": " + (.logo_path // "null")' >> logos.txt
done
for net in 49 213 2552 1024; do
  curl -s "https://api.themoviedb.org/3/network/${net}?api_key=${TMDB_API_KEY}" | jq -r '(.name) + ": " + (.logo_path // "null")' >> logos.txt
done

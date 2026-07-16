async function run() {
  const res = await fetch('https://image.tmdb.org/t/p/w1280/xJHokMbljvjEVAZS3x612gPE4NI.jpg', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
  });
  const text = await res.text();
  console.log(text.substring(0, 300));
}
run();

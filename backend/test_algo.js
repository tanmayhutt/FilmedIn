async function run() {
  const res = await fetch('https://image.tmdb.org/t/p/w1280/xJHokMbljvjEVAZS3x612gPE4NI.jpg');
  const buffer = Buffer.from(await res.arrayBuffer());
  console.log('Buffer length:', buffer.length);
  console.log('First 10 bytes:', buffer.slice(0, 10).toString('hex'));
}
run();

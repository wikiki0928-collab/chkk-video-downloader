const url = "https://www.facebook.com/share/v/18TiuBapvp/";

async function test() {
  try {
    const res = await fetch("https://capi.3kh0.net/", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: url,
        videoQuality: "1080",
        filenameStyle: "pretty"
      })
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

test();

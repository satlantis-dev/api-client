import { NostrKind, verifyEvent } from "@blowater/nostr-sdk";

// nos2x
// const res = await
fetch("https://api-dev.satlantis.io/login/nostr", {
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "text/plain;charset=UTF-8",
        "priority": "u=1, i",
        "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
    },
    "referrer": "https://www.dev.satlantis.io/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body":
        '{"created_at":1724339401,"kind":27236,"pubkey":"ad10ecb6c989bb2b4ba730819edcf0720a2c48ce3e6b4d6e313f77388ae29fe5","tags":[["auth","satlantis"]],"content":"{}","id":"5c54ebe8b50071a97e6f00d4ffba5f71ad07efa9c08401acdf2ef60a4a4533a9","sig":"00a45250f045c030d12692b3679a617ed985620d9ca97a11ca9c0c0ff8ca16ed71d7171b10a735c2bd7a4d2f63450d8065374e765262e96469b11a9e0e9e55e1"}',
    "method": "POST",
    "mode": "cors",
    "credentials": "omit",
});

// keys.band
const res = await fetch("https://api-dev.satlantis.io/login/nostr", {
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "text/plain;charset=UTF-8",
        "priority": "u=1, i",
        "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
    },
    "referrer": "https://www.dev.satlantis.io/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body":
        '{"created_at":1724339588,"kind":27236,"pubkey":"179ffbe98919ce6fe6c85eafe9b28a1cbbead31a2cdcf768ee1266994247fe73","tags":[["auth","satlantis"]],"content":"{}","id":"7fbc309b3c153a98d9beaf90043bf25d4585effe6443e24f3efb5c19d6a51790","sig":"e82afb742e64af7b60b3217ac87a53e1b5af6e01353042afe61c1e79c11b85d7f77d580e4e455d79dec61904b8e5fbc001375717cdadedbf19da95507af28fb6"}',
    "method": "POST",
    "mode": "cors",
    "credentials": "omit",
});

console.log(res.status);
console.log(await res.text());

const ok = await verifyEvent({
    "created_at": 1724339401,
    "kind": 27236 as NostrKind,
    "pubkey": "ad10ecb6c989bb2b4ba730819edcf0720a2c48ce3e6b4d6e313f77388ae29fe5",
    "tags": [["auth", "satlantis"]],
    "content": "{}",
    "id": "5c54ebe8b50071a97e6f00d4ffba5f71ad07efa9c08401acdf2ef60a4a4533a9",
    "sig":
        "00a45250f045c030d12692b3679a617ed985620d9ca97a11ca9c0c0ff8ca16ed71d7171b10a735c2bd7a4d2f63450d8065374e765262e96469b11a9e0e9e55e1",
});
console.log(ok);

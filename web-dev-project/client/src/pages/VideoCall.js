import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const VideoCall = () => {
  const [roomId, setRoomId] = useState('');
  const [inCall, setInCall] = useState(false);
  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerConnection = useRef();
  const socket = useRef();
  const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  useEffect(() => {
    // Initialize socket connection
    socket.current = io(process.env.REACT_APP_BACKEND_URL);

    socket.current.on('offer', (offer) => {
      peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      peerConnection.current.createAnswer().then((answer) => {
        peerConnection.current.setLocalDescription(answer);
        socket.current.emit('answer', answer);
      });
    });

    socket.current.on('answer', (answer) => {
      peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.current.on('candidate', (candidate) => {
      peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.current.on('user-disconnected', () => {
      remoteVideo.current.srcObject = null;
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const joinRoom = async () => {
    if (roomId.trim() === '') return alert('Enter a valid Room ID');
    setInCall(true);
    socket.current.emit('join-room', { roomId, userId: socket.current.id });

    // Access user media
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.current.srcObject = stream;

    // Create peer connection
    peerConnection.current = new RTCPeerConnection(servers);
    stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

    peerConnection.current.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit('candidate', event.candidate);
      }
    };

    socket.current.on('user-connected', async () => {
      const offer = await peerConnection.current.createOffer();
      peerConnection.current.setLocalDescription(offer);
      socket.current.emit('offer', offer);
    });
  };

  return (
    <div className="video-call-container">
      {!inCall ? (
        <div className="join-room">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div className="call-interface">
          <video ref={localVideo} autoPlay muted className="local-video" />
          <video ref={remoteVideo} autoPlay className="remote-video" />
          <button
            onClick={() => {
              setInCall(false);
              socket.current.disconnect();
            }}
          >
            Leave Call
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;

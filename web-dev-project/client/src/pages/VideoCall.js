import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const VideoCall = () => {
    const [roomId, setRoomId] = useState(''); // Chỉ dùng roomId từ input
    const [inCall, setInCall] = useState(false);
    const localVideo = useRef();
    const remoteVideo = useRef();
    const peerConnection = useRef();
    const socket = useRef();
    const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

    useEffect(() => {
        // Kết nối Socket.IO
        socket.current = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080');

        // Lắng nghe tín hiệu WebRTC
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
        if (roomId.trim() === '') return alert('Enter a valid Room ID'); // Kiểm tra Room ID

        setInCall(true);
        socket.current.emit('join-room', roomId); // Gửi roomId tới server

        try {
            // Lấy quyền truy cập camera và microphone
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.current.srcObject = stream;

            // Tạo kết nối WebRTC
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
                await peerConnection.current.setLocalDescription(offer);
                socket.current.emit('offer', offer);
            });
        } catch (error) {
            console.error('Lỗi khi truy cập camera/micro:', error);
        }
    };

    const leaveRoom = () => {
        setInCall(false);
        socket.current.emit('leave-room');
        peerConnection.current.close();
        socket.current.disconnect();
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            {!inCall ? (
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-2xl font-semibold">Join a Room</h2>
                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={joinRoom}
                        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                    >
                        Join Room
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <video
                        ref={localVideo}
                        autoPlay
                        muted
                        className="w-1/3 border border-gray-300 rounded-lg shadow-lg"
                    />
                    <video
                        ref={remoteVideo}
                        autoPlay
                        className="w-1/3 border border-gray-300 rounded-lg shadow-lg"
                    />
                    <button
                        onClick={leaveRoom}
                        className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                        Leave Call
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoCall;

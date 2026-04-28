import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { PhoneOff, Mic, Video } from 'lucide-react';

const socket = io('http://localhost:5000');

export const VideoCall = ({ roomId, userId }: { roomId: string, userId: string }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance>();

  useEffect(() => {
    // 1. Get Camera/Mic permissions
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;

        // 2. Join the Socket.io room we set up in server.js
        socket.emit('join-room', roomId, userId);

        // 3. Listen for the other person
        socket.on('user-connected', (id) => {
          console.log('Investor joined:', id);
          // Peer connection logic will be triggered here
        });
      });

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [roomId, userId]);

  return (
    <div className="flex flex-col items-center bg-gray-900 p-6 rounded-3xl min-h-[400px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Your Feed */}
        <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-blue-500 aspect-video">
          <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">You</span>
        </div>

        {/* Investor Feed */}
        <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-gray-700 aspect-video">
          <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">Investor</span>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button className="p-4 bg-gray-800 text-white rounded-full"><Mic size={20}/></button>
        <button className="p-4 bg-gray-800 text-white rounded-full"><Video size={20}/></button>
        <button onClick={() => window.location.reload()} className="p-4 bg-red-500 text-white rounded-full"><PhoneOff size={20}/></button>
      </div>
    </div>
  );
};
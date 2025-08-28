import React from 'react'
import VideoCall from './_components/video-call';

const VideoCallPage = async ({ searchParams }: { searchParams: { sessionId: string; token: string } }) => {
    const { sessionId, token } = await searchParams;

    return (
        <VideoCall sessionId={sessionId} token={token} />
    )
}

export default VideoCallPage
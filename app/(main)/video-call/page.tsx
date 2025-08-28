import React from 'react'
import VideoCall from './_components/video-call';

// PageProps interface'ini tanımla
interface PageProps {
    searchParams: Promise<{ sessionId: string; token: string }>;
}

const VideoCallPage = async ({ searchParams }: PageProps) => {
    // searchParams'ı resolve et
    const resolvedSearchParams = await searchParams;
    const { sessionId, token } = resolvedSearchParams;

    return (
        <VideoCall sessionId={sessionId} token={token} />
    )
}

export default VideoCallPage
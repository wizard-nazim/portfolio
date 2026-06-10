/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i1.sndcdn.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
}

export default nextConfig

/* 
<summary>
 * This file is used to configure the next.js application. 
 * It specifies that images can be loaded from the specified remote 
 * patterns, allowing the application to display images from 
 * those sources.
</summary> 
*/

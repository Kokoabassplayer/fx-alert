const nextConfig = {
    output: 'export', // generate static files
    /* the rest of your existing options */
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
        ],
    },
};
export default nextConfig;

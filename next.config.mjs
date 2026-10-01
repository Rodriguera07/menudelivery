import { withSentryConfig } from '@sentry/nextjs/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Restrito ao domínio do Vercel Blob (onde logo/banner/foto de produto são
    // hospedados) — nada de aceitar qualquer host HTTPS, que virava um proxy
    // SSRF aberto no endpoint de otimização de imagem do Next.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Restrito ao domínio do Vercel Blob (onde logo/banner/foto de produto são
    // hospedados) — nada de aceitar qualquer host HTTPS, que virava um proxy
    // SSRF aberto no endpoint de otimização de imagem do Next.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
};

export default nextConfig;

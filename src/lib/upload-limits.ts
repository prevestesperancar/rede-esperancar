// Constantes de tamanho máximo de arquivo — em arquivo próprio (sem imports de
// node:fs/@vercel/blob) pra poder ser usado tanto no servidor quanto em componentes cliente.
export const TAMANHO_MAXIMO_FOTO = 8 * 1024 * 1024; // 8MB — dá margem pra fotos HEIC de celular
export const TAMANHO_MAXIMO_DOCUMENTO = 15 * 1024 * 1024; // 15MB — slides/PDFs de aula

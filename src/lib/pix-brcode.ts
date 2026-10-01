// Gera o payload "Pix Copia e Cola" (BR Code) no padrão EMV do Banco Central — 100% local,
// sem chamar nenhuma API ou precisar de conta em provedor de pagamento. Ver especificação:
// https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf

function tlv(id: string, value: string) {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Remove acentos e caracteres fora do alfanumérico simples exigido pelo padrão EMV.
function sanitize(text: string, maxLength: number) {
  const stripped = text
    .normalize('NFD')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim();
  return (stripped || 'MENUDELIVERY').slice(0, maxLength);
}

export function buildPixPayload(opts: {
  pixKey: string;
  amount: number;
  merchantName: string;
  merchantCity?: string;
  txId: string;
}) {
  const merchantAccountInfo = tlv('00', 'br.gov.bcb.pix') + tlv('01', opts.pixKey.trim());
  const merchantCategoryCode = tlv('52', '0000');
  const transactionCurrency = tlv('53', '986'); // BRL
  const transactionAmount = tlv('54', opts.amount.toFixed(2));
  const countryCode = tlv('58', 'BR');
  const merchantName = tlv('59', sanitize(opts.merchantName, 25));
  const merchantCity = tlv('60', sanitize(opts.merchantCity ?? 'BRASIL', 15));
  const txIdSanitized = sanitize(opts.txId, 25).replace(/\s/g, '') || 'CZ';
  const additionalData = tlv('62', tlv('05', txIdSanitized));

  const payloadWithoutCrc =
    tlv('00', '01') + // Payload Format Indicator
    tlv('01', '12') + // Point of Initiation Method (12 = dinâmico/reutilizável, valor já embutido)
    tlv('26', merchantAccountInfo) +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalData +
    '6304'; // CRC ID + length, valor calculado a seguir

  return payloadWithoutCrc + crc16(payloadWithoutCrc);
}

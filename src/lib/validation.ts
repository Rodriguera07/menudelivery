import { z } from 'zod';
import { onlyDigits } from './format';

export const STORE_CATEGORIES = [
  'Salgados e bolos de pote',
  'Lanches e hambúrgueres',
  'Marmitas e refeições',
  'Pizzaria',
  'Doces e confeitaria',
  'Outro',
] as const;

export const merchantSignupSchema = z.object({
  storeName: z.string().trim().min(2, 'Informe o nome da loja'),
  category: z.string().trim().min(1, 'Selecione uma categoria'),
  ownerName: z.string().trim().min(2, 'Informe seu nome'),
  whatsapp: z.string().trim().min(8, 'Informe um WhatsApp válido').transform(onlyDigits),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
});

export const merchantLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Link inválido'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
});

export const customerSignupSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  phone: z.string().trim().min(8, 'Informe um WhatsApp válido').transform(onlyDigits),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('E-mail inválido')
    .optional()
    .or(z.literal('')),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
});

export const customerLoginSchema = z.object({
  identifier: z.string().trim().min(3, 'Informe seu WhatsApp ou e-mail'),
  password: z.string().min(1, 'Informe a senha'),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do produto'),
  category: z.string().trim().min(1, 'Informe a categoria'),
  description: z.string().trim().optional().or(z.literal('')),
  price: z.coerce.number().positive('Informe um preço válido'),
  promoPrice: z.coerce.number().positive('Informe uma promoção válida').nullable().optional(),
});

export const productUpdateSchema = productSchema.partial().extend({
  active: z.boolean().optional(),
});

export const COUPON_TYPES = ['PERCENT', 'FIXED', 'FREE_DELIVERY'] as const;

export const couponSchema = z.object({
  code: z.string().trim().min(2, 'Informe um código').max(30),
  type: z.enum(COUPON_TYPES),
  value: z.coerce.number().nonnegative('Informe um valor válido'),
  minOrder: z.coerce.number().nonnegative().optional(),
});

export const couponUpdateSchema = z.object({
  active: z.boolean().optional(),
});

export const storeSettingsSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome da loja').optional(),
  whatsapp: z.string().trim().min(8, 'Informe um WhatsApp válido').transform(onlyDigits).optional(),
  pixKey: z.string().trim().min(1, 'Informe uma chave Pix válida').optional().or(z.literal('')),
  deliveryFee: z.coerce.number().nonnegative().optional(),
  minOrder: z.coerce.number().nonnegative().optional(),
  isOpen: z.boolean().optional(),
  deliveryMode: z.enum(['FIXED', 'BY_DISTRICT']).optional(),
  zones: z
    .array(
      z.object({
        name: z.string().trim().min(2, 'Informe o nome do bairro').max(60),
        fee: z.coerce.number().nonnegative('Taxa do bairro inválida'),
        active: z.boolean().optional(),
      }),
    )
    .max(300, 'Máximo de 300 bairros')
    .optional(),
});

export const storeHoursSchema = z
  .array(
    z.object({
      weekday: z.number().int().min(0).max(6),
      closed: z.boolean(),
      openTime: z.string().nullable().optional(),
      closeTime: z.string().nullable().optional(),
    }),
  )
  .length(7, 'Envie os 7 dias da semana');

export const PAYMENT_METHODS = ['PIX', 'CREDIT', 'DEBIT', 'CASH'] as const;

export const ORDER_STATUSES = ['RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'] as const;

export const orderStatusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const addressSchema = z.object({
  cep: z.string().trim().min(8, 'Informe um CEP válido'),
  street: z.string().trim().min(2, 'Informe a rua'),
  number: z.string().trim().min(1, 'Informe o número'),
  complement: z.string().trim().optional().or(z.literal('')),
  district: z.string().trim().min(1, 'Informe o bairro'),
  city: z.string().trim().min(1, 'Informe a cidade'),
  reference: z.string().trim().optional().or(z.literal('')),
});

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, 'Informe o cupom'),
  subtotal: z.coerce.number().nonnegative(),
});

export const checkoutSchema = z.object({
  items: z
    .array(z.object({ productId: z.string(), qty: z.number().int().positive() }))
    .min(1, 'Seu carrinho está vazio'),
  couponCode: z.string().trim().optional().or(z.literal('')),
  address: addressSchema,
  paymentMethod: z.enum(PAYMENT_METHODS),
  changeFor: z.coerce.number().positive().nullable().optional(),
  notes: z.string().trim().optional().or(z.literal('')),
});

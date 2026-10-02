import { SITE } from '../config/site';
export const waLink = (msg: string) => `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`;
export const msgs = {
  product: (name: string) => `Hello ${SITE.boutique}, I'd like to enquire about "${name}".`,
  appointment: () => `Hello ${SITE.boutique}, I'd like to book an appointment.`,
  general: () => `Hello ${SITE.boutique}, I have a question.`,
};

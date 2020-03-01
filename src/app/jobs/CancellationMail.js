import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { delivery, problem } = data;

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Entrega cancelada!',
      template: 'cancellation',
      context: {
        deliveryman: delivery.deliveryman.name,
        product: delivery.product,
        canceled_at: format(
          parseISO(delivery.canceled_at),
          "'Dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
        recipient: delivery.recipient.name,
        recipient_name: delivery.recipient.name,
        recipient_street: delivery.recipient.street,
        recipient_number: delivery.recipient.number,
        recipient_complement: delivery.recipient.complement,
        recipient_city: delivery.recipient.city,
        recipient_state: delivery.recipient.state,
        recipient_postcode: delivery.recipient.postcode,
        problem: problem.description,
      },
    });
  }
}

export default new CancellationMail();

import Mail from '../../lib/Mail';

class NewDeliveryMail {
  get key() {
    return 'NewDeliveryMail';
  }

  async handle({ data }) {
    const { delivery } = data;

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Nova entrega!',
      template: 'new_delivery',
      context: {
        deliveryman: delivery.deliveryman.name,
        product: delivery.product,
        recipient: delivery.recipient.name,
        recipient_name: delivery.recipient.name,
        recipient_street: delivery.recipient.street,
        recipient_number: delivery.recipient.number,
        recipient_complement: delivery.recipient.complement,
        recipient_city: delivery.recipient.city,
        recipient_state: delivery.recipient.state,
        recipient_postcode: delivery.recipient.postcode,
      },
    });
  }
}

export default new NewDeliveryMail();

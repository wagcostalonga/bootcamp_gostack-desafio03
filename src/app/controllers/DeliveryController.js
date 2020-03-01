import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import Notification from '../schemas/Notification';

class DeliveryController {
  /**
   * Showing all deliveries
   */
  async index(req, res) {
    const { page = 1 } = req.query;

    const delivery = await Delivery.findAll({
      order: ['id'],
      limit: 20,
      offset: (page - 1) * 20,
      where: { canceled_at: null },
      attributes: [
        'id',
        'product',
        'recipient_id',
        'deliveryman_id',
        'start_date',
        'end_date',
      ],
    });
    return res.json(delivery);
  }

  /**
   * Creating deliveries
   */
  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number()
        .min(1)
        .required()
        .integer()
        .positive(),
      deliveryman_id: Yup.number()
        .min(1)
        .required()
        .integer()
        .positive(),
    });
    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Validation fails. Check all fields!' });
    }

    const recipientExist = await Recipient.findByPk(req.body.recipient_id);
    if (!recipientExist) {
      return res.status(401).json({ error: 'Recipient does not exist.' });
    }

    const deliverymanExist = await Deliveryman.findByPk(
      req.body.deliveryman_id
    );
    if (!deliverymanExist) {
      return res.status(401).json({ error: 'Deliveryman does not exist.' });
    }

    const { id, product, recipient_id, deliveryman_id } = await Delivery.create(
      req.body
    );

    /**
     * Notify delivery
     */
    const deliveryman = await Deliveryman.findOne({
      where: {
        id: deliveryman_id,
      },
    });
    const address = await Recipient.findOne({
      where: {
        id: recipient_id,
      },
    });

    await Notification.create({
      content: `Nova entrega para ${deliveryman.name}`,
      id: deliveryman_id,
      recipient: address.name,
      address: `${address.street} - ${address.number}, ${address.complement} - ${address.city}/${address.state} - CEP: ${address.postcode}`,
      product,
    });

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
    });
  }

  /**
   * Editing delivery
   */
  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number()
        .min(1)
        .required()
        .integer()
        .positive(),
      deliveryman_id: Yup.number()
        .min(1)
        .required()
        .integer()
        .positive(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation of delivery fails.' });
    }

    const { id } = req.params;
    const { recipient_id, deliveryman_id } = req.body;

    const delivery = await Delivery.findByPk(id);
    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exist.' });
    }

    const recipient = await Recipient.findOne({
      where: { id: recipient_id },
    });
    if (!recipient) {
      return res.status(401).json({ error: 'Recipient does not exist.' });
    }

    const deliveryman = await Deliveryman.findOne({
      where: { id: deliveryman_id },
    });
    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman does not exist.' });
    }

    const { product } = await delivery.update(req.body);
    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
    });
  }

  /**
   * Deleting delivery
   */
  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .min(1)
        .required()
        .positive(),
    });
    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation of deliveryman fails' });
    }
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exist. ' });
    }

    await delivery.destroy();
    return res.status(200).json({ message: 'Delivery was removed.' });
  }
}

export default new DeliveryController();

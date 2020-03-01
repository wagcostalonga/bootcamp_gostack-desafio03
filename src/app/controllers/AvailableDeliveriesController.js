import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

class AvailableDeliveriesController {
  async index(req, res) {
    const checkDeliveryman = await Deliveryman.findByPk(req.params.id);
    if (!checkDeliveryman) {
      return res.status(401).json({ error: 'Deliveryman does not exist.' });
    }

    const { id } = checkDeliveryman;
    const availableDeliveries = await Delivery.findAll({
      order: ['start_date'],
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: null,
      },
      attributes: ['id', 'product', 'recipient_id', 'start_date'],
    });
    return res.json(availableDeliveries);
  }
}

export default new AvailableDeliveriesController();

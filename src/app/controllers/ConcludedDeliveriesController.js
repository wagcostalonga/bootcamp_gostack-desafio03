import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class ConcludedDeliveriesController {
  async index(req, res) {
    const checkDeliveryman = await Deliveryman.findByPk(req.params.id);
    if (!checkDeliveryman) {
      return res.status(401).json({ error: 'Deliveryman does not exist.' });
    }

    const { id } = checkDeliveryman;
    const concludedDeliveries = await Delivery.findAll({
      order: ['end_date'],
      where: {
        deliveryman_id: id,
        canceled_at: null,
      },
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'recipient_id',
        'signature_id',
      ],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    return res.json(concludedDeliveries);
  }
}

export default new ConcludedDeliveriesController();

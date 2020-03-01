import * as Yup from 'yup';
import Problem from '../models/Problem';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class ProblemController {
  /**
   * Listing all problems
   */
  async show(req, res) {
    const { page = 1 } = req.query;

    const problems = await Problem.findAll({
      order: ['id'],
      limit: 10,
      offset: (page - 1) * 20,
    });
    return res.json(problems);
  }

  /**
   * Listing all problems by delivery
   */
  async index(req, res) {
    const { delivery_id } = req.params;
    const delivery = await Delivery.findByPk(delivery_id);
    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exist.' });
    }

    const problem = await Problem.findAll({
      where: {
        delivery_id: req.params.delivery_id,
      },
    });
    return res.json(problem);
  }

  /**
   * Creating Problems
   */
  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string()
        .required()
        .max(500),
    });
    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Validation fails. Check all fields!' });
    }

    const { delivery_id } = req.params;
    const delivery = await Delivery.findByPk(delivery_id);
    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exist.' });
    }

    const startDelivery = await Delivery.findOne({
      where: { id: delivery_id, start_date: null },
    });
    if (startDelivery) {
      return res.status(401).json({ error: 'Delivery was not withdrawl yet.' });
    }

    const { id, description } = await Problem.create({
      delivery_id,
      ...req.body,
    });
    return res.json({ id, delivery_id, description });
  }

  /**
   * Cancel a delivery based on problems
   */
  async delete(req, res) {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) {
      return res.status(401).json({ error: 'Delivery does not exist.' });
    }

    const delivery = await Delivery.findByPk(problem.delivery_id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'city',
            'state',
            'postcode',
          ],
        },
      ],
    });

    const { canceled_at } = await delivery.update({
      canceled_at: new Date(),
    });

    delivery.canceled_at = canceled_at;

    await Queue.add(CancellationMail.key, {
      delivery,
      problem,
    });

    return res.json(delivery);
  }
}

export default new ProblemController();

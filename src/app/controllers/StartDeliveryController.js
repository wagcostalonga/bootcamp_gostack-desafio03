import * as Yup from 'yup';
import {
  parseISO,
  isAfter,
  isBefore,
  setSeconds,
  setMinutes,
  setHours,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import NewDeliveryMail from '../jobs/NewDeliveryMail';
import Queue from '../../lib/Queue';

class StartDeliveryController {
  async update(req, res) {
    /**
     * Validation
     */
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Validation Fails. Check all fields!' });
    }

    /**
     * Finding the delivery id
     */
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id, {
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

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exist.' });
    }

    /**
     * Assigning date rules
     */
    const start_date = parseISO(req.body.start_date);

    const initHour = setSeconds(setMinutes(setHours(start_date, 8), 0), 0);
    const terminateHour = setSeconds(
      setMinutes(setHours(start_date, 18), 0),
      0
    );

    if (isBefore(start_date, new Date())) {
      return res.status(401).json({ error: 'Past dates are not allowed.' });
    }

    if (
      !isAfter(start_date, initHour) ||
      !isBefore(start_date, terminateHour)
    ) {
      return res.status(401).json({ error: 'Out of work hour.' });
    }

    /**
     * Max 5 withdrawl
     */
    const withdrawl = await Delivery.count({
      where: {
        deliveryman_id: delivery.deliveryman_id,
        start_date: {
          [Op.between]: [startOfDay(start_date), endOfDay(start_date)],
        },
      },
    });
    if (withdrawl > 5) {
      return res
        .status(401)
        .json({ error: 'The max number of withdrawls per day is 5.' });
    }

    /**
     * Returning changes
     */
    const { product, recipient_id, deliveryman_id } = await delivery.update({
      start_date,
    });

    await Queue.add(NewDeliveryMail.key, {
      delivery,
    });

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
      start_date,
    });
  }
}

export default new StartDeliveryController();

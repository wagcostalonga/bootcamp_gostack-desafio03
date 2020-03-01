import * as Yup from 'yup';
import {
  setSeconds,
  setMinutes,
  setHours,
  parseISO,
  isAfter,
  isBefore,
} from 'date-fns';
import Delivery from '../models/Delivery';

class EndDeliveryController {
  async update(req, res) {
    /**
     * Validation
     */
    const schema = Yup.object().shape({
      end_date: Yup.date().required(),
      signature_id: Yup.number()
        .min(1)
        .positive()
        .integer(),
    });
    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Validation Fails. Check all fields!' });
    }

    /**
     * Finding Delivery
     */
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);
    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exist.' });
    }

    /**
     * Assigning date rules
     */
    const { start_date } = await Delivery.findOne({ id });

    const end_date = parseISO(req.body.end_date);

    const initHour = setSeconds(setMinutes(setHours(end_date, 8), 0), 0);
    const terminateHour = setSeconds(setMinutes(setHours(end_date, 18), 0), 0);

    if (isBefore(end_date, start_date)) {
      return res.status(401).json({ error: 'Past dates are not allowed.' });
    }

    if (isAfter(end_date, new Date())) {
      return res.status(401).json({ error: 'Future dates are not allowed.' });
    }

    if (!isAfter(end_date, initHour) || !isBefore(end_date, terminateHour)) {
      return res.status(401).json({ error: 'Out of work hour.' });
    }

    /**
     * Returning changes
     */
    const {
      product,
      recipient_id,
      deliveryman_id,
      signature_id,
    } = await delivery.update(req.body);
    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
      start_date,
      end_date,
      signature_id,
    });
  }
}

export default new EndDeliveryController();

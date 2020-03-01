import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const deliveryman = await Deliveryman.findAll({
      order: ['id'],
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    return res.json(deliveryman);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Validation fails. Check all fields!' });
    }

    const deliverymanExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });
    if (deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman already exist.' });
    }

    const { id, name, email } = await Deliveryman.create(req.body);
    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().min(1),
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number().min(1),
    });
    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Validation of deliveryman fails.' });
    }

    const { id } = req.params;
    const { email } = req.body;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman does not exist.' });
    }

    if (id && id !== deliveryman.id) {
      const deliverymanExists = await Deliveryman.findOne({ where: { email } });

      if (deliverymanExists) {
        return res.status(401).json({ error: 'Deliveryman already exist.' });
      }
    }

    const { name, avatar_id } = await deliveryman.update(req.body);
    return res.json({
      name,
      email,
      avatar_id,
    });
  }

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

    const { id } = req.params;
    const deliveryman = await Deliveryman.findByPk(id);
    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman does not exist. ' });
    }

    await deliveryman.destroy();
    return res.status(200).json({ message: 'Deliveryman was removed.' });
  }
}

export default new DeliverymanController();

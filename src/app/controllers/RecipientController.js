import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      postcode: Yup.number()
        .required()
        .min(6),
    });
    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Validation fails. Check all fields!' });
    }

    const recipientExists = await Recipient.findOne({
      where: { name: req.body.name },
    });
    if (recipientExists) {
      return res.status(400).json({ error: 'Recipient already exists.' });
    }

    const {
      id,
      name,
      street,
      number,
      complement,
      city,
      state,
      postcode,
    } = await Recipient.create(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      complement,
      city,
      state,
      postcode,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number(),
      complement: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      postcode: Yup.number().min(6),
    });
    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Validation fails. Check all fields!' });
    }
    const { id } = req.params;
    const recipient = await Recipient.findByPk(id);
    if (!recipient) {
      return res.status(400).json({ error: 'The ID does not match.' });
    }
    const {
      name,
      street,
      number,
      complement,
      city,
      state,
      postcode,
    } = await recipient.update(req.body);
    return res.json({
      name,
      street,
      number,
      complement,
      city,
      state,
      postcode,
    });
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const recipient = await Recipient.findAll({
      order: ['id'],
      limit: 5,
      offset: (page - 1) * 5,
    });
    return res.json(recipient);
  }
}

export default new RecipientController();

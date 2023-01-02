const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Rol = require('../models/rol');
const Keys = require('../config/keys');
const storage = require('../utils/cloud_storage');

module.exports = {
  login(req, res) {
    const { email, password } = req.body;
    User.findByEmail(email, async (err, user) => {
      if (err) {
        return res.status(501).json({
          success: false,
          message: 'Hubo un error con el inicio de sesión del usuario',
          error: err,
        });
      }
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'El email no existe en los registros',
        });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const { id, name, lastname, email, phone, image } = user;
        const token = jwt.sign({ id, email }, Keys.secretOrKey, {});
        const data = {
          id,
          name,
          lastname,
          email,
          phone,
          image,
          session_token: `JWT ${token}`,
        };
        return res.status(201).json({
          success: true,
          message: 'El usuario fue autenticado exitosamente',
          data,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'El password es incorrecto',
        });
      }
    });
  },

  register(req, res) {
    const user = req.body;
    User.create(user, (err, data) => {
      if (err) {
        return res.status(501).json({
          success: false,
          message: 'Hubo un error con el registro del usuario',
          error: err,
        });
      }
      return res.status(201).json({
        success: true,
        message: 'El registro se realizó correctamente',
        data, // El id del nuevo usuario que se registró
      });
    });
  },

  async registerWithImage(req, res) {
    const user = JSON.parse(req.body.user);
    const files = req.files;
    if (files.length > 0) {
      const path = `image_${Date.now()}`;
      const url = await storage(files[0], path);
      if (url != undefined && url != null) {
        user.image = url;
      }
    }
    User.create(user, (err, data) => {
      if (err) {
        return res.status(501).json({
          success: false,
          message: 'Hubo un error con el registro del usuario',
          error: err,
        });
      }
      user.id = `${data}`;
      const token = jwt.sign(
        { id: user.id, email: user.email },
        Keys.secretOrKey,
        {}
      );
      user.session_token = `JWT ${token}`;
      Rol.create(user.id, 3, (err, data) => {
        if (err) {
          return res.status(501).json({
            success: false,
            message: 'Hubo un error con el registro del rol de usuario',
            error: err,
          });
        }
        return res.status(201).json({
          success: true,
          message: 'El registro se realizó correctamente',
          data: user,
        });
      });
    });
  },
};

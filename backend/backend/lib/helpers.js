const bcrypt = require('bcryptjs');

const helpers = {};

/**
 * Cifra una contraseña usando bcrypt.
 * @param {string} password La contraseña en texto plano a cifrar.
 * @returns {Promise<string>} La contraseña cifrada.
 */
helpers.encryptPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error('Error al cifrar la contraseña:', error);
    // En un entorno de producción, es mejor lanzar un error en lugar de devolver null.
    throw new Error('Error al cifrar la contraseña.');
  }
};

/**
 * Compara una contraseña en texto plano con una contraseña cifrada.
 * @param {string} password La contraseña en texto plano.
 * @param {string} savedPassword La contraseña cifrada de la base de datos.
 * @returns {Promise<boolean>} Devuelve true si las contraseñas coinciden, de lo contrario false.
 */
helpers.matchPassword = async (password, savedPassword) => {
  try {
    return await bcrypt.compare(password, savedPassword);
  } catch (error) {
    console.error('Error al comparar la contraseña:', error);
    return false;
  }
};

module.exports = helpers;

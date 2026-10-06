const modelo = require('../../modelo/admin/ActivarClienteModelo');
class ActivarClienteControlador {
static async modificarestado(req, res) {
 const { id } = req.params;
const errorCampos = ActivarClienteControlador.verCampos(id);
        if (errorCampos) {
            return res.status(400).json({ error: errorCampos });
        }
         try {
            const result = await modelo.modificarEstado(id);
            res.status(201).json({ mensaje: 'cliente activado con éxito'});
        } catch (err) {
            if (err.message.includes("Duplicate entry")) {
                return res.status(409).json({ error: 'Ya existe un cliente con estos datos.' });
              } else {
                return res.status(500).json({ error: 'Error inesperado: ' + err.message });
              }
        }
}
 static verCampos(id) {
        if (!id) {
            return 'no se reconoce el id del cliente.';
        }
        return null; // no encontro campos vacios
    }//cerrar verCampos

}

module.exports = ActivarClienteControlador;
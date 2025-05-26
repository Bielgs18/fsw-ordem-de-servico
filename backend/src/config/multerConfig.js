const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Define onde os arquivos serão salvos e como será o nome do arquivo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Apenas fotos do serviço serão salvas com multer
    if (file.fieldname === 'imagens_servico') {
      cb(null, path.resolve(__dirname, '..', '..', 'uploads', 'fotos-servico'));
    } else {
      // Qualquer outro campo será ignorado — mas salva por segurança
      cb(null, path.resolve(__dirname, '..', '..', 'uploads'));
    }
  },
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}-${hash}${ext}`;
    cb(null, filename);
  }
});

// Instancia o multer com as configurações definidas
const upload = multer({ storage });

module.exports = upload;

const { transporter, EMAIL_FROM, EMAIL_TO } = require('../config/nodmailer');
const { sanitizeInput, validateContactMessage } = require('../middlewares/sanitizers');

// Journal d'activité pour les soumissions de formulaires
const contactLog = [];

// Envoyer un message de contact
exports.sendContactMessage = async (req, res) => {
  try {
    const { message, name, email } = req.body;
    
    // Sanitization et validation...
    const sanitizedMessage = sanitizeInput(message);
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    
    const validation = validateContactMessage(sanitizedMessage);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.errors[0] });
    }
    
    // Journalisation de la demande
    const logEntry = {
      ip: req.ip,
      email: sanitizedEmail,
      name: sanitizedName,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    };
    
    contactLog.push(logEntry);
    console.log(`Contact form submission - Email: ${sanitizedEmail}, Time: ${new Date().toISOString()}`);
    
    // Limiter la taille du journal
    if (contactLog.length > 1000) {
      contactLog.shift(); // Supprimer l'entrée la plus ancienne
    }
    
    // Préparer l'email
    const mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: `Nouveau message de contact de ${sanitizedName || 'Utilisateur anonyme'}`,
      text: `
        Nom: ${sanitizedName || 'Non fourni'}
        Email: ${sanitizedEmail || 'Non fourni'}

        Message:
        ${sanitizedMessage}
    `,
      html: `
        <h3>Nouveau message de contact</h3>
        <p><strong>Nom:</strong> ${sanitizedName || 'Non fourni'}</p>
        <p><strong>Email:</strong> ${sanitizedEmail || 'Non fourni'}</p>
        <h4>Message:</h4>
        <p style="white-space: pre-wrap;">${sanitizedMessage}</p>
      `,
      replyTo: sanitizedEmail || undefined // Pour répondre directement à l'expéditeur
    };
    
    // Envoyer l'email
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.' 
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.' 
    });
  }
};

// Récupérer les logs des messages de contact (réservé aux admins)
exports.getContactLogs = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      contactLog
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des logs.'
    });
  }
};
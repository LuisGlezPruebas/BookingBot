import nodemailer from 'nodemailer';
import { Reservation } from '../../shared/schema';

/**
 * Configuración para el servicio de email
 */
const EMAIL_FROM = 'luisglez.pruebas@gmail.com';
const ADMIN_EMAIL = 'luisglez.pruebas@gmail.com'; 
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_FROM,
    pass: EMAIL_PASSWORD
  }
});

/**
 * Formatea una fecha ISO para mostrar en email (DD/MM/YYYY)
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

/**
 * Calcula las noches entre dos fechas
 */
const calculateNights = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Servicio de email para enviar notificaciones relacionadas con reservas
 */
export class EmailService {
  /**
   * Envía un email al administrador cuando se crea una nueva reserva
   */
  static async sendNewReservationNotificationToAdmin(reservation: Reservation, username: string): Promise<void> {
    try {
      const startDateFormatted = formatDate(reservation.startDate.toString());
      const endDateFormatted = formatDate(reservation.endDate.toString());
      const nights = calculateNights(reservation.startDate.toString(), reservation.endDate.toString());
      
      const mailOptions = {
        from: EMAIL_FROM,
        to: ADMIN_EMAIL,
        subject: `Nueva solicitud de reserva de ${username}`,
        html: `
          <h1>Nueva solicitud de reserva</h1>
          <p>Se ha recibido una nueva solicitud de reserva con los siguientes detalles:</p>
          
          <ul>
            <li><strong>Usuario:</strong> ${username}</li>
            <li><strong>Fecha de entrada:</strong> ${startDateFormatted}</li>
            <li><strong>Fecha de salida:</strong> ${endDateFormatted}</li>
            <li><strong>Duración:</strong> ${nights} noche${nights !== 1 ? 's' : ''}</li>
            <li><strong>Número de huéspedes:</strong> ${reservation.numberOfGuests}</li>
            <li><strong>Notas adicionales:</strong> ${reservation.notes || 'Ninguna'}</li>
          </ul>
          
          <p>Por favor, accede a la <a href="${process.env.APP_URL || 'http://localhost:5000'}/admin">plataforma de administración</a> para gestionar esta solicitud.</p>
          
          <p>Gracias,<br>Sistema de Reservas</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log('Email de notificación enviado al administrador');
    } catch (error) {
      console.error('Error al enviar email al administrador:', error);
      throw new Error('No se pudo enviar la notificación al administrador');
    }
  }
  
  /**
   * Envía un email de confirmación al usuario cuando crea una reserva
   */
  static async sendReservationConfirmationToUser(reservation: Reservation, username: string, userEmail: string): Promise<void> {
    try {
      const startDateFormatted = formatDate(reservation.startDate.toString());
      const endDateFormatted = formatDate(reservation.endDate.toString());
      const nights = calculateNights(reservation.startDate.toString(), reservation.endDate.toString());
      
      const mailOptions = {
        from: EMAIL_FROM,
        to: userEmail,
        subject: 'Confirmación de solicitud de reserva',
        html: `
          <h1>Tu solicitud de reserva ha sido recibida</h1>
          <p>Hola ${username},</p>
          
          <p>Hemos recibido tu solicitud de reserva con los siguientes detalles:</p>
          
          <ul>
            <li><strong>Fecha de entrada:</strong> ${startDateFormatted}</li>
            <li><strong>Fecha de salida:</strong> ${endDateFormatted}</li>
            <li><strong>Duración:</strong> ${nights} noche${nights !== 1 ? 's' : ''}</li>
            <li><strong>Número de huéspedes:</strong> ${reservation.numberOfGuests}</li>
            <li><strong>Notas adicionales:</strong> ${reservation.notes || 'Ninguna'}</li>
          </ul>
          
          <p>Tu reserva está pendiente de aprobación. Te notificaremos cuando sea aprobada o rechazada.</p>
          
          <p>Gracias por tu reserva,<br>Sistema de Reservas</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log('Email de confirmación enviado al usuario');
    } catch (error) {
      console.error('Error al enviar email al usuario:', error);
      throw new Error('No se pudo enviar la confirmación al usuario');
    }
  }
  
  /**
   * Envía un email al usuario cuando el administrador cambia el estado de la reserva
   */
  static async sendReservationStatusUpdateToUser(
    reservation: Reservation, 
    username: string, 
    userEmail: string,
    adminMessage: string = ""
  ): Promise<void> {
    try {
      const startDateFormatted = formatDate(reservation.startDate.toString());
      const endDateFormatted = formatDate(reservation.endDate.toString());
      const nights = calculateNights(reservation.startDate.toString(), reservation.endDate.toString());
      
      const statusText = reservation.status === 'approved' 
        ? 'aprobada' 
        : reservation.status === 'rejected' 
          ? 'rechazada' 
          : 'actualizada';
      
      const statusMessage = reservation.status === 'approved'
        ? 'Ha sido aprobada. Te esperamos en la casa de Tamariu.'
        : 'Ha sido rechazada. Por favor, intenta reservar en otras fechas o contacta con el administrador para más información.';
      
      const mailOptions = {
        from: EMAIL_FROM,
        to: userEmail,
        subject: `Tu reserva ha sido ${statusText}`,
        html: `
          <h1>Actualización de estado de tu reserva</h1>
          <p>Hola ${username},</p>
          
          <p>El estado de tu reserva ha cambiado.</p>
          
          <ul>
            <li><strong>Fecha de entrada:</strong> ${startDateFormatted}</li>
            <li><strong>Fecha de salida:</strong> ${endDateFormatted}</li>
            <li><strong>Duración:</strong> ${nights} noche${nights !== 1 ? 's' : ''}</li>
            <li><strong>Número de huéspedes:</strong> ${reservation.numberOfGuests}</li>
            <li><strong>Estado:</strong> <strong>${statusText.toUpperCase()}</strong></li>
          </ul>
          
          <p>${statusMessage}</p>
          
          ${adminMessage ? `<p><strong>Mensaje del administrador:</strong> ${adminMessage}</p>` : ''}
          
          <p>Gracias,<br>Sistema de Reservas</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`Email de actualización de estado (${statusText}) enviado al usuario`);
    } catch (error) {
      console.error('Error al enviar email de actualización al usuario:', error);
      throw new Error('No se pudo enviar la notificación de actualización al usuario');
    }
  }
  
  /**
   * Método de prueba para verificar la configuración del email
   */
  static async sendTestEmail(to: string): Promise<void> {
    try {
      const mailOptions = {
        from: EMAIL_FROM,
        to,
        subject: 'Prueba de sistema de notificaciones',
        html: `
          <h1>Prueba de email</h1>
          <p>Este es un correo de prueba para verificar que el sistema de notificaciones funciona correctamente.</p>
          <p>Fecha y hora: ${new Date().toLocaleString()}</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log('Email de prueba enviado correctamente');
    } catch (error) {
      console.error('Error al enviar email de prueba:', error);
      throw new Error('No se pudo enviar el email de prueba');
    }
  }
}
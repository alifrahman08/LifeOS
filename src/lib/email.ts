import nodemailer from "nodemailer";

interface SendPasswordResetParams {
  to: string;
  name: string;
  resetUrl: string;
}

export interface SendEmailResult {
  sent: boolean;
  directLink: string;
  message?: string;
  error?: string;
}

/**
 * Kirim email pengaturan ulang kata sandi via SMTP (Nodemailer).
 * Mendukung Gmail (dengan App Password), Brevo, Mailtrap, dsb.
 * Jika SMTP_USER / SMTP_PASS belum diisi atau gagal, sistem menyediakan fallback link langsung.
 */
export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: SendPasswordResetParams): Promise<SendEmailResult> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM || `LifeOS <${user || "noreply@lifeos.id"}>`;

  // Selalu catat tautan ke server console untuk kemudahan pengujian
  console.log("==================================================================");
  console.log(`🔗 [LIFEOS PASSWORD RESET REQUEST]`);
  console.log(`Penerima  : ${name || "Pengguna"} <${to}>`);
  console.log(`Tautan URL: ${resetUrl}`);
  console.log("==================================================================");

  // Jika kredensial SMTP belum disetel
  if (!user || !pass) {
    console.log(
      "ℹ️ [LifeOS Email] SMTP_USER atau SMTP_PASS belum disetel di .env. Menggunakan fallback link di layar."
    );
    return {
      sent: false,
      directLink: resetUrl,
      message:
        "Kredensial SMTP belum diisi di file .env. Anda dapat langsung menggunakan atau menyalin tautan pemulihan di bawah ini.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Atur Ulang Kata Sandi LifeOS</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf9; margin: 0; padding: 40px 20px; color: #1c1917;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; padding: 36px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="margin-bottom: 24px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; background-color: #065f46; color: #ffffff; border-radius: 8px; text-align: center; line-height: 32px; font-weight: bold; font-size: 16px; display: inline-block;">
              L
            </div>
            <span style="font-weight: 700; font-size: 18px; color: #0f172a; margin-left: 8px;">LifeOS</span>
          </div>

          <h1 style="font-size: 20px; font-weight: 700; color: #1c1917; margin-bottom: 12px; margin-top: 0;">
            Permintaan Pengaturan Ulang Kata Sandi
          </h1>

          <p style="font-size: 14px; line-height: 1.6; color: #44403c; margin-bottom: 16px;">
            Halo <strong>${name || "Pengguna LifeOS"}</strong>,
          </p>

          <p style="font-size: 14px; line-height: 1.6; color: #44403c; margin-bottom: 24px;">
            Kami menerima permintaan untuk mengatur ulang kata sandi akun LifeOS Anda yang terdaftar pada email <strong>${to}</strong>. Klik tombol di bawah ini untuk membuat kata sandi baru:
          </p>

          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #065f46; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
              Atur Ulang Kata Sandi
            </a>
          </div>

          <p style="font-size: 12px; line-height: 1.6; color: #78716c; margin-bottom: 12px;">
            Tautan ini hanya berlaku selama <strong>1 jam</strong>. Jika tombol di atas tidak dapat diklik, salin dan buka tautan berikut di browser Anda:
          </p>

          <div style="background-color: #f5f5f4; border-radius: 8px; padding: 10px 12px; font-size: 11px; color: #065f46; word-break: break-all; margin-bottom: 24px; font-family: monospace;">
            ${resetUrl}
          </div>

          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0;" />

          <p style="font-size: 11px; line-height: 1.5; color: #a8a29e; margin: 0;">
            Jika Anda tidak merasa meminta pengaturan ulang kata sandi ini, Anda dapat mengabaikan email ini dengan aman. Kata sandi akun Anda tidak akan berubah.
          </p>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from,
      to,
      subject: "LifeOS — Pengaturan Ulang Kata Sandi Akun Anda",
      text: `Halo ${name || "Pengguna LifeOS"},\n\nKami menerima permintaan pengaturan ulang kata sandi akun LifeOS Anda (${to}).\n\nBuka tautan berikut untuk membuat kata sandi baru (berlaku 1 jam):\n${resetUrl}\n\nJika Anda tidak merasa meminta ini, abaikan pesan ini.`,
      html: htmlContent,
    });

    console.log(`✅ [LifeOS Email] Email berhasil dikirim ke ${to}: ${info.messageId}`);
    return {
      sent: true,
      directLink: resetUrl,
      message: `Tautan pemulihan telah berhasil dikirimkan ke ${to}. Silakan periksa kotak masuk (inbox) atau folder spam Anda.`,
    };
  } catch (err: any) {
    console.error("❌ [LifeOS Email] Gagal mengirim email via SMTP:", err?.message || err);
    return {
      sent: false,
      directLink: resetUrl,
      error: err?.message || "Gagal menghubungi server SMTP.",
      message:
        "Pengiriman email mengalami kendala koneksi ke server SMTP. Namun, tautan pemulihan telah dibuat dan dapat digunakan di bawah ini.",
    };
  }
}

export function verifyEmailHtml(firstName: string, otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: #1B4332; padding: 28px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">আপনখোঁজ</h1>
        <p style="color: #a7f3d0; margin: 6px 0 0; font-size: 13px;">ইমেইল যাচাইকরণ</p>
      </div>
      <div style="padding: 36px 32px; background: #ffffff; text-align: center;">
        <p style="color: #374151; font-size: 15px; margin-bottom: 8px;">প্রিয় ${firstName},</p>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 28px; line-height: 1.7;">
          আপনার অ্যাকাউন্ট সক্রিয় করতে নিচের কোডটি ব্যবহার করুন।<br/>কোডটি <strong>১৫ মিনিট</strong> পর মেয়াদ শেষ হয়ে যাবে।
        </p>
        <div style="display: inline-block; background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 16px; padding: 20px 40px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">যাচাই কোড</p>
          <p style="margin: 0; color: #1B4332; font-size: 40px; font-weight: 900; letter-spacing: 10px;">${otp}</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
          আপনি যদি এই অ্যাকাউন্ট না খুলে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।
        </p>
      </div>
      <div style="padding: 16px 32px; background: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px;">
        © 2026 আপনখোঁজ — সবার জন্য, সবসময়
      </div>
    </div>
  `;
}

export function otpEmailHtml(firstName: string, otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: #1d4ed8; padding: 28px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">আপনখোঁজ</h1>
        <p style="color: #bfdbfe; margin: 6px 0 0; font-size: 13px;">পাসওয়ার্ড রিসেট অনুরোধ</p>
      </div>
      <div style="padding: 36px 32px; background: #ffffff; text-align: center;">
        <p style="color: #374151; font-size: 15px; margin-bottom: 8px;">প্রিয় ${firstName},</p>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 28px; line-height: 1.7;">
          আপনার পাসওয়ার্ড রিসেট করার জন্য নিচের কোডটি ব্যবহার করুন।<br/>কোডটি <strong>১৫ মিনিট</strong> পর মেয়াদ শেষ হয়ে যাবে।
        </p>
        <div style="display: inline-block; background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 16px; padding: 20px 40px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">আপনার কোড</p>
          <p style="margin: 0; color: #1d4ed8; font-size: 40px; font-weight: 900; letter-spacing: 10px;">${otp}</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
          আপনি যদি এই অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।<br/>
          আপনার অ্যাকাউন্ট সম্পূর্ণ নিরাপদ।
        </p>
      </div>
      <div style="padding: 16px 32px; background: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px;">
        © 2026 আপনখোঁজ — সবার জন্য, সবসময়
      </div>
    </div>
  `;
}
